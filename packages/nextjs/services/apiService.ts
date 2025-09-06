import { User } from '@clerk/nextjs/server';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface UserProfile {
  id: string;
  clerkId: string;
  walletAddress?: string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  isWalletLinked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorProfile {
  id: string;
  userId: string;
  ensName: string;
  businessName: string;
  businessType: string;
  description?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  isEfpVerified: boolean;
  isEfpasVerified: boolean;
  efpScore?: number;
  efpasScore?: number;
  totalEarnings: number;
  totalTransactions: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  priceGHS: number;
  priceUSDC: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  vendorId?: string;
  fromAddress: string;
  toAddress: string;
  amountGHS: number;
  amountUSDC: number;
  amountWei: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  platformFee: number;
  message?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FaucetRequest {
  walletAddress: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface FaucetInfo {
  token_name: string;
  amount_per_request: string;
  cooldown_period: string;
  requirements: {
    min_eth_balance: string;
  };
  network: {
    name: string;
  };
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  currentDailyUsage: number;
  currentWeeklyUsage: number;
  currentMonthlyUsage: number;
  isAvailable: boolean;
  nextAvailableAt?: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error?.message || 'Request failed',
            code: data.error?.code || response.status.toString(),
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
        },
      };
    }
  }

  // Authentication endpoints
  async signup(userData: {
    clerkId: string;
    email?: string;
    phoneNumber?: string;
    walletAddress?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(identifier: string, password?: string): Promise<ApiResponse<{ user: UserProfile; token: string }>> {
    return this.request<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async sendOTP(phoneNumber: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> {
    return this.request<{ verified: boolean }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Profile endpoints
  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/profile/${userId}`);
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserTransactions(userId: string, limit?: number, offset?: number): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<Transaction[]>(`/profile/${userId}/transactions?${params.toString()}`);
  }

  // Vendor endpoints
  async registerVendor(vendorData: {
    ensName: string;
    businessName: string;
    businessType: string;
    description?: string;
    location?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    socialMedia?: Record<string, string>;
  }): Promise<ApiResponse<VendorProfile>> {
    return this.request<VendorProfile>('/vendor/register', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
    return this.request<VendorProfile>('/vendor/profile');
  }

  async updateVendorProfile(vendorData: Partial<VendorProfile>): Promise<ApiResponse<VendorProfile>> {
    return this.request<VendorProfile>('/vendor/profile', {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    });
  }

  async getVendors(limit?: number, offset?: number): Promise<ApiResponse<VendorProfile[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<VendorProfile[]>(`/vendor/?${params.toString()}`);
  }

  async getVendorByENS(ensName: string): Promise<ApiResponse<VendorProfile>> {
    return this.request<VendorProfile>(`/vendor/ens/${ensName}`);
  }

  // Menu endpoints
  async getMenuItems(category?: string, availableOnly: boolean = true): Promise<ApiResponse<MenuItem[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('available_only', availableOnly.toString());
    
    return this.request<MenuItem[]>(`/menu?${params.toString()}`);
  }

  async getPublicMenu(vendorId: string, category?: string): Promise<ApiResponse<MenuItem[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    return this.request<MenuItem[]>(`/menu/public/${vendorId}?${params.toString()}`);
  }

  async createMenuItem(menuItemData: {
    name: string;
    description?: string;
    priceGHS: number;
    category: string;
    imageUrl?: string;
    isAvailable?: boolean;
    sortOrder?: number;
  }): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(menuItemData),
    });
  }

  async updateMenuItem(menuItemId: string, menuItemData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>(`/menu/${menuItemId}`, {
      method: 'PUT',
      body: JSON.stringify(menuItemData),
    });
  }

  async deleteMenuItem(menuItemId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/menu/${menuItemId}`, {
      method: 'DELETE',
    });
  }

  // Transaction endpoints
  async createTransaction(transactionData: {
    orderId: string;
    vendorId?: string;
    fromAddress: string;
    toAddress: string;
    amountGHS: number;
    amountUSDC: number;
    amountWei: string;
    currency: string;
    message?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions/', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactionByOrderId(orderId: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/order/${orderId}`);
  }

  async updateTransactionStatus(transactionId: string, status: string, transactionHash?: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, transactionHash }),
    });
  }

  async getUserTransactions(userId: string, limit?: number, offset?: number): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<Transaction[]>(`/transactions/user/${userId}?${params.toString()}`);
  }

  async getVendorTransactions(vendorId: string, limit?: number, offset?: number): Promise<ApiResponse<Transaction[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return this.request<Transaction[]>(`/transactions/vendor/${vendorId}?${params.toString()}`);
  }

  async getTransactionStats(): Promise<ApiResponse<{
    totalTransactions: number;
    totalVolume: number;
    averageTransaction: number;
    transactionsByStatus: Record<string, number>;
    transactionsByMonth: Record<string, number>;
  }>> {
    return this.request('/transactions/stats/overview');
  }

  // Faucet endpoints
  async requestFaucet(walletAddress: string, amount: number = 10): Promise<ApiResponse<FaucetRequest>> {
    return this.request<FaucetRequest>('/faucet/request', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, amount }),
    });
  }

  async getFaucetStatus(walletAddress: string): Promise<ApiResponse<FaucetInfo>> {
    return this.request<FaucetInfo>(`/faucet/status/${walletAddress}`);
  }

  async getFaucetInfo(): Promise<ApiResponse<FaucetInfo>> {
    return this.request<FaucetInfo>('/faucet/info');
  }

  async getFaucetStats(): Promise<ApiResponse<{
    totalRequests: number;
    totalDistributed: number;
    activeUsers: number;
    requestsByDay: Record<string, number>;
  }>> {
    return this.request('/faucet/stats');
  }

  // Utility methods
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Error handling helper
  handleApiError(error: any): string {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

// Create and export singleton instance
export const apiService = new ApiService();

// Export types
export type {
  ApiResponse,
  UserProfile,
  VendorProfile,
  MenuItem,
  Transaction,
  FaucetRequest,
  FaucetInfo,
};
