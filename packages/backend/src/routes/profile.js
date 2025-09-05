import express from 'express';
import { User, Vendor, Transaction } from '../models/index.js';
import { EFPService } from '../services/efpService.js';
import { EFPasService } from '../services/efpasService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Get user profile with badges
router.get('/:userId?', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'User ID is required' }
      });
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Vendor,
          as: 'vendorProfile',
          required: false
        }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Get EFP and EFPas data if wallet address exists
    let efpData = null;
    let efpasData = null;

    if (user.wallet_address) {
      try {
        const efpResult = await EFPService.verifyEFP(user.wallet_address);
        if (efpResult.success) {
          efpData = efpResult.data;
        }

        const efpasResult = await EFPasService.getEFPasScore(user.wallet_address);
        if (efpasResult.success) {
          efpasData = efpasResult.data;
        }
      } catch (error) {
        console.error('EFP/EFPas fetch error:', error);
        // Continue without EFP/EFPas data
      }
    }

    // Get transaction statistics
    const transactionStats = await Transaction.findAll({
      where: { buyer_id: userId },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_transactions'],
        [require('sequelize').fn('SUM', require('sequelize').col('amount_usdc')), 'total_spent'],
        [require('sequelize').fn('AVG', require('sequelize').col('amount_usdc')), 'average_transaction']
      ],
      raw: true
    });

    const stats = transactionStats[0] || {};

    // Build profile with badges
    const profile = {
      ...user.toJSON(),
      badges: buildBadges(user, efpData, efpasData),
      efp: efpData,
      efpas: efpasData,
      stats: {
        total_transactions: parseInt(stats.total_transactions) || 0,
        total_spent: parseFloat(stats.total_spent) || 0,
        average_transaction: parseFloat(stats.average_transaction) || 0
      }
    };

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch profile' }
    });
  }
});

// Update user profile
router.put('/update', authenticateToken, validate(schemas.profileUpdate), async (req, res) => {
  try {
    const { first_name, last_name, profile_picture } = req.body;
    
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (profile_picture) updateData.profile_picture = profile_picture;

    await req.user.update(updateData);

    res.json({
      success: true,
      data: { user: req.user.toJSON() }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' }
    });
  }
});

// Get user's transaction history
router.get('/:userId/transactions', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Check if user can view these transactions
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const whereClause = { buyer_id: userId };
    if (status) whereClause.status = status;

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

// Get user's vendor profile (if exists)
router.get('/:userId/vendor', async (req, res) => {
  try {
    const userId = req.params.userId;

    const vendor = await Vendor.findOne({
      where: { user_id: userId, status: 'active' },
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
        error: { message: 'Vendor profile not found' }
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch vendor profile' }
    });
  }
});

// Helper function to build badges
function buildBadges(user, efpData, efpasData) {
  const badges = [];

  // Phone verification badge
  if (user.phone_verified) {
    badges.push({
      name: 'Phone Verified',
      icon: '📱',
      color: '#10B981',
      description: 'Phone number verified'
    });
  }

  // Email verification badge
  if (user.email) {
    badges.push({
      name: 'Email Verified',
      icon: '📧',
      color: '#3B82F6',
      description: 'Email address verified'
    });
  }

  // Wallet connected badge
  if (user.wallet_address) {
    badges.push({
      name: 'Wallet Connected',
      icon: '🔗',
      color: '#8B5CF6',
      description: 'Blockchain wallet connected'
    });
  }

  // EFP verification badge
  if (efpData && efpData.verified) {
    badges.push({
      name: 'EFP Verified',
      icon: '✅',
      color: '#F59E0B',
      description: 'Ethereum Follow Protocol verified'
    });
  }

  // EFPas score badges
  if (efpasData && efpasData.score > 0) {
    const level = efpasData.level;
    const levelInfo = {
      diamond: { icon: '💎', color: '#B9F2FF', name: 'Diamond' },
      platinum: { icon: '🏆', color: '#E5E4E2', name: 'Platinum' },
      gold: { icon: '🥇', color: '#FFD700', name: 'Gold' },
      silver: { icon: '🥈', color: '#C0C0C0', name: 'Silver' },
      bronze: { icon: '🥉', color: '#CD7F32', name: 'Bronze' }
    };

    const levelData = levelInfo[level] || levelInfo.bronze;
    
    badges.push({
      name: `EFPas ${levelData.name}`,
      icon: levelData.icon,
      color: levelData.color,
      description: `EFPas score: ${efpasData.score}`,
      score: efpasData.score
    });
  }

  // Vendor badge
  if (user.vendorProfile) {
    badges.push({
      name: 'Verified Vendor',
      icon: '🏪',
      color: '#10B981',
      description: 'Registered Tap&Go vendor'
    });
  }

  // Transaction badges
  if (user.stats && user.stats.total_transactions > 0) {
    if (user.stats.total_transactions >= 100) {
      badges.push({
        name: 'Power User',
        icon: '⚡',
        color: '#F59E0B',
        description: '100+ transactions completed'
      });
    } else if (user.stats.total_transactions >= 10) {
      badges.push({
        name: 'Active User',
        icon: '🔥',
        color: '#EF4444',
        description: '10+ transactions completed'
      });
    } else {
      badges.push({
        name: 'New User',
        icon: '🌟',
        color: '#8B5CF6',
        description: 'First transaction completed'
      });
    }
  }

  return badges;
}

export default router;
