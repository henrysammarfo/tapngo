import express from 'express';
import { User } from '../models/index.js';
import { BlockchainService } from '../services/blockchainService.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for faucet requests (1 request per hour per IP)
const faucetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // 1 request per hour
  message: {
    success: false,
    error: { message: 'Faucet request limit exceeded. Try again in 1 hour.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request faucet tokens
router.post('/request', faucetLimiter, validate(schemas.faucetRequest), async (req, res) => {
  try {
    const { wallet_address } = req.body;
    const userId = req.user?.id;

    // Verify wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(wallet_address)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid wallet address format' }
      });
    }

    // Check if wallet address belongs to authenticated user
    if (userId) {
      const user = await User.findByPk(userId);
      if (user.wallet_address && user.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: { message: 'Wallet address does not match your account' }
        });
      }
    }

    // Check wallet balance
    const balanceResult = await BlockchainService.getBalance(wallet_address);
    if (!balanceResult.success) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to check wallet balance' }
      });
    }

    // Check if wallet has sufficient ETH for gas
    const minEthBalance = 0.001; // Minimum 0.001 ETH for gas
    if (balanceResult.data.balanceEth < minEthBalance) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Insufficient ETH balance. Need at least ${minEthBalance} ETH for gas fees.`,
          current_balance: balanceResult.data.balanceFormatted
        }
      });
    }

    // Simulate faucet request (in production, this would interact with the actual contract)
    const faucetAmount = 1000; // 1000 bUSDC tokens
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`; // Simulated transaction hash

    // Log faucet request
    console.log(`💰 Faucet request: ${wallet_address} requested ${faucetAmount} bUSDC`);

    res.json({
      success: true,
      data: {
        message: 'Faucet request submitted successfully',
        wallet_address,
        amount: faucetAmount,
        token: 'bUSDC',
        tx_hash: txHash,
        status: 'pending',
        estimated_time: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Faucet request error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process faucet request' }
    });
  }
});

// Check faucet status
router.get('/status/:walletAddress', optionalAuth, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Verify wallet address format
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid wallet address format' }
      });
    }

    // Check wallet balance
    const balanceResult = await BlockchainService.getBalance(walletAddress);
    if (!balanceResult.success) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to check wallet balance' }
      });
    }

    // Get bUSDC balance (this would be a real contract call in production)
    const busdcBalance = 0; // Simulated bUSDC balance

    res.json({
      success: true,
      data: {
        wallet_address: walletAddress,
        eth_balance: balanceResult.data.balanceFormatted,
        busdc_balance: `${busdcBalance} bUSDC`,
        can_request: balanceResult.data.balanceEth >= 0.001,
        last_request: null, // Would track last request time
        next_request_available: null // Would calculate next available time
      }
    });
  } catch (error) {
    console.error('Faucet status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check faucet status' }
    });
  }
});

// Get faucet information
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      token: 'bUSDC',
      amount_per_request: 1000,
      cooldown_period: '1 hour',
      requirements: {
        min_eth_balance: '0.001 ETH',
        description: 'Minimum ETH balance required for gas fees'
      },
      limits: {
        per_ip: '1 request per hour',
        per_wallet: '1 request per hour'
      },
      network: {
        name: 'Base Sepolia',
        chain_id: 84532,
        rpc_url: process.env.BASE_RPC_URL
      }
    }
  });
});

// Get faucet statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin (you would implement proper admin role checking)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    // Get faucet statistics (this would be real data in production)
    const stats = {
      total_requests: 0,
      total_tokens_distributed: 0,
      unique_wallets: 0,
      requests_today: 0,
      requests_this_hour: 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Faucet stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch faucet statistics' }
    });
  }
});

export default router;
