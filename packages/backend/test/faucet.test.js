import request from 'supertest';
import app from '../src/app.js';
import { BlockchainService } from '../src/services/blockchainService.js';

describe('Faucet Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limiter for each test
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('POST /api/faucet/request', () => {
    it('should request faucet tokens successfully', async () => {
      const faucetData = {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
      };

      // Mock blockchain service methods
      BlockchainService.getBalance = jest.fn().mockResolvedValue({
        success: true,
        data: {
          balanceEth: 0.01,
          balanceFormatted: '0.01 ETH'
        }
      });

      const response = await request(app)
        .post('/api/faucet/request')
        .send(faucetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Faucet request submitted successfully');
      expect(response.body.data.wallet_address).toBe(faucetData.wallet_address);
    });

    it('should return validation error for invalid wallet address', async () => {
      const faucetData = {
        wallet_address: 'invalid-address'
      };

      const response = await request(app)
        .post('/api/faucet/request')
        .send(faucetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });

    it('should return error when wallet has insufficient ETH', async () => {
      const faucetData = {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
      };

      // Mock insufficient balance
      BlockchainService.getBalance = jest.fn().mockResolvedValue({
        success: true,
        data: {
          balanceEth: 0.0001, // Less than required 0.001 ETH
          balanceFormatted: '0.0001 ETH'
        }
      });

      const response = await request(app)
        .post('/api/faucet/request')
        .send(faucetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Insufficient ETH balance');
    });
  });
});
