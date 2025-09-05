import express from 'express';
import jwt from 'jsonwebtoken';
import { User, OTP } from '../models/index.js';
import { SMSService } from '../services/smsService.js';
import { EFPService } from '../services/efpService.js';
import { EFPasService } from '../services/efpasService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import crypto from 'crypto';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// User signup
router.post('/signup', validate(schemas.userSignup), async (req, res) => {
  try {
    const { wallet_address, email, phone, password, social_provider, social_id, first_name, last_name, profile_picture } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          wallet_address && { wallet_address },
          email && { email },
          phone && { phone }
        ].filter(Boolean)
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'User already exists with this identifier' }
      });
    }

    // Create user
    const user = await User.create({
      wallet_address,
      email,
      phone,
      password_hash: password,
      social_provider,
      social_id,
      first_name,
      last_name,
      profile_picture,
      phone_verified: !phone // If no phone, consider verified
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        requiresPhoneVerification: !!phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create user account' }
    });
  }
});

// User login
router.post('/login', validate(schemas.userLogin), async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by identifier
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: identifier },
          { phone: identifier },
          { wallet_address: identifier }
        ]
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Validate password if provided
    if (password && !(await user.validatePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Update login info
    await user.update({
      last_login: new Date(),
      login_count: user.login_count + 1
    });

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, type = 'phone_verification' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone number is required' }
      });
    }

    // Validate phone format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid phone number format' }
      });
    }

    // Set IP and user agent for OTP
    const otpData = {
      phone,
      type,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const result = await SMSService.sendOTP(phone, type);

    res.json({
      success: true,
      data: {
        message: 'Verification code sent successfully',
        expiresIn: result.expiresIn
      }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send verification code' }
    });
  }
});

// Verify OTP
router.post('/verify-otp', validate(schemas.otpVerification), async (req, res) => {
  try {
    const { phone, code, type } = req.body;

    const result = await SMSService.verifyOTP(phone, code, type);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.message }
      });
    }

    // If phone verification, update user
    if (type === 'phone_verification') {
      const user = await User.findOne({ where: { phone } });
      if (user) {
        await user.update({ phone_verified: true });
      }
    }

    res.json({
      success: true,
      data: {
        message: result.message,
        verified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify code' }
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: require('../models/index.js').Vendor,
          as: 'vendorProfile'
        }
      ]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch profile' }
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user.id);
    
    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to refresh token' }
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

export default router;
