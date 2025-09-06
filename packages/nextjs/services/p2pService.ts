import { parseEther, formatEther } from 'viem';
import { apiService } from './api';
import { ensService } from './ensService';

export interface P2PTransfer {
  id: string;
  senderId: string;
  receiverId: string;
  amountGHS: number;
  amountUSDC: number;
  fxRate: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  txHash: string | null;
  createdAt: string;
  completedAt: string | null;
  sender: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
  receiver: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
}

export interface P2PRequest {
  id: string;
  requesterId: string;
  requesteeId: string;
  amountGHS: number;
  amountUSDC: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  requester: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
  requestee: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
}

export interface P2PContact {
  id: string;
  userId: string;
  contactId: string;
  nickname: string;
  isFavorite: boolean;
  lastTransactionAt: string | null;
  totalTransactions: number;
  totalAmount: number;
  contact: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
    profilePicture: string | null;
  };
}

class P2PService {
  /**
   * Send money to another user
   */
  async sendMoney(
    receiverAddress: string,
    amountGHS: number,
    message?: string,
    writeContractAsync?: any
  ): Promise<P2PTransfer> {
    try {
      // First, create the transfer record in the backend
      const response = await apiService.post('/p2p/send', {
        receiverAddress,
        amountGHS,
        message: message || '',
      });

      const transfer = response.data;

      // If smart contract interaction is available, execute the transfer
      if (writeContractAsync) {
        const amountUSDC = await this.calculateUSDCAmount(amountGHS);
        
        // Execute the transfer via smart contract
        await writeContractAsync({
          functionName: "transfer",
          args: [receiverAddress, parseEther(amountUSDC.toString())],
        });
      }

      return transfer;
    } catch (error) {
      console.error('Send money error:', error);
      throw new Error('Failed to send money');
    }
  }

  /**
   * Request money from another user
   */
  async requestMoney(
    requesteeAddress: string,
    amountGHS: number,
    message: string
  ): Promise<P2PRequest> {
    try {
      const response = await apiService.post('/p2p/request', {
        requesteeAddress,
        amountGHS,
        message,
      });

      return response.data;
    } catch (error) {
      console.error('Request money error:', error);
      throw new Error('Failed to request money');
    }
  }

  /**
   * Accept a money request
   */
  async acceptRequest(
    requestId: string,
    writeContractAsync?: any
  ): Promise<P2PTransfer> {
    try {
      const response = await apiService.post(`/p2p/requests/${requestId}/accept`);

      const transfer = response.data;

      // If smart contract interaction is available, execute the transfer
      if (writeContractAsync) {
        await writeContractAsync({
          functionName: "transfer",
          args: [transfer.receiver.walletAddress, parseEther(transfer.amountUSDC.toString())],
        });
      }

      return transfer;
    } catch (error) {
      console.error('Accept request error:', error);
      throw new Error('Failed to accept money request');
    }
  }

  /**
   * Reject a money request
   */
  async rejectRequest(requestId: string): Promise<void> {
    try {
      await apiService.post(`/p2p/requests/${requestId}/reject`);
    } catch (error) {
      console.error('Reject request error:', error);
      throw new Error('Failed to reject money request');
    }
  }

  /**
   * Get user's P2P transfer history
   */
  async getTransferHistory(
    page: number = 1,
    limit: number = 20,
    type?: 'sent' | 'received'
  ): Promise<{ transfers: P2PTransfer[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
      });

      const response = await apiService.get(`/p2p/transfers?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get transfer history error:', error);
      throw new Error('Failed to fetch transfer history');
    }
  }

  /**
   * Get user's P2P requests (sent and received)
   */
  async getRequests(
    page: number = 1,
    limit: number = 20,
    type?: 'sent' | 'received'
  ): Promise<{ requests: P2PRequest[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
      });

      const response = await apiService.get(`/p2p/requests?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get requests error:', error);
      throw new Error('Failed to fetch requests');
    }
  }

  /**
   * Get user's contacts
   */
  async getContacts(): Promise<P2PContact[]> {
    try {
      const response = await apiService.get('/p2p/contacts');
      return response.data;
    } catch (error) {
      console.error('Get contacts error:', error);
      throw new Error('Failed to fetch contacts');
    }
  }

  /**
   * Add a contact
   */
  async addContact(
    contactAddress: string,
    nickname?: string
  ): Promise<P2PContact> {
    try {
      const response = await apiService.post('/p2p/contacts', {
        contactAddress,
        nickname: nickname || '',
      });

      return response.data;
    } catch (error) {
      console.error('Add contact error:', error);
      throw new Error('Failed to add contact');
    }
  }

  /**
   * Remove a contact
   */
  async removeContact(contactId: string): Promise<void> {
    try {
      await apiService.delete(`/p2p/contacts/${contactId}`);
    } catch (error) {
      console.error('Remove contact error:', error);
      throw new Error('Failed to remove contact');
    }
  }

  /**
   * Update contact nickname
   */
  async updateContactNickname(
    contactId: string,
    nickname: string
  ): Promise<P2PContact> {
    try {
      const response = await apiService.put(`/p2p/contacts/${contactId}`, {
        nickname,
      });

      return response.data;
    } catch (error) {
      console.error('Update contact nickname error:', error);
      throw new Error('Failed to update contact nickname');
    }
  }

  /**
   * Toggle contact favorite status
   */
  async toggleContactFavorite(contactId: string): Promise<P2PContact> {
    try {
      const response = await apiService.put(`/p2p/contacts/${contactId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Toggle contact favorite error:', error);
      throw new Error('Failed to toggle contact favorite');
    }
  }

  /**
   * Search for users by address, ENS name, or email
   */
  async searchUsers(query: string): Promise<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
    profilePicture: string | null;
    isContact: boolean;
  }>> {
    try {
      const response = await apiService.get(`/p2p/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveENSName(ensName: string): Promise<string | null> {
    try {
      return await ensService.resolveENSName(ensName);
    } catch (error) {
      console.error('Resolve ENS name error:', error);
      return null;
    }
  }

  /**
   * Get user profile by address
   */
  async getUserByAddress(address: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
    profilePicture: string | null;
    isContact: boolean;
  } | null> {
    try {
      const response = await apiService.get(`/p2p/user/${address}`);
      return response.data;
    } catch (error) {
      console.error('Get user by address error:', error);
      return null;
    }
  }

  /**
   * Calculate USDC amount from GHS
   */
  async calculateUSDCAmount(amountGHS: number): Promise<number> {
    try {
      const response = await apiService.get(`/p2p/calculate-usdc?amountGHS=${amountGHS}`);
      return response.data.amountUSDC;
    } catch (error) {
      console.error('Calculate USDC amount error:', error);
      // Fallback to default rate
      return amountGHS * 0.061; // Approximate GHS to USDC rate
    }
  }

  /**
   * Get current exchange rate
   */
  async getExchangeRate(): Promise<number> {
    try {
      const response = await apiService.get('/p2p/exchange-rate');
      return response.data.rate;
    } catch (error) {
      console.error('Get exchange rate error:', error);
      return 0.061; // Fallback rate
    }
  }

  /**
   * Validate transfer amount
   */
  validateTransferAmount(amount: number): { isValid: boolean; error?: string } {
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
   * Format date for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get status color for transfer
   */
  getTransferStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get status color for request
   */
  getRequestStatusColor(status: string): string {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Generate NFC payment data for P2P transfer
   */
  generateNFCTransferData(
    amountGHS: number,
    senderAddress: string,
    message?: string
  ): string {
    const transferData = {
      type: 'p2p_transfer',
      amountGHS,
      senderAddress,
      message: message || '',
      timestamp: Date.now(),
    };

    return JSON.stringify(transferData);
  }

  /**
   * Parse NFC transfer data
   */
  parseNFCTransferData(data: string): {
    type: string;
    amountGHS: number;
    senderAddress: string;
    message: string;
    timestamp: number;
  } | null {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type === 'p2p_transfer' && 
          parsed.amountGHS && 
          parsed.senderAddress && 
          parsed.timestamp) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Parse NFC transfer data error:', error);
      return null;
    }
  }

  /**
   * Check if NFC transfer data is fresh (not expired)
   */
  isNFCTransferDataFresh(data: any, expiryMinutes: number = 5): boolean {
    const currentTime = Date.now();
    const dataTimestamp = data.timestamp;
    return (currentTime - dataTimestamp) < (expiryMinutes * 60 * 1000);
  }
}

export const p2pService = new P2PService();
