import express from 'express';
import { Transaction, Vendor, User } from '../models/index.js';
import { FXService } from '../services/fxService.js';
import { BlockchainService } from '../services/blockchainService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import crypto from 'crypto';

const router = express.Router();

// Create transaction
router.post('/', authenticateToken, validate(schemas.transactionCreate), async (req, res) => {
  try {
    const { vendor_id, amount_ghs, payment_type, metadata } = req.body;
    const buyer_id = req.user.id;

    // Verify vendor exists and is active
    const vendor = await Vendor.findOne({
      where: { id: vendor_id, status: 'active' },
      include: [{ model: User, as: 'user' }]
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found or inactive' }
      });
    }

    // Get current exchange rate
    const fxResult = await FXService.convertAmount(amount_ghs, 'GHS', 'USD');
    const amount_usdc = fxResult.data.convertedAmount;
    const fx_rate = fxResult.data.rate;

    // Calculate platform fee (0.25%)
    const platform_fee = Math.round(amount_usdc * 0.0025 * 1000000) / 1000000;
    const vendor_amount = amount_usdc - platform_fee;

    // Generate order ID
    const order_id = crypto.randomBytes(32).toString('hex');

    // Create transaction
    const transaction = await Transaction.create({
      order_id,
      buyer_id,
      vendor_id,
      vendor_ens: vendor.ens_name,
      amount_ghs,
      amount_usdc,
      fx_rate,
      platform_fee,
      vendor_amount,
      payment_type,
      metadata: metadata || {},
      status: 'pending'
    });

    // Fetch complete transaction with relations
    const completeTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name', 'wallet_address']
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'ens_name', 'business_name', 'business_logo']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: {
        transaction: completeTransaction,
        message: 'Transaction created successfully'
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create transaction' }
    });
  }
});

// Get transaction by order ID
router.get('/order/:orderId', optionalAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const transaction = await Transaction.findOne({
      where: { order_id: orderId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name', 'wallet_address']
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'ens_name', 'business_name', 'business_logo']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    // Check if user can view this transaction
    if (req.user && req.user.id !== transaction.buyer_id && req.user.id !== transaction.vendor.user_id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch transaction' }
    });
  }
});

// Update transaction status
router.put('/:transactionId/status', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, tx_hash, block_number, gas_used, gas_price, failure_reason } = req.body;

    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          as: 'buyer'
        },
        {
          model: Vendor,
          as: 'vendor'
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    // Check permissions
    const isBuyer = req.user.id === transaction.buyer_id;
    const isVendor = req.user.id === transaction.vendor.user_id;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['completed', 'failed'],
      'completed': ['refunded'],
      'failed': ['pending'],
      'refunded': []
    };

    if (!validTransitions[transaction.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status transition' }
      });
    }

    // Update transaction
    const updateData = { status };
    if (tx_hash) updateData.tx_hash = tx_hash;
    if (block_number) updateData.block_number = block_number;
    if (gas_used) updateData.gas_used = gas_used;
    if (gas_price) updateData.gas_price = gas_price;
    if (failure_reason) updateData.failure_reason = failure_reason;

    if (status === 'completed') {
      updateData.completed_at = new Date();
    } else if (status === 'refunded') {
      updateData.refunded_at = new Date();
    }

    await transaction.update(updateData);

    // Update vendor earnings if completed
    if (status === 'completed') {
      await vendor.update({
        total_earnings: parseFloat(vendor.total_earnings) + parseFloat(transaction.vendor_amount),
        total_transactions: vendor.total_transactions + 1
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update transaction status' }
    });
  }
});

// Get user's transactions
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status, payment_type } = req.query;
    const offset = (page - 1) * limit;

    // Check permissions
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const whereClause = { buyer_id: userId };
    if (status) whereClause.status = status;
    if (payment_type) whereClause.payment_type = payment_type;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'ens_name', 'business_name', 'business_logo']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch transactions' }
    });
  }
});

// Get vendor's transactions
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { vendor_id: vendorId };
    if (status) whereClause.status = status;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vendor transactions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendor transactions' }
    });
  }
});

// Get transaction statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's transaction stats
    const { fn, col } = await import('sequelize');
    const userStats = await Transaction.findAll({
      where: { buyer_id: userId },
      attributes: [
        [fn('COUNT', col('id')), 'total_transactions'],
        [fn('SUM', col('amount_usdc')), 'total_spent'],
        [fn('AVG', col('amount_usdc')), 'average_transaction'],
        [fn('MAX', col('created_at')), 'last_transaction']
      ],
      raw: true
    });

    // Get vendor stats if user is a vendor
    let vendorStats = null;
    const vendor = await Vendor.findOne({ where: { user_id: userId } });
    if (vendor) {
      vendorStats = await Transaction.findAll({
        where: { vendor_id: vendor.id },
        attributes: [
          [fn('COUNT', col('id')), 'total_sales'],
          [fn('SUM', col('vendor_amount')), 'total_earnings'],
          [fn('AVG', col('vendor_amount')), 'average_sale']
        ],
        raw: true
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          total_transactions: parseInt(userStats[0]?.total_transactions) || 0,
          total_spent: parseFloat(userStats[0]?.total_spent) || 0,
          average_transaction: parseFloat(userStats[0]?.average_transaction) || 0,
          last_transaction: userStats[0]?.last_transaction
        },
        vendor: vendorStats ? {
          total_sales: parseInt(vendorStats[0]?.total_sales) || 0,
          total_earnings: parseFloat(vendorStats[0]?.total_earnings) || 0,
          average_sale: parseFloat(vendorStats[0]?.average_sale) || 0
        } : null
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch transaction statistics' }
    });
  }
});

export default router;
