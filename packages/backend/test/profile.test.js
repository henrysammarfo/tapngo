import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/index.js';

describe('Profile Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        phone_verified: true,
        toJSON: () => ({
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
          phone_verified: true
        })
      };

      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.first_name).toBe('John');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        first_name: 'Jane',
        last_name: 'Smith',
        profile_picture: 'https://example.com/new-avatar.jpg'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: 1,
          email: 'test@example.com',
          ...updateData
        })
      };

      User.findByPk.mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(mockUser.update).toHaveBeenCalledWith(updateData);
    });

    it('should return validation error for invalid data', async () => {
      const updateData = {
        first_name: '', // Empty name
        profile_picture: 'invalid-url' // Invalid URL
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });
});
