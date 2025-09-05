import request from 'supertest';
import app from '../src/app.js';
import { Transaction, Vendor, User } from '../src/models/index.js';
import { FXService } from '../src/services/fxService.js';

describe('Transaction Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const transactionData = {
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        amount_ghs: 100,
        payment_type: 'quick_pay',
        metadata: { items: [{ name: 'Coffee', price: 5 }] }
      };

      const mockVendor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ens_name: 'coffee.tapngo.eth',
        business_name: 'Coffee Shop',
        status: 'active',
        user: { id: 2, first_name: 'Jane', last_name: 'Smith' }
      };

      const mockTransaction = {
        id: 1,
        order_id: 'test-order-id',
        buyer_id: 1,
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        amount_ghs: 100,
        amount_usdc: 100,
        fx_rate: 1.0,
        platform_fee: 0.25,
        vendor_amount: 99.75,
        payment_type: 'quick_pay',
        status: 'pending',
        buyer: { id: 1, first_name: 'John', last_name: 'Doe' },
        vendor: { id: '123e4567-e89b-12d3-a456-426614174000', ens_name: 'coffee.tapngo.eth' }
      };

      Vendor.findOne.mockResolvedValue(mockVendor);
      FXService.convertAmount.mockResolvedValue({
        data: { convertedAmount: 100, rate: 1.0 }
      });
      Transaction.create.mockResolvedValue(mockTransaction);
      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer valid-token')
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction).toBeDefined();
      expect(response.body.data.message).toBe('Transaction created successfully');
    });

    it('should return error for inactive vendor', async () => {
      const transactionData = {
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        amount_ghs: 100,
        payment_type: 'quick_pay'
      };

      Vendor.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer valid-token')
        .send(transactionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Vendor not found or inactive');
    });

    it('should return validation error for invalid data', async () => {
      const transactionData = {
        vendor_id: 'invalid-uuid',
        amount_ghs: -10, // Negative amount
        payment_type: 'invalid_type'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer valid-token')
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('GET /api/transactions/order/:orderId', () => {
    it('should return transaction by order ID', async () => {
      const mockTransaction = {
        id: 1,
        order_id: 'test-order-id',
        buyer_id: 1,
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        amount_ghs: 100,
        status: 'pending',
        buyer: { id: 1, first_name: 'John', last_name: 'Doe' },
        vendor: { id: '123e4567-e89b-12d3-a456-426614174000', ens_name: 'coffee.tapngo.eth' }
      };

      Transaction.findOne.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .get('/api/transactions/order/test-order-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction).toBeDefined();
      expect(response.body.data.transaction.order_id).toBe('test-order-id');
    });

    it('should return 404 for non-existent transaction', async () => {
      Transaction.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transactions/order/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Transaction not found');
    });

    it('should return 403 for unauthorized access', async () => {
      const mockTransaction = {
        id: 1,
        order_id: 'test-order-id',
        buyer_id: 2, // Different buyer
        vendor_id: '123e4567-e89b-12d3-a456-426614174000',
        vendor: { user_id: 3 } // Different vendor
      };

      Transaction.findOne.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .get('/api/transactions/order/test-order-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Access denied');
    });
  });

  describe('PUT /api/transactions/:transactionId/status', () => {
    it('should update transaction status successfully', async () => {
      const mockTransaction = {
        id: 1,
        buyer_id: 1,
        vendor: { user_id: 1 },
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };

      const mockVendor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        total_earnings: 0,
        total_transactions: 0,
        update: jest.fn().mockResolvedValue(true)
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);
      Vendor.findByPk = jest.fn().mockResolvedValue(mockVendor);

      const updateData = {
        status: 'completed',
        tx_hash: '0x1234567890abcdef',
        block_number: 12345,
        gas_used: 21000,
        gas_price: '20000000000'
      };

      const response = await request(app)
        .put('/api/transactions/1/status')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should return error for invalid status transition', async () => {
      const mockTransaction = {
        id: 1,
        buyer_id: 1,
        vendor: { user_id: 1 },
        status: 'completed' // Already completed
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const updateData = {
        status: 'pending' // Invalid transition from completed to pending
      };

      const response = await request(app)
        .put('/api/transactions/1/status')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid status transition');
    });

    it('should return 403 for unauthorized access', async () => {
      const mockTransaction = {
        id: 1,
        buyer_id: 2, // Different buyer
        vendor: { user_id: 3 }, // Different vendor
        status: 'pending'
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const updateData = { status: 'completed' };

      const response = await request(app)
        .put('/api/transactions/1/status')
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Access denied');
    });
  });

  describe('GET /api/transactions/user/:userId', () => {
    it('should return user transactions with pagination', async () => {
      const mockTransactions = [
        {
          id: 1,
          order_id: 'order-1',
          amount_ghs: 100,
          status: 'completed',
          vendor: { id: '123e4567-e89b-12d3-a456-426614174000', ens_name: 'coffee.tapngo.eth' }
        },
        {
          id: 2,
          order_id: 'order-2',
          amount_ghs: 50,
          status: 'pending',
          vendor: { id: '123e4567-e89b-12d3-a456-426614174001', ens_name: 'food.tapngo.eth' }
        }
      ];

      Transaction.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockTransactions
      });

      const response = await request(app)
        .get('/api/transactions/user/1')
        .set('Authorization', 'Bearer valid-token')
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter transactions by status', async () => {
      const mockTransactions = [
        {
          id: 1,
          order_id: 'order-1',
          amount_ghs: 100,
          status: 'completed',
          vendor: { id: '123e4567-e89b-12d3-a456-426614174000', ens_name: 'coffee.tapngo.eth' }
        }
      ];

      Transaction.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTransactions
      });

      const response = await request(app)
        .get('/api/transactions/user/1')
        .set('Authorization', 'Bearer valid-token')
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
    });

    it('should return 403 for unauthorized access', async () => {
      // Mock user with different ID for unauthorized access
      const { authenticateToken } = require('../src/middleware/auth.js');
      authenticateToken.mockImplementationOnce((req, res, next) => {
        req.user = { id: 1 }; // Different user ID
        next();
      });

      const response = await request(app)
        .get('/api/transactions/user/2')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Access denied');
    });
  });

  describe('GET /api/transactions/vendor/:vendorId', () => {
    it('should return vendor transactions with pagination', async () => {
      const mockTransactions = [
        {
          id: 1,
          order_id: 'order-1',
          amount_ghs: 100,
          status: 'completed',
          buyer: { id: 1, first_name: 'John', last_name: 'Doe' }
        }
      ];

      Transaction.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTransactions
      });

      const response = await request(app)
        .get('/api/transactions/vendor/123e4567-e89b-12d3-a456-426614174000')
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/transactions/stats/overview', () => {
    it('should return transaction statistics for user', async () => {
      const mockUserStats = [
        {
          total_transactions: 5,
          total_spent: 500.25,
          average_transaction: 100.05,
          last_transaction: new Date()
        }
      ];

      const mockVendorStats = [
        {
          total_sales: 3,
          total_earnings: 300.15,
          average_sale: 100.05
        }
      ];

      const { fn, col } = await import('sequelize');
      Transaction.findAll
        .mockResolvedValueOnce(mockUserStats) // User stats
        .mockResolvedValueOnce(mockVendorStats); // Vendor stats

      Vendor.findOne.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000' });

      const response = await request(app)
        .get('/api/transactions/stats/overview')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.total_transactions).toBe(5);
      expect(response.body.data.vendor.total_sales).toBe(3);
    });

    it('should return only user stats if not a vendor', async () => {
      const mockUserStats = [
        {
          total_transactions: 2,
          total_spent: 200.50,
          average_transaction: 100.25,
          last_transaction: new Date()
        }
      ];

      const { fn, col } = await import('sequelize');
      Transaction.findAll.mockResolvedValue(mockUserStats);
      Vendor.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/transactions/stats/overview')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.total_transactions).toBe(2);
      expect(response.body.data.vendor).toBeNull();
    });
  });
});
