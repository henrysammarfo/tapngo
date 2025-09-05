import express from 'express';
import crypto from 'crypto';
import { User, Vendor } from '../models/index.js';
import { EFPService } from '../services/efpService.js';
import { EFPasService } from '../services/efpasService.js';
import { authenticateToken, requireVendor } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Register as vendor
router.post('/register', authenticateToken, validate(schemas.vendorRegistration), async (req, res) => {
  try {
    const { ens_name, business_name, business_description, business_category, business_website, business_logo, phone } = req.body;
    const userId = req.user.id;

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ where: { user_id: userId } });
    if (existingVendor) {
      return res.status(409).json({
        success: false,
        error: { message: 'User already has a vendor profile' }
      });
    }

    // Check if ENS name is already taken
    const ensExists = await Vendor.findOne({ where: { ens_name } });
    if (ensExists) {
      return res.status(409).json({
        success: false,
        error: { message: 'ENS name already taken' }
      });
    }

    // Hash phone number for privacy
    const phoneHash = crypto.createHash('sha256').update(phone).digest('hex');

    // Check if phone hash already exists
    const phoneExists = await Vendor.findOne({ where: { phone_hash: phoneHash } });
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        error: { message: 'Phone number already registered' }
      });
    }

    // Verify EFP if wallet address exists
    let efpVerified = false;
    let efpasScore = 0;
    
    if (req.user.wallet_address) {
      try {
        const efpResult = await EFPService.verifyEFP(req.user.wallet_address);
        efpVerified = efpResult.verified;

        const efpasResult = await EFPasService.getEFPasScore(req.user.wallet_address);
        efpasScore = efpasResult.data?.score || 0;
      } catch (error) {
        console.error('EFP/EFPas verification error:', error);
        // Continue with registration even if verification fails
      }
    }

    // Create vendor profile
    const vendor = await Vendor.create({
      user_id: userId,
      ens_name,
      business_name,
      business_description,
      business_category,
      business_website,
      business_logo,
      phone_hash: phoneHash,
      phone_verified: req.user.phone_verified,
      efp_verified: efpVerified,
      efpas_score: efpasScore,
      status: 'pending'
    });

    // Fetch the created vendor with user data
    const vendorWithUser = await Vendor.findByPk(vendor.id, {
      include: [{ model: User, as: 'user' }]
    });

    res.status(201).json({
      success: true,
      data: {
        vendor: vendorWithUser,
        message: 'Vendor registration submitted for review'
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to register vendor' }
    });
  }
});

// Get vendor profile
router.get('/profile', authenticateToken, requireVendor, async (req, res) => {
  try {
    res.json({
      success: true,
      data: { vendor: req.vendor }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendor profile' }
    });
  }
});

// Update vendor profile
router.put('/profile', authenticateToken, requireVendor, validate(schemas.profileUpdate), async (req, res) => {
  try {
    const { business_name, business_description, business_category, business_website, business_logo } = req.body;
    
    // Only allow updates to certain fields
    const updateData = {};
    if (business_name) updateData.business_name = business_name;
    if (business_description) updateData.business_description = business_description;
    if (business_category) updateData.business_category = business_category;
    if (business_website) updateData.business_website = business_website;
    if (business_logo) updateData.business_logo = business_logo;

    await req.vendor.update(updateData);

    // Fetch updated vendor
    const updatedVendor = await Vendor.findByPk(req.vendor.id, {
      include: [{ model: User, as: 'user' }]
    });

    res.json({
      success: true,
      data: { vendor: updatedVendor }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update vendor profile' }
    });
  }
});

// Get all vendors (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'active', category, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status };
    if (category) whereClause.business_category = category;
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { business_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { business_description: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: vendors } = await Vendor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendors' }
    });
  }
});

// Get vendor by ENS name
router.get('/ens/:ensName', async (req, res) => {
  try {
    const { ensName } = req.params;

    const vendor = await Vendor.findOne({
      where: { ens_name: ensName, status: 'active' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'profile_picture']
        }
      ]
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    console.error('Get vendor by ENS error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendor' }
    });
  }
});

// Get vendor statistics
router.get('/stats', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { Transaction } = await import('../models/index.js');
    
    const stats = await Transaction.findAll({
      where: { vendor_id: req.vendor.id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_transactions'],
        [require('sequelize').fn('SUM', require('sequelize').col('vendor_amount')), 'total_earnings'],
        [require('sequelize').fn('AVG', require('sequelize').col('vendor_amount')), 'average_transaction'],
        [require('sequelize').fn('MAX', require('sequelize').col('created_at')), 'last_transaction']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_transactions: parseInt(stats[0]?.total_transactions) || 0,
        total_earnings: parseFloat(stats[0]?.total_earnings) || 0,
        average_transaction: parseFloat(stats[0]?.average_transaction) || 0,
        last_transaction: stats[0]?.last_transaction
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendor statistics' }
    });
  }
});

export default router;
