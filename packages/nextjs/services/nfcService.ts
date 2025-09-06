interface NFCMessage {
  type: 'payment_request' | 'payment_response' | 'vendor_info';
  data: {
    vendorId?: string;
    vendorEns?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
    status?: 'pending' | 'completed' | 'failed';
    timestamp?: number;
  };
}

class NFCService {
  private isSupported: boolean = false;
  private isReading: boolean = false;
  private isWriting: boolean = false;

  constructor() {
    this.checkSupport();
  }

  /**
   * Check if Web NFC is supported
   */
  private checkSupport(): void {
    this.isSupported = 'NDEFReader' in window;
  }

  /**
   * Get NFC support status
   */
  getSupportStatus(): boolean {
    return this.isSupported;
  }

  /**
   * Request NFC permissions
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('NFC is not supported on this device');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'nfc' as PermissionName });
      return permission.state === 'granted';
    } catch (error) {
      console.error('Error requesting NFC permission:', error);
      return false;
    }
  }

  /**
   * Start reading NFC messages
   */
  async startReading(onMessage: (message: NFCMessage) => void): Promise<void> {
    if (!this.isSupported) {
      throw new Error('NFC is not supported on this device');
    }

    if (this.isReading) {
      throw new Error('NFC reading is already active');
    }

    try {
      const reader = new NDEFReader();
      await reader.scan();
      
      this.isReading = true;

      reader.addEventListener('reading', (event) => {
        try {
          const message = this.parseNFCMessage(event.message);
          onMessage(message);
        } catch (error) {
          console.error('Error parsing NFC message:', error);
        }
      });

      reader.addEventListener('readingerror', (error) => {
        console.error('NFC reading error:', error);
        this.isReading = false;
      });

    } catch (error) {
      this.isReading = false;
      throw new Error(`Failed to start NFC reading: ${error}`);
    }
  }

  /**
   * Stop reading NFC messages
   */
  stopReading(): void {
    this.isReading = false;
  }

  /**
   * Write NFC message
   */
  async writeMessage(message: NFCMessage): Promise<void> {
    if (!this.isSupported) {
      throw new Error('NFC is not supported on this device');
    }

    if (this.isWriting) {
      throw new Error('NFC writing is already in progress');
    }

    try {
      const writer = new NDEFWriter();
      const ndefMessage = this.createNDEFMessage(message);
      
      this.isWriting = true;
      await writer.write(ndefMessage);
      this.isWriting = false;

    } catch (error) {
      this.isWriting = false;
      throw new Error(`Failed to write NFC message: ${error}`);
    }
  }

  /**
   * Parse NFC message from NDEF message
   */
  private parseNFCMessage(ndefMessage: NDEFMessage): NFCMessage {
    const record = ndefMessage.records[0];
    
    if (!record || record.recordType !== 'mime') {
      throw new Error('Invalid NFC message format');
    }

    const decoder = new TextDecoder();
    const data = JSON.parse(decoder.decode(record.data));
    
    return data as NFCMessage;
  }

  /**
   * Create NDEF message from NFCMessage
   */
  private createNDEFMessage(message: NFCMessage): NDEFMessageInit {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(message));

    return {
      records: [
        {
          recordType: 'mime',
          mediaType: 'application/json',
          data: data
        }
      ]
    };
  }

  /**
   * Create payment request message
   */
  createPaymentRequest(vendorId: string, vendorEns: string, amount: number, currency: string = 'GHS'): NFCMessage {
    return {
      type: 'payment_request',
      data: {
        vendorId,
        vendorEns,
        amount,
        currency,
        orderId: this.generateOrderId(),
        timestamp: Date.now()
      }
    };
  }

  /**
   * Create payment response message
   */
  createPaymentResponse(orderId: string, status: 'completed' | 'failed'): NFCMessage {
    return {
      type: 'payment_response',
      data: {
        orderId,
        status,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Create vendor info message
   */
  createVendorInfo(vendorId: string, vendorEns: string): NFCMessage {
    return {
      type: 'vendor_info',
      data: {
        vendorId,
        vendorEns,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current reading status
   */
  getReadingStatus(): boolean {
    return this.isReading;
  }

  /**
   * Get current writing status
   */
  getWritingStatus(): boolean {
    return this.isWriting;
  }
}

export const nfcService = new NFCService();
export type { NFCMessage };
