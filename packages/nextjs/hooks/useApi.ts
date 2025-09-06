import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiService, ApiResponse, UserProfile, VendorProfile, MenuItem, Transaction, FaucetInfo } from '~~/services/apiService';

// Custom hook for API authentication
export const useApiAuth = () => {
  const { user, isLoaded } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // Try to get or create user profile
        const response = await apiService.getCurrentUser();
        
        if (response.success && response.data) {
          setUserProfile(response.data);
          setIsAuthenticated(true);
        } else {
          // User doesn't exist in backend, create profile
          const signupResponse = await apiService.signup({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            phoneNumber: user.primaryPhoneNumber?.phoneNumber,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
          });

          if (signupResponse.success && signupResponse.data) {
            setUserProfile(signupResponse.data);
            setIsAuthenticated(true);
          } else {
            setError(signupResponse.error?.message || 'Failed to create user profile');
          }
        }
      } catch (err) {
        setError('Failed to authenticate with backend');
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isLoaded, user]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!userProfile) return { success: false, error: 'No user profile' };

    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success && response.data) {
        setUserProfile(response.data);
      }
      return response;
    } catch (err) {
      return { success: false, error: 'Failed to update profile' };
    }
  }, [userProfile]);

  const verifyPhone = useCallback(async (phoneNumber: string) => {
    try {
      const otpResponse = await apiService.sendOTP(phoneNumber);
      if (otpResponse.success) {
        return { success: true, message: 'OTP sent successfully' };
      }
      return otpResponse;
    } catch (err) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }, []);

  const confirmOTP = useCallback(async (phoneNumber: string, otp: string) => {
    try {
      const response = await apiService.verifyOTP(phoneNumber, otp);
      if (response.success && response.data?.verified) {
        // Refresh user profile to get updated verification status
        const profileResponse = await apiService.getCurrentUser();
        if (profileResponse.success && profileResponse.data) {
          setUserProfile(profileResponse.data);
        }
      }
      return response;
    } catch (err) {
      return { success: false, error: 'Failed to verify OTP' };
    }
  }, []);

  return {
    isAuthenticated,
    userProfile,
    loading,
    error,
    updateProfile,
    verifyPhone,
    confirmOTP,
  };
};

// Custom hook for vendor operations
export const useVendor = () => {
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVendorProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getVendorProfile();
      if (response.success && response.data) {
        setVendorProfile(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch vendor profile');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch vendor profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const registerVendor = useCallback(async (vendorData: {
    ensName: string;
    businessName: string;
    businessType: string;
    description?: string;
    location?: string;
    phoneNumber?: string;
    email?: string;
    website?: string;
    socialMedia?: Record<string, string>;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.registerVendor(vendorData);
      if (response.success && response.data) {
        setVendorProfile(response.data);
      } else {
        setError(response.error?.message || 'Failed to register vendor');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to register vendor';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendorProfile = useCallback(async (vendorData: Partial<VendorProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateVendorProfile(vendorData);
      if (response.success && response.data) {
        setVendorProfile(response.data);
      } else {
        setError(response.error?.message || 'Failed to update vendor profile');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to update vendor profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vendorProfile,
    loading,
    error,
    getVendorProfile,
    registerVendor,
    updateVendorProfile,
  };
};

// Custom hook for menu management
export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMenuItems = useCallback(async (category?: string, availableOnly: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getMenuItems(category, availableOnly);
      if (response.success && response.data) {
        setMenuItems(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch menu items');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch menu items';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createMenuItem = useCallback(async (menuItemData: {
    name: string;
    description?: string;
    priceGHS: number;
    category: string;
    imageUrl?: string;
    isAvailable?: boolean;
    sortOrder?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createMenuItem(menuItemData);
      if (response.success && response.data) {
        setMenuItems(prev => [...prev, response.data!]);
      } else {
        setError(response.error?.message || 'Failed to create menu item');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to create menu item';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (menuItemId: string, menuItemData: Partial<MenuItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateMenuItem(menuItemId, menuItemData);
      if (response.success && response.data) {
        setMenuItems(prev => prev.map(item => 
          item.id === menuItemId ? response.data! : item
        ));
      } else {
        setError(response.error?.message || 'Failed to update menu item');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to update menu item';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (menuItemId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.deleteMenuItem(menuItemId);
      if (response.success) {
        setMenuItems(prev => prev.filter(item => item.id !== menuItemId));
      } else {
        setError(response.error?.message || 'Failed to delete menu item');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to delete menu item';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    menuItems,
    loading,
    error,
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
};

// Custom hook for transactions
export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserTransactions = useCallback(async (userId: string, limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getUserTransactions(userId, limit, offset);
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch transactions');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch transactions';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (transactionData: {
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
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createTransaction(transactionData);
      if (response.success && response.data) {
        setTransactions(prev => [response.data!, ...prev]);
      } else {
        setError(response.error?.message || 'Failed to create transaction');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to create transaction';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransactionStatus = useCallback(async (transactionId: string, status: string, transactionHash?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateTransactionStatus(transactionId, status, transactionHash);
      if (response.success && response.data) {
        setTransactions(prev => prev.map(tx => 
          tx.id === transactionId ? response.data! : tx
        ));
      } else {
        setError(response.error?.message || 'Failed to update transaction');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to update transaction';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    getUserTransactions,
    createTransaction,
    updateTransactionStatus,
  };
};

// Custom hook for faucet operations
export const useFaucet = () => {
  const [faucetInfo, setFaucetInfo] = useState<FaucetInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFaucetInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getFaucetInfo();
      if (response.success && response.data) {
        setFaucetInfo(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch faucet info');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch faucet info';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const requestFaucet = useCallback(async (walletAddress: string, amount: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.requestFaucet(walletAddress, amount);
      if (response.success) {
        // Refresh faucet info after successful request
        await getFaucetInfo();
      } else {
        setError(response.error?.message || 'Failed to request faucet');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to request faucet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [getFaucetInfo]);

  const getFaucetStatus = useCallback(async (walletAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getFaucetStatus(walletAddress);
      if (response.success && response.data) {
        setFaucetInfo(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch faucet status');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch faucet status';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    faucetInfo,
    loading,
    error,
    getFaucetInfo,
    requestFaucet,
    getFaucetStatus,
  };
};

// Custom hook for vendor discovery
export const useVendorDiscovery = () => {
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVendors = useCallback(async (limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getVendors(limit, offset);
      if (response.success && response.data) {
        setVendors(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch vendors');
      }
      return response;
    } catch (err) {
      const errorMsg = 'Failed to fetch vendors';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getVendorByENS = useCallback(async (ensName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getVendorByENS(ensName);
      if (response.success && response.data) {
        return response;
      } else {
        setError(response.error?.message || 'Failed to fetch vendor');
        return response;
      }
    } catch (err) {
      const errorMsg = 'Failed to fetch vendor';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vendors,
    loading,
    error,
    getVendors,
    getVendorByENS,
  };
};
