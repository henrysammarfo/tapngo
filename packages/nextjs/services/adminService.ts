import { apiService } from './api';

export interface VendorProfile {
  id: string;
  userId: string;
  ensName: string;
  businessName: string;
  phoneHash: string;
  phoneVerified: boolean;
  efpVerified: boolean;
  efpasScore: number | null;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    walletAddress: string;
  };
}

export interface Transaction {
  id: string;
  orderId: string;
  vendorId: string;
  buyerId: string;
  amountGHS: number;
  amountUSDC: number;
  fxRate: number;
  platformFee: number;
  vendorAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  txHash: string | null;
  createdAt: string;
  vendor: {
    ensName: string;
    businessName: string;
  };
  buyer: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface SystemStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  totalTransactions: number;
  totalVolumeGHS: number;
  totalVolumeUSDC: number;
  totalPlatformFees: number;
  averageTransactionValue: number;
  transactionsToday: number;
  volumeToday: number;
}

export interface PaymasterInfo {
  balance: number;
  availableBalance: number;
  reservedBalance: number;
  dailyLimit: number;
  dailyUsed: number;
  lastTopUp: string | null;
}

export interface AdminActivity {
  id: string;
  type: 'vendor_approval' | 'vendor_suspension' | 'payment_refund' | 'system_config' | 'user_action';
  description: string;
  adminId: string;
  targetId: string | null;
  metadata: any;
  createdAt: string;
  admin: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

class AdminService {
  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response = await apiService.getSystemStats();
      return response.data;
    } catch (error) {
      console.error('Get system stats error:', error);
      throw new Error('Failed to fetch system statistics');
    }
  }

  /**
   * Get all vendors with pagination and filters
   */
  async getVendors(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<{ vendors: VendorProfile[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(search && { search }),
      });

      const response = await apiService.get(`/admin/vendors?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get vendors error:', error);
      throw new Error('Failed to fetch vendors');
    }
  }

  /**
   * Get vendor details by ID
   */
  async getVendorById(vendorId: string): Promise<VendorProfile> {
    try {
      const response = await apiService.get(`/admin/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('Get vendor error:', error);
      throw new Error('Failed to fetch vendor details');
    }
  }

  /**
   * Approve a vendor
   */
  async approveVendor(vendorId: string, reason?: string): Promise<void> {
    try {
      await apiService.post(`/admin/vendors/${vendorId}/approve`, {
        reason: reason || 'Vendor approved by admin',
      });
    } catch (error) {
      console.error('Approve vendor error:', error);
      throw new Error('Failed to approve vendor');
    }
  }

  /**
   * Suspend a vendor
   */
  async suspendVendor(vendorId: string, reason: string): Promise<void> {
    try {
      await apiService.post(`/admin/vendors/${vendorId}/suspend`, {
        reason,
      });
    } catch (error) {
      console.error('Suspend vendor error:', error);
      throw new Error('Failed to suspend vendor');
    }
  }

  /**
   * Reject a vendor
   */
  async rejectVendor(vendorId: string, reason: string): Promise<void> {
    try {
      await apiService.post(`/admin/vendors/${vendorId}/reject`, {
        reason,
      });
    } catch (error) {
      console.error('Reject vendor error:', error);
      throw new Error('Failed to reject vendor');
    }
  }

  /**
   * Get all transactions with pagination and filters
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    status?: string,
    vendorId?: string,
    buyerId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{ transactions: Transaction[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(vendorId && { vendorId }),
        ...(buyerId && { buyerId }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await apiService.get(`/admin/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await apiService.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Get transaction error:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, reason: string): Promise<void> {
    try {
      await apiService.post(`/admin/transactions/${transactionId}/refund`, {
        reason,
      });
    } catch (error) {
      console.error('Refund transaction error:', error);
      throw new Error('Failed to refund transaction');
    }
  }

  /**
   * Get paymaster information
   */
  async getPaymasterInfo(): Promise<PaymasterInfo> {
    try {
      const response = await apiService.get('/admin/paymaster');
      return response.data;
    } catch (error) {
      console.error('Get paymaster info error:', error);
      throw new Error('Failed to fetch paymaster information');
    }
  }

  /**
   * Top up paymaster balance
   */
  async topUpPaymaster(amount: number): Promise<void> {
    try {
      await apiService.post('/admin/paymaster/topup', {
        amount,
      });
    } catch (error) {
      console.error('Top up paymaster error:', error);
      throw new Error('Failed to top up paymaster');
    }
  }

  /**
   * Get admin activity log
   */
  async getAdminActivity(
    page: number = 1,
    limit: number = 20,
    type?: string,
    adminId?: string
  ): Promise<{ activities: AdminActivity[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(adminId && { adminId }),
      });

      const response = await apiService.get(`/admin/activity?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get admin activity error:', error);
      throw new Error('Failed to fetch admin activity');
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    api: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    blockchain: 'synced' | 'syncing' | 'down';
    paymaster: 'healthy' | 'low_balance' | 'down';
    lastChecked: string;
  }> {
    try {
      const response = await apiService.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('Get system health error:', error);
      throw new Error('Failed to fetch system health');
    }
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: {
    platformFeeBps?: number;
    paymasterDailyLimit?: number;
    vendorApprovalRequired?: boolean;
    maintenanceMode?: boolean;
  }): Promise<void> {
    try {
      await apiService.put('/admin/settings', settings);
    } catch (error) {
      console.error('Update system settings error:', error);
      throw new Error('Failed to update system settings');
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<{
    platformFeeBps: number;
    paymasterDailyLimit: number;
    vendorApprovalRequired: boolean;
    maintenanceMode: boolean;
    lastUpdated: string;
  }> {
    try {
      const response = await apiService.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Get system settings error:', error);
      throw new Error('Failed to fetch system settings');
    }
  }

  /**
   * Export data
   */
  async exportData(
    type: 'vendors' | 'transactions' | 'users',
    format: 'csv' | 'json',
    filters?: any
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams({
        type,
        format,
        ...filters,
      });

      const response = await apiService.get(`/admin/export?${params}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Export data error:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(
    period: 'day' | 'week' | 'month' | 'year' = 'week'
  ): Promise<{
    period: string;
    totalTransactions: number;
    totalVolume: number;
    totalFees: number;
    newVendors: number;
    activeVendors: number;
    chartData: Array<{
      date: string;
      transactions: number;
      volume: number;
      fees: number;
    }>;
  }> {
    try {
      const response = await apiService.get(`/admin/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      throw new Error('Failed to fetch dashboard analytics');
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: 'GHS' | 'USDC'): string {
    const symbol = currency === 'GHS' ? '₵' : '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
   * Get status color for vendor
   */
  getVendorStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'rejected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get status color for transaction
   */
  getTransactionStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get health status color
   */
  getHealthStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
      case 'synced': return 'text-green-600';
      case 'degraded':
      case 'syncing':
      case 'low_balance': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}

export const adminService = new AdminService();
