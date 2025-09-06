// packages/nextjs/services/qrService.ts

export interface PaymentQRData {
  type: 'payment_request' | 'payment_response' | 'vendor_info';
  amount?: number;
  currency?: string;
  vendor_ens?: string;
  vendor_address?: string;
  order_id?: string;
  timestamp: number;
  signature?: string;
}

export interface VendorQRData {
  type: 'vendor_info';
  ens_name: string;
  business_name: string;
  wallet_address: string;
  category: string;
  description?: string;
  logo_url?: string;
  timestamp: number;
}

export class QRService {
  /**
   * Generate QR code data for payment request
   */
  static generatePaymentRequestQR(data: {
    amount: number;
    currency: string;
    vendor_ens: string;
    vendor_address: string;
    order_id?: string;
  }): string {
    const qrData: PaymentQRData = {
      type: 'payment_request',
      amount: data.amount,
      currency: data.currency,
      vendor_ens: data.vendor_ens,
      vendor_address: data.vendor_address,
      order_id: data.order_id,
      timestamp: Date.now()
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate QR code data for vendor information
   */
  static generateVendorQR(data: {
    ens_name: string;
    business_name: string;
    wallet_address: string;
    category: string;
    description?: string;
    logo_url?: string;
  }): string {
    const qrData: VendorQRData = {
      type: 'vendor_info',
      ens_name: data.ens_name,
      business_name: data.business_name,
      wallet_address: data.wallet_address,
      category: data.category,
      description: data.description,
      logo_url: data.logo_url,
      timestamp: Date.now()
    };

    return JSON.stringify(qrData);
  }

  /**
   * Parse QR code data
   */
  static parseQRData(qrString: string): PaymentQRData | VendorQRData | null {
    try {
      const data = JSON.parse(qrString);
      
      // Validate required fields
      if (!data.type || !data.timestamp) {
        return null;
      }

      // Validate timestamp (not older than 1 hour)
      const now = Date.now();
      const qrTime = data.timestamp;
      const oneHour = 60 * 60 * 1000;
      
      if (now - qrTime > oneHour) {
        return null; // QR code expired
      }

      return data;
    } catch (error) {
      console.error('Failed to parse QR code data:', error);
      return null;
    }
  }

  /**
   * Validate payment QR data
   */
  static validatePaymentQR(data: any): data is PaymentQRData {
    return (
      data &&
      data.type === 'payment_request' &&
      typeof data.amount === 'number' &&
      typeof data.currency === 'string' &&
      typeof data.vendor_ens === 'string' &&
      typeof data.vendor_address === 'string' &&
      typeof data.timestamp === 'number'
    );
  }

  /**
   * Validate vendor QR data
   */
  static validateVendorQR(data: any): data is VendorQRData {
    return (
      data &&
      data.type === 'vendor_info' &&
      typeof data.ens_name === 'string' &&
      typeof data.business_name === 'string' &&
      typeof data.wallet_address === 'string' &&
      typeof data.category === 'string' &&
      typeof data.timestamp === 'number'
    );
  }

  /**
   * Generate QR code data string for payment request
   */
  static generatePaymentQRData(data: PaymentQRData): string {
    return JSON.stringify(data);
  }

  /**
   * Generate QR code data string for vendor info
   */
  static generateVendorQRData(data: VendorQRData): string {
    return JSON.stringify(data);
  }

  /**
   * Format currency amount for display
   */
  static formatCurrency(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'bUSDC' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (currency === 'bUSDC') {
      return `${amount.toFixed(2)} bUSDC`;
    }

    return formatter.format(amount);
  }

  /**
   * Generate unique order ID
   */
  static generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TAPNGO_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Check if QR code is expired
   */
  static isQRExpired(timestamp: number, maxAgeMinutes: number = 60): boolean {
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000;
    return (now - timestamp) > maxAge;
  }

  /**
   * Get QR code expiration time
   */
  static getQRExpirationTime(timestamp: number, maxAgeMinutes: number = 60): Date {
    return new Date(timestamp + (maxAgeMinutes * 60 * 1000));
  }

  /**
   * Format time remaining until expiration
   */
  static getTimeRemaining(timestamp: number, maxAgeMinutes: number = 60): string {
    const expirationTime = this.getQRExpirationTime(timestamp, maxAgeMinutes);
    const now = new Date();
    const diff = expirationTime.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Expired';
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  }

  /**
   * Generate QR code for NFC fallback
   */
  static generateNFCQR(data: PaymentQRData | VendorQRData): string {
    // For NFC, we might want a shorter format or different encoding
    return JSON.stringify(data);
  }

  /**
   * Validate ENS name format
   */
  static validateENSName(ensName: string): boolean {
    const ensRegex = /^[a-z0-9-]+\.tapngo\.eth$/;
    return ensRegex.test(ensName);
  }

  /**
   * Validate wallet address format
   */
  static validateWalletAddress(address: string): boolean {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  }

  /**
   * Sanitize QR data for security
   */
  static sanitizeQRData(data: any): any {
    // Remove any potentially dangerous fields
    const sanitized = { ...data };
    delete sanitized.signature; // Remove signature for security
    delete sanitized.private_key; // Remove any private keys
    delete sanitized.seed; // Remove any seed phrases
    
    return sanitized;
  }
}

// Export a singleton instance for easier use
export const qrService = new QRService();
