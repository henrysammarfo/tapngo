import axios from 'axios';
import { ethers } from 'ethers';

// Deployed contract addresses on Base Sepolia
const CONTRACT_ADDRESSES = {
  bUSDC: '0xeb9361Ec0d712C5B12965FB91c409262b7d6703c',
  PaymentRouter: '0x0598c74C30e4e70fb6Cd7cd63c3DDE74756EAb73',
  VendorRegistry: '0xA9F04F020CF9F511982719196E25FE7c666c9E4D'
};

// Contract ABIs (simplified for key functions)
const CONTRACT_ABIS = {
  bUSDC: [
    'function balanceOf(address account) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function claimFaucet()',
    'function canClaimFaucet(address user) view returns (bool canClaim, uint256 timeUntilClaim)',
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)'
  ],
  PaymentRouter: [
    'function processPayment(address buyer, address vendor, uint256 amount, string memory orderId) returns (bool)',
    'function getPaymentStatus(string memory orderId) view returns (bool exists, bool completed, uint256 amount)'
  ],
  VendorRegistry: [
    'function registerVendor(string memory ensName, string memory businessName, string memory businessDescription) returns (bool)',
    'function getVendor(address vendorAddress) view returns (string memory ensName, string memory businessName, string memory businessDescription, bool isActive)',
    'function isVendorRegistered(address vendorAddress) view returns (bool)'
  ]
};

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

export class BlockchainService {
  static async getContractABI(contractAddress) {
    try {
      const response = await axios.get(
        `${process.env.BASE_RPC_URL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [contractAddress, 'latest'],
            id: 1
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Blockchain service error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getTransactionReceipt(txHash) {
    try {
      const response = await axios.post(
        `${process.env.BASE_RPC_URL}`,
        {
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data.result
      };
    } catch (error) {
      console.error('❌ Transaction receipt error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getBlockByNumber(blockNumber) {
    try {
      const response = await axios.post(
        `${process.env.BASE_RPC_URL}`,
        {
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [blockNumber, true],
          id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data.result
      };
    } catch (error) {
      console.error('❌ Block fetch error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getBalance(address) {
    try {
      const response = await axios.post(
        `${process.env.BASE_RPC_URL}`,
        {
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Convert from wei to ether
      const balanceWei = parseInt(response.data.result, 16);
      const balanceEth = balanceWei / Math.pow(10, 18);

      return {
        success: true,
        data: {
          address,
          balanceWei,
          balanceEth,
          balanceFormatted: `${balanceEth.toFixed(6)} ETH`
        }
      };
    } catch (error) {
      console.error('❌ Balance fetch error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async estimateGas(transaction) {
    try {
      const response = await axios.post(
        `${process.env.BASE_RPC_URL}`,
        {
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [transaction],
          id: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const gasEstimate = parseInt(response.data.result, 16);

      return {
        success: true,
        data: {
          gasEstimate,
          gasEstimateHex: response.data.result
        }
      };
    } catch (error) {
      console.error('❌ Gas estimation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real contract interaction methods
  static async getTokenBalance(walletAddress, tokenAddress = CONTRACT_ADDRESSES.bUSDC) {
    try {
      const contract = new ethers.Contract(tokenAddress, CONTRACT_ABIS.bUSDC, provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      
      return {
        success: true,
        data: {
          balance: balance.toString(),
          balanceFormatted: ethers.formatUnits(balance, decimals),
          decimals: decimals,
          tokenAddress
        }
      };
    } catch (error) {
      console.error('❌ Token balance error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async canClaimFaucet(walletAddress) {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.bUSDC, CONTRACT_ABIS.bUSDC, provider);
      const [canClaim, timeUntilClaim] = await contract.canClaimFaucet(walletAddress);
      
      return {
        success: true,
        data: {
          canClaim,
          timeUntilClaim: timeUntilClaim.toString(),
          timeUntilClaimFormatted: `${Math.floor(Number(timeUntilClaim) / 3600)} hours`
        }
      };
    } catch (error) {
      console.error('❌ Faucet check error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async claimFaucet(walletAddress, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.bUSDC, CONTRACT_ABIS.bUSDC, wallet);
      
      const tx = await contract.claimFaucet();
      const receipt = await tx.wait();
      
      return {
        success: true,
        data: {
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      };
    } catch (error) {
      console.error('❌ Faucet claim error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async isVendorRegistered(vendorAddress) {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.VendorRegistry, CONTRACT_ABIS.VendorRegistry, provider);
      const isRegistered = await contract.isVendorRegistered(vendorAddress);
      
      return {
        success: true,
        data: {
          isRegistered,
          vendorAddress
        }
      };
    } catch (error) {
      console.error('❌ Vendor check error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getVendorInfo(vendorAddress) {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.VendorRegistry, CONTRACT_ABIS.VendorRegistry, provider);
      const [ensName, businessName, businessDescription, isActive] = await contract.getVendor(vendorAddress);
      
      return {
        success: true,
        data: {
          ensName,
          businessName,
          businessDescription,
          isActive,
          vendorAddress
        }
      };
    } catch (error) {
      console.error('❌ Vendor info error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async processPayment(buyerAddress, vendorAddress, amount, orderId, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.PaymentRouter, CONTRACT_ABIS.PaymentRouter, wallet);
      
      // Convert amount to wei (assuming 6 decimals for bUSDC)
      const amountWei = ethers.parseUnits(amount.toString(), 6);
      
      const tx = await contract.processPayment(buyerAddress, vendorAddress, amountWei, orderId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        data: {
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          orderId,
          amount: amountWei.toString()
        }
      };
    } catch (error) {
      console.error('❌ Payment processing error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getPaymentStatus(orderId) {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESSES.PaymentRouter, CONTRACT_ABIS.PaymentRouter, provider);
      const [exists, completed, amount] = await contract.getPaymentStatus(orderId);
      
      return {
        success: true,
        data: {
          exists,
          completed,
          amount: amount.toString(),
          amountFormatted: ethers.formatUnits(amount, 6),
          orderId
        }
      };
    } catch (error) {
      console.error('❌ Payment status error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
