import request from 'supertest';
import app from '../src/app.js';
import { User, Vendor } from '../src/models/index.js';
import { EFPService } from '../src/services/efpService.js';
import { EFPasService } from '../src/services/efpasService.js';

describe('Vendor Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/vendor/register', () => {
    it('should register a new vendor successfully', async () => {
      const vendorData = {
        ens_name: 'test.tapngo.eth',
        business_name: 'Test Business',
        business_description: 'A test business',
        business_category: 'Food',
        business_website: 'https://test.com',
        business_logo: 'https://test.com/logo.png',
        phone: '+1234567890'
      };

      const mockUser = {
        id: 1,
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        phone_verified: true
      };

      const mockVendor = {
        id: 1,
        ...vendorData,
        user_id: 1,
        status: 'pending',
        toJSON: () => ({ id: 1, ...vendorData, user_id: 1, status: 'pending' })
      };

      Vendor.findOne
        .mockResolvedValueOnce(null) // Check for existing vendor
        .mockResolvedValueOnce(null); // Check for ENS name conflict

      Vendor.create.mockResolvedValue(mockVendor);
      Vendor.findByPk.mockResolvedValue({
        ...mockVendor,
        user: mockUser
      });

      EFPService.verifyEFP.mockResolvedValue({ verified: true });
      EFPasService.getEFPasScore.mockResolvedValue({ data: { score: 150 } });

      const response = await request(app)
        .post('/api/vendor/register')
        .set('Authorization', 'Bearer valid-token')
        .send(vendorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.message).toBe('Vendor registration submitted for review');
    });

    it('should return error if user already has vendor profile', async () => {
      const vendorData = {
        ens_name: 'test.tapngo.eth',
        business_name: 'Test Business',
        phone: '+1234567890'
      };

      Vendor.findOne.mockResolvedValue({ id: 1, user_id: 1 });

      const response = await request(app)
        .post('/api/vendor/register')
        .set('Authorization', 'Bearer valid-token')
        .send(vendorData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User already has a vendor profile');
    });

    it('should return error if ENS name already taken', async () => {
      const vendorData = {
        ens_name: 'existing.tapngo.eth',
        business_name: 'Test Business',
        phone: '+1234567890'
      };

      Vendor.findOne
        .mockResolvedValueOnce(null) // No existing vendor
        .mockResolvedValueOnce({ id: 1, ens_name: 'existing.tapngo.eth' }); // ENS exists

      const response = await request(app)
        .post('/api/vendor/register')
        .set('Authorization', 'Bearer valid-token')
        .send(vendorData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('ENS name already taken');
    });

    it('should return validation error for invalid data', async () => {
      const vendorData = {
        ens_name: 'invalid-ens', // Invalid format
        business_name: '', // Empty
        phone: '1234567890' // Invalid format
      };

      const response = await request(app)
        .post('/api/vendor/register')
        .set('Authorization', 'Bearer valid-token')
        .send(vendorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('GET /api/vendor/profile', () => {
    it('should return vendor profile', async () => {
      const mockVendor = {
        id: 1,
        ens_name: 'test.tapngo.eth',
        business_name: 'Test Business',
        status: 'active'
      };

      const response = await request(app)
        .get('/api/vendor/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
    });
  });

  describe('PUT /api/vendor/profile', () => {
    it('should update vendor profile successfully', async () => {
      const updateData = {
        business_name: 'Updated Business Name',
        business_description: 'Updated description'
      };

      const mockVendor = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };

      const updatedVendor = {
        id: 1,
        ...updateData,
        user: { id: 1, first_name: 'John', last_name: 'Doe' }
      };

      Vendor.findByPk.mockResolvedValue(updatedVendor);

      const response = await request(app)
        .put('/api/vendor/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(mockVendor.update).toHaveBeenCalledWith(updateData);
    });

    it('should return validation error for invalid data', async () => {
      const updateData = {
        business_name: '', // Empty name
        business_website: 'invalid-url' // Invalid URL
      };

      const response = await request(app)
        .put('/api/vendor/profile')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('GET /api/vendor', () => {
    it('should return paginated vendors list', async () => {
      const mockVendors = [
        {
          id: 1,
          ens_name: 'vendor1.tapngo.eth',
          business_name: 'Vendor 1',
          status: 'active',
          user: { id: 1, first_name: 'John', last_name: 'Doe' }
        },
        {
          id: 2,
          ens_name: 'vendor2.tapngo.eth',
          business_name: 'Vendor 2',
          status: 'active',
          user: { id: 2, first_name: 'Jane', last_name: 'Smith' }
        }
      ];

      Vendor.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockVendors
      });

      const response = await request(app)
        .get('/api/vendor')
        .query({ page: 1, limit: 20, status: 'active' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter vendors by category', async () => {
      const mockVendors = [
        {
          id: 1,
          ens_name: 'food.tapngo.eth',
          business_name: 'Food Vendor',
          business_category: 'Food',
          status: 'active'
        }
      ];

      Vendor.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockVendors
      });

      const response = await request(app)
        .get('/api/vendor')
        .query({ category: 'Food' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toHaveLength(1);
    });

    it('should search vendors by name', async () => {
      const mockVendors = [
        {
          id: 1,
          ens_name: 'coffee.tapngo.eth',
          business_name: 'Coffee Shop',
          status: 'active'
        }
      ];

      Vendor.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockVendors
      });

      const response = await request(app)
        .get('/api/vendor')
        .query({ search: 'coffee' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendors).toHaveLength(1);
    });
  });

  describe('GET /api/vendor/ens/:ensName', () => {
    it('should return vendor by ENS name', async () => {
      const mockVendor = {
        id: 1,
        ens_name: 'test.tapngo.eth',
        business_name: 'Test Business',
        status: 'active',
        user: { id: 1, first_name: 'John', last_name: 'Doe' }
      };

      Vendor.findOne.mockResolvedValue(mockVendor);

      const response = await request(app)
        .get('/api/vendor/ens/test.tapngo.eth')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vendor).toBeDefined();
      expect(response.body.data.vendor.ens_name).toBe('test.tapngo.eth');
    });

    it('should return 404 for non-existent vendor', async () => {
      Vendor.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/vendor/ens/nonexistent.tapngo.eth')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Vendor not found');
    });
  });

  describe('GET /api/vendor/stats', () => {
    it('should return vendor statistics', async () => {
      const mockStats = [
        {
          total_transactions: 10,
          total_earnings: 1000.50,
          average_transaction: 100.05,
          last_transaction: new Date()
        }
      ];

      const { Transaction } = await import('../src/models/index.js');
      Transaction.findAll.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/vendor/stats')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_transactions).toBe(10);
      expect(response.body.data.total_earnings).toBe(1000.50);
    });
  });
});
