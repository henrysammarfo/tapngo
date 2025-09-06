import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/wagmi';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export class PaymentRouterService {
  /**
   * Send P2P payment (creates order, needs to be completed separately)
   */
  static async sendP2PPayment(
    recipient: string,
    amountGHS: number,
    metadata: string = ''
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock order ID
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('P2P payment error:', error);
      throw error;
    }
  }

  /**
   * Send vendor payment (creates order, needs to be completed separately)
   */
  static async sendVendorPayment(
    vendor: string,
    amountGHS: number,
    metadata: string = '',
    paymentType: number = 1 // PaymentType.VendorPay
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock order ID
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Vendor payment error:', error);
      throw error;
    }
  }

  /**
   * Complete a payment by transferring bUSDC tokens
   */
  static async completePayment(orderId: string): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Complete payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for an address
   */
  static async getPaymentHistory(address: string): Promise<any[]> {
    try {
      // Get payment events from the PaymentRouter contract
      const events = await client.getLogs({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        event: parseAbi([
          'event PaymentInitiated(bytes32 indexed orderId, address indexed sender, address indexed recipient, uint256 amountUSDC, uint8 paymentType)',
          'event PaymentCompleted(bytes32 indexed orderId, address indexed sender, address indexed recipient, uint256 amountUSDC, uint256 platformFee, uint256 recipientAmount)'
        ]),
        args: {
          sender: address as `0x${string}`,
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      return events.map(event => ({
        orderId: event.args.orderId,
        from: event.args.sender,
        to: event.args.recipient,
        amount: event.args.amountUSDC,
        platformFee: event.args.platformFee || 0n,
        recipientAmount: event.args.recipientAmount || event.args.amountUSDC,
        eventType: event.eventName,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }));
    } catch (error) {
      console.error('Payment history error:', error);
      return [];
    }
  }

  /**
   * Get receipt by order ID
   */
  static async getReceipt(orderId: string): Promise<any> {
    try {
      const receipt = await client.readContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: parseAbi([
          'function getReceipt(bytes32 orderId) view returns (tuple(bytes32 orderId, string recipientENS, address sender, address recipient, uint256 amountGHS, uint256 amountUSDC, uint256 fxRate, uint256 timestamp, uint8 paymentType, uint8 status, string metadata, bool isVendorPayment))'
        ]),
        functionName: 'getReceipt',
        args: [orderId as `0x${string}`]
      });
      return receipt;
    } catch (error) {
      console.error('Get receipt error:', error);
      return null;
    }
  }

  /**
   * Get user's receipt IDs
   */
  static async getUserReceipts(
    user: string,
    offset: number = 0,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const orderIds = await client.readContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: parseAbi([
          'function getUserReceipts(address user, uint256 offset, uint256 limit) view returns (bytes32[] memory orderIds)'
        ]),
        functionName: 'getUserReceipts',
        args: [user as `0x${string}`, BigInt(offset), BigInt(limit)]
      });
      return orderIds;
    } catch (error) {
      console.error('Get user receipts error:', error);
      return [];
    }
  }

  /**
   * Calculate USDC amount from GHS
   */
  static async calculateUSDCAmount(amountGHS: number): Promise<bigint> {
    try {
      const amountUSDC = await client.readContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: parseAbi([
          'function calculateUSDCAmount(uint256 amountGHS) view returns (uint256 amountUSDC)'
        ]),
        functionName: 'calculateUSDCAmount',
        args: [BigInt(amountGHS)]
      });
      return amountUSDC;
    } catch (error) {
      console.error('Calculate USDC amount error:', error);
      return 0n;
    }
  }

  /**
   * Get current exchange rate
   */
  static async getCurrentFxRate(): Promise<bigint> {
    try {
      const fxRate = await client.readContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: parseAbi([
          'function currentFxRate() view returns (uint256)'
        ]),
        functionName: 'currentFxRate'
      });
      return fxRate;
    } catch (error) {
      console.error('Get FX rate error:', error);
      return 1e6n; // Default rate: 1 GHS = 1 USDC
    }
  }

  /**
   * Check if an address is a registered vendor
   */
  static async isVendor(address: string): Promise<boolean> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: parseAbi([
          'function isVendor(address vendorAddress) view returns (bool)'
        ]),
        functionName: 'isVendor',
        args: [address as `0x${string}`]
      });
      return result;
    } catch (error) {
      console.error('Vendor check error:', error);
      return false;
    }
  }
}
