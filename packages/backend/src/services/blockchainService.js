import axios from 'axios';

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
}
