import request from 'supertest';
import app from '../src/app.js';
import { Menu } from '../src/models/index.js';

describe('Menu Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/menu/vendor/:vendorId', () => {
    it('should return vendor menu items', async () => {
      const mockMenuItems = [
        {
          id: 1,
          item_id: 'coffee-001',
          name: 'Espresso',
          description: 'Rich and bold espresso',
          price_ghs: 5.00,
          category: 'Beverages',
          image_url: 'https://example.com/espresso.jpg',
          sort_order: 1
        },
        {
          id: 2,
          item_id: 'coffee-002',
          name: 'Cappuccino',
          description: 'Espresso with steamed milk',
          price_ghs: 7.50,
          category: 'Beverages',
          image_url: 'https://example.com/cappuccino.jpg',
          sort_order: 2
        }
      ];

      Menu.findAll.mockResolvedValue(mockMenuItems);

      const response = await request(app)
        .get('/api/menu/vendor/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItems).toHaveLength(2);
      expect(response.body.data.menuItems[0].name).toBe('Espresso');
    });

    it('should return empty menu for vendor with no items', async () => {
      Menu.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/menu/vendor/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItems).toHaveLength(0);
    });
  });

  describe('POST /api/menu', () => {
    it('should create menu item successfully', async () => {
      const menuItemData = {
        item_id: 'coffee-003',
        name: 'Latte',
        description: 'Espresso with lots of steamed milk',
        price_ghs: 8.00,
        category: 'Beverages',
        image_url: 'https://example.com/latte.jpg',
        sort_order: 3
      };

      const mockMenuItem = {
        id: 3,
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        ...menuItemData
      };

      Menu.findOne.mockResolvedValue(null); // No existing item
      Menu.create.mockResolvedValue(mockMenuItem);

      const response = await request(app)
        .post('/api/menu')
        .set('Authorization', 'Bearer valid-token')
        .send(menuItemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItem).toBeDefined();
    });

    it('should return validation error for invalid data', async () => {
      const menuItemData = {
        item_id: '', // Empty item ID
        name: '', // Empty name
        price_ghs: -5.00 // Negative price
      };

      const response = await request(app)
        .post('/api/menu')
        .set('Authorization', 'Bearer valid-token')
        .send(menuItemData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('PUT /api/menu/:itemId', () => {
    it('should update menu item successfully', async () => {
      const updateData = {
        name: 'Updated Latte',
        price_ghs: 9.00
      };

      const mockMenuItem = {
        id: 3,
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        item_id: 'coffee-003',
        update: jest.fn().mockResolvedValue(true)
      };

      Menu.findOne.mockResolvedValue(mockMenuItem);

      const response = await request(app)
        .put('/api/menu/3')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.menuItem).toBeDefined();
      expect(mockMenuItem.update).toHaveBeenCalledWith(updateData);
    });

    it('should return 404 for non-existent menu item', async () => {
      Menu.findOne.mockResolvedValue(null);

      const updateData = { name: 'Updated Item' };

      const response = await request(app)
        .put('/api/menu/999')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Menu item not found');
    });
  });

  describe('DELETE /api/menu/:itemId', () => {
    it('should delete menu item successfully', async () => {
      const mockMenuItem = {
        id: 3,
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        item_id: 'coffee-003',
        destroy: jest.fn().mockResolvedValue(true)
      };

      Menu.findOne.mockResolvedValue(mockMenuItem);

      const response = await request(app)
        .delete('/api/menu/3')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Menu item deleted successfully');
      expect(mockMenuItem.destroy).toHaveBeenCalled();
    });

    it('should return 404 for non-existent menu item', async () => {
      Menu.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/menu/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Menu item not found');
    });
  });
});
