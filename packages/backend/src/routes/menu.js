import express from 'express';
import { Menu, Vendor } from '../models/index.js';
import { authenticateToken, requireVendor } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Get vendor's menu items
router.get('/', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { category, available_only = true } = req.query;
    
    const whereClause = { vendor_id: req.vendor.id };
    if (available_only === 'true') whereClause.is_available = true;
    if (category) whereClause.category = category;

    const menuItems = await Menu.findAll({
      where: whereClause,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { menuItems }
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch menu items' }
    });
  }
});

// Get public menu for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { category } = req.query;

    const whereClause = { 
      vendor_id: vendorId,
      is_available: true
    };
    if (category) whereClause.category = category;

    const menuItems = await Menu.findAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['id', 'ens_name', 'business_name', 'business_logo']
        }
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: { menuItems }
    });
  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch menu items' }
    });
  }
});

// Create menu item
router.post('/', authenticateToken, requireVendor, validate(schemas.menuItem), async (req, res) => {
  try {
    const { item_id, name, description, price_ghs, category, image_url, sort_order } = req.body;

    // Check if item_id already exists for this vendor
    const existingItem = await Menu.findOne({
      where: { vendor_id: req.vendor.id, item_id }
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        error: { message: 'Item ID already exists for this vendor' }
      });
    }

    const menuItem = await Menu.create({
      vendor_id: req.vendor.id,
      item_id,
      name,
      description,
      price_ghs,
      category,
      image_url,
      sort_order: sort_order || 0
    });

    res.status(201).json({
      success: true,
      data: { menuItem }
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create menu item' }
    });
  }
});

// Update menu item
router.put('/:itemId', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, price_ghs, category, image_url, is_available, sort_order } = req.body;

    const menuItem = await Menu.findOne({
      where: { id: itemId, vendor_id: req.vendor.id }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Menu item not found' }
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price_ghs) updateData.price_ghs = price_ghs;
    if (category) updateData.category = category;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_available !== undefined) updateData.is_available = is_available;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    await menuItem.update(updateData);

    res.json({
      success: true,
      data: { menuItem }
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update menu item' }
    });
  }
});

// Delete menu item
router.delete('/:itemId', authenticateToken, requireVendor, async (req, res) => {
  try {
    const { itemId } = req.params;

    const menuItem = await Menu.findOne({
      where: { id: itemId, vendor_id: req.vendor.id }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Menu item not found' }
      });
    }

    await menuItem.destroy();

    res.json({
      success: true,
      data: { message: 'Menu item deleted successfully' }
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete menu item' }
    });
  }
});

// Get menu categories
router.get('/categories', async (req, res) => {
  try {
    const { vendorId } = req.query;
    
    const whereClause = { is_available: true };
    if (vendorId) whereClause.vendor_id = vendorId;

    const categories = await Menu.findAll({
      where: whereClause,
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    res.json({
      success: true,
      data: { 
        categories: categories.map(item => item.category).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch categories' }
    });
  }
});

export default router;
