import { parseEther, formatEther } from 'viem';
import { apiService } from './api';

export interface PaymentRequest {
  vendorAddress: string;
  amountGHS: number;
  paymentType: 'QuickPay' | 'InvoicePay';
  metadata?: string;
}

export interface PaymentReceipt {
  orderId: string;
  vendorENS: string;
  buyer: string;
  vendor: string;
  amountGHS: number;
  amountUSDC: number;
  fxRate: number;
  timestamp: number;
  paymentType: 'QuickPay' | 'InvoicePay';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  metadata: string;
}

export interface PaymentConfirmation {
  orderId: string;
  amountGHS: number;
  amountUSDC: number;
  vendorENS: string;
  vendorAddress: string;
  fxRate: number;
  platformFee: number;
  vendorAmount: number;
}

class PaymentService {
  /**
   * Initiate a Quick Pay transaction
   */
  async initiateQuickPay(
    vendorAddress: string,
    amountGHS: number,
    writeContractAsync: any
  ): Promise<string> {
    try {
      const amountGHSWei = parseEther(amountGHS.toString());
      
      const result = await writeContractAsync({
        functionName: "initiateQuickPay",
        args: [vendorAddress, amountGHSWei],
      });

      // Wait for transaction to be mined and get the order ID from events
      const receipt = await result.wait();
      
      // Extract order ID from PaymentInitiated event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === '0x...' // PaymentInitiated event signature
      );
      
      if (event) {
        const orderId = event.topics[1]; // orderId is the first indexed parameter
        return orderId;
      }
      
      throw new Error('Failed to extract order ID from transaction');
    } catch (error) {
      console.error('Quick Pay initiation error:', error);
      throw new Error('Failed to initiate Quick Pay transaction');
    }
  }

  /**
   * Initiate an Invoice Pay transaction with metadata
   */
  async initiateInvoicePay(
    vendorAddress: string,
    amountGHS: number,
    metadata: string,
    writeContractAsync: any
  ): Promise<string> {
    try {
      const amountGHSWei = parseEther(amountGHS.toString());
      
      const result = await writeContractAsync({
        functionName: "initiateInvoicePay",
        args: [vendorAddress, amountGHSWei, metadata],
      });

      // Wait for transaction to be mined and get the order ID from events
      const receipt = await result.wait();
      
      // Extract order ID from PaymentInitiated event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === '0x...' // PaymentInitiated event signature
      );
      
      if (event) {
        const orderId = event.topics[1]; // orderId is the first indexed parameter
        return orderId;
      }
      
      throw new Error('Failed to extract order ID from transaction');
    } catch (error) {
      console.error('Invoice Pay initiation error:', error);
      throw new Error('Failed to initiate Invoice Pay transaction');
    }
  }

  /**
   * Complete a payment by transferring bUSDC tokens
   */
  async completePayment(
    orderId: string,
    writeContractAsync: any
  ): Promise<void> {
    try {
      const result = await writeContractAsync({
        functionName: "completePayment",
        args: [orderId],
      });

      await result.wait();
    } catch (error) {
      console.error('Payment completion error:', error);
      throw new Error('Failed to complete payment');
    }
  }

  /**
   * Get payment receipt by order ID
   */
  async getReceipt(
    orderId: string,
    readContractAsync: any
  ): Promise<PaymentReceipt> {
    try {
      const receipt = await readContractAsync({
        functionName: "getReceipt",
        args: [orderId],
      });

      return {
        orderId: receipt.orderId,
        vendorENS: receipt.vendorENS,
        buyer: receipt.buyer,
        vendor: receipt.vendor,
        amountGHS: parseFloat(formatEther(receipt.amountGHS)),
        amountUSDC: parseFloat(formatEther(receipt.amountUSDC)),
        fxRate: parseFloat(formatEther(receipt.fxRate)),
        timestamp: Number(receipt.timestamp),
        paymentType: receipt.paymentType === 0 ? 'QuickPay' : 'InvoicePay',
        status: this.getStatusString(receipt.status),
        metadata: receipt.metadata,
      };
    } catch (error) {
      console.error('Get receipt error:', error);
      throw new Error('Failed to get payment receipt');
    }
  }

  /**
   * Get user's payment receipts
   */
  async getUserReceipts(
    userAddress: string,
    offset: number = 0,
    limit: number = 10,
    readContractAsync: any
  ): Promise<string[]> {
    try {
      const orderIds = await readContractAsync({
        functionName: "getUserReceipts",
        args: [userAddress, offset, limit],
      });

      return orderIds;
    } catch (error) {
      console.error('Get user receipts error:', error);
      throw new Error('Failed to get user receipts');
    }
  }

  /**
   * Calculate USDC amount from GHS
   */
  async calculateUSDCAmount(
    amountGHS: number,
    readContractAsync: any
  ): Promise<number> {
    try {
      const amountGHSWei = parseEther(amountGHS.toString());
      const amountUSDCWei = await readContractAsync({
        functionName: "calculateUSDCAmount",
        args: [amountGHSWei],
      });

      return parseFloat(formatEther(amountUSDCWei));
    } catch (error) {
      console.error('Calculate USDC amount error:', error);
      throw new Error('Failed to calculate USDC amount');
    }
  }

  /**
   * Get current exchange rate
   */
  async getCurrentFxRate(readContractAsync: any): Promise<number> {
    try {
      const fxRate = await readContractAsync({
        functionName: "currentFxRate",
      });

      return parseFloat(formatEther(fxRate));
    } catch (error) {
      console.error('Get FX rate error:', error);
      throw new Error('Failed to get exchange rate');
    }
  }

  /**
   * Get platform fee percentage
   */
  async getPlatformFee(readContractAsync: any): Promise<number> {
    try {
      const feeBps = await readContractAsync({
        functionName: "platformFeeBps",
      });

      return Number(feeBps) / 100; // Convert basis points to percentage
    } catch (error) {
      console.error('Get platform fee error:', error);
      throw new Error('Failed to get platform fee');
    }
  }

  /**
   * Get vendor earnings
   */
  async getVendorEarnings(
    vendorAddress: string,
    readContractAsync: any
  ): Promise<number> {
    try {
      const earnings = await readContractAsync({
        functionName: "getVendorEarnings",
        args: [vendorAddress],
      });

      return parseFloat(formatEther(earnings));
    } catch (error) {
      console.error('Get vendor earnings error:', error);
      throw new Error('Failed to get vendor earnings');
    }
  }

  /**
   * Process payment from QR code data
   */
  async processQRPayment(
    qrData: any,
    writeContractAsync: any,
    readContractAsync: any
  ): Promise<PaymentConfirmation> {
    try {
      // Calculate USDC amount
      const amountUSDC = await this.calculateUSDCAmount(qrData.amount, readContractAsync);
      
      // Get platform fee
      const platformFeePercentage = await this.getPlatformFee(readContractAsync);
      const platformFee = (amountUSDC * platformFeePercentage) / 100;
      const vendorAmount = amountUSDC - platformFee;
      
      // Get current FX rate
      const fxRate = await this.getCurrentFxRate(readContractAsync);

      return {
        orderId: qrData.order_id,
        amountGHS: qrData.amount,
        amountUSDC,
        vendorENS: qrData.vendor_ens,
        vendorAddress: qrData.vendor_address,
        fxRate,
        platformFee,
        vendorAmount,
      };
    } catch (error) {
      console.error('Process QR payment error:', error);
      throw new Error('Failed to process QR payment');
    }
  }

  /**
   * Create payment confirmation from smart contract data
   */
  async createPaymentConfirmation(
    orderId: string,
    readContractAsync: any
  ): Promise<PaymentConfirmation> {
    try {
      const receipt = await this.getReceipt(orderId, readContractAsync);
      const platformFeePercentage = await this.getPlatformFee(readContractAsync);
      const platformFee = (receipt.amountUSDC * platformFeePercentage) / 100;
      const vendorAmount = receipt.amountUSDC - platformFee;

      return {
        orderId: receipt.orderId,
        amountGHS: receipt.amountGHS,
        amountUSDC: receipt.amountUSDC,
        vendorENS: receipt.vendorENS,
        vendorAddress: receipt.vendor,
        fxRate: receipt.fxRate,
        platformFee,
        vendorAmount,
      };
    } catch (error) {
      console.error('Create payment confirmation error:', error);
      throw new Error('Failed to create payment confirmation');
    }
  }

  /**
   * Convert status enum to string
   */
  private getStatusString(status: number): 'Pending' | 'Completed' | 'Failed' | 'Refunded' {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Completed';
      case 2: return 'Failed';
      case 3: return 'Refunded';
      default: return 'Pending';
    }
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }
    
    if (amount > 10000) {
      return { isValid: false, error: 'Amount cannot exceed ₵10,000' };
    }

    return { isValid: true };
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: 'GHS' | 'USDC'): string {
    const symbol = currency === 'GHS' ? '₵' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Calculate estimated fees
   */
  calculateFees(amountUSDC: number, platformFeePercentage: number): {
    platformFee: number;
    netAmount: number;
  } {
    const platformFee = (amountUSDC * platformFeePercentage) / 100;
    const netAmount = amountUSDC - platformFee;
    
    return {
      platformFee,
      netAmount,
    };
  }
}

export const paymentService = new PaymentService();
