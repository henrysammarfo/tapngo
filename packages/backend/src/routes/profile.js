import express from 'express';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: (await import('../models/index.js')).Vendor,
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

// Update user profile
router.put('/', authenticateToken, validate(schemas.profileUpdate), async (req, res) => {
  try {
    const { first_name, last_name, profile_picture } = req.body;
    
    const updateData = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (profile_picture) updateData.profile_picture = profile_picture;

    await User.update(updateData, { where: { id: req.user.id } });

    // Fetch updated user
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' }
    });
  }
});

export default router;