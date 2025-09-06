const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isVendor: boolean;
  isVerified: boolean;
  ensName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  ensName: string;
  phone: string;
  isVerified: boolean;
  isApproved: boolean;
  efpVerified: boolean;
  efpasScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amountGHS: number;
  amountUSDC: number;
  fxRate: number;
  status: 'pending' | 'completed' | 'failed';
  orderId: string;
  vendorEns?: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User endpoints
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Vendor endpoints
  async getVendor(userId: string): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>(`/vendors/${userId}`);
  }

  async createVendor(vendorData: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    });
  }

  async updateVendor(userId: string, updates: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>(`/vendors/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Transaction endpoints
  async getTransactions(userId: string): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(`/transactions/user/${userId}`);
  }

  async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${transactionId}`);
  }

  async createTransaction(transactionData: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Menu endpoints
  async getMenu(vendorId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/menu/vendor/${vendorId}`);
  }

  async createMenuItem(vendorId: string, itemData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/menu', {
      method: 'POST',
      body: JSON.stringify({ ...itemData, vendorId }),
    });
  }

  async updateMenuItem(itemId: string, updates: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMenuItem(itemId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/menu/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Faucet endpoint
  async requestFaucet(userId: string, amount: number): Promise<ApiResponse<any>> {
    return this.request<any>('/faucet', {
      method: 'POST',
      body: JSON.stringify({ userId, amount }),
    });
  }
}

export const apiService = new ApiService();
