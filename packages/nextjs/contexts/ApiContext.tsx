"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiService, UserProfile, VendorProfile } from '~~/services/apiService';

interface ApiContextType {
  // Authentication state
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  vendorProfile: VendorProfile | null;
  authLoading: boolean;
  authError: string | null;
  
  // Actions
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  verifyPhoneNumber: (phoneNumber: string) => Promise<boolean>;
  confirmPhoneOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
  
  // Vendor actions
  refreshVendorProfile: () => Promise<void>;
  registerAsVendor: (data: any) => Promise<boolean>;
  updateVendorProfile: (data: Partial<VendorProfile>) => Promise<boolean>;
  
  // Utility
  clearError: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        setIsAuthenticated(false);
        setUserProfile(null);
        setVendorProfile(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setAuthError(null);

      try {
        // Try to get existing user profile with timeout
        const response = await Promise.race([
          apiService.getCurrentUser(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          )
        ]) as any;
        
        if (response.success && response.data) {
          setUserProfile(response.data);
          setIsAuthenticated(true);
          
          // Check vendor status in background (non-blocking)
          checkVendorStatus().catch(console.error);
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
            setAuthError(signupResponse.error?.message || 'Failed to create user profile');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Don't block the app if backend is unavailable
        setAuthError('Backend temporarily unavailable');
        setIsAuthenticated(true); // Allow app to work with Clerk auth only
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [isLoaded, user]);

  // Check vendor status
  const checkVendorStatus = async () => {
    try {
      const response = await apiService.getVendorProfile();
      if (response.success && response.data) {
        setVendorProfile(response.data);
      }
    } catch (error) {
      // User is not a vendor, which is fine
      setVendorProfile(null);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        setUserProfile(response.data);
        setIsAuthenticated(true);
      } else {
        setAuthError(response.error?.message || 'Failed to refresh profile');
      }
    } catch (error) {
      setAuthError('Failed to refresh profile');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      const response = await apiService.updateProfile(data);
      if (response.success && response.data) {
        setUserProfile(response.data);
        return true;
      } else {
        setAuthError(response.error?.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      setAuthError('Failed to update profile');
      return false;
    }
  };

  // Verify phone number
  const verifyPhoneNumber = async (phoneNumber: string): Promise<boolean> => {
    try {
      const response = await apiService.sendOTP(phoneNumber);
      if (response.success) {
        return true;
      } else {
        setAuthError(response.error?.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      setAuthError('Failed to send OTP');
      return false;
    }
  };

  // Confirm phone OTP
  const confirmPhoneOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const response = await apiService.verifyOTP(phoneNumber, otp);
      if (response.success && response.data?.verified) {
        // Refresh user profile to get updated verification status
        await refreshUserProfile();
        return true;
      } else {
        setAuthError(response.error?.message || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      setAuthError('Failed to verify OTP');
      return false;
    }
  };

  // Refresh vendor profile
  const refreshVendorProfile = async () => {
    try {
      const response = await apiService.getVendorProfile();
      if (response.success && response.data) {
        setVendorProfile(response.data);
      } else {
        setVendorProfile(null);
      }
    } catch (error) {
      setVendorProfile(null);
    }
  };

  // Register as vendor
  const registerAsVendor = async (data: any): Promise<boolean> => {
    try {
      const response = await apiService.registerVendor(data);
      if (response.success && response.data) {
        setVendorProfile(response.data);
        return true;
      } else {
        setAuthError(response.error?.message || 'Failed to register as vendor');
        return false;
      }
    } catch (error) {
      setAuthError('Failed to register as vendor');
      return false;
    }
  };

  // Update vendor profile
  const updateVendorProfile = async (data: Partial<VendorProfile>): Promise<boolean> => {
    try {
      const response = await apiService.updateVendorProfile(data);
      if (response.success && response.data) {
        setVendorProfile(response.data);
        return true;
      } else {
        setAuthError(response.error?.message || 'Failed to update vendor profile');
        return false;
      }
    } catch (error) {
      setAuthError('Failed to update vendor profile');
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setAuthError(null);
  };

  const value: ApiContextType = {
    // State
    isAuthenticated,
    userProfile,
    vendorProfile,
    authLoading,
    authError,
    
    // Actions
    refreshUserProfile,
    updateUserProfile,
    verifyPhoneNumber,
    confirmPhoneOTP,
    
    // Vendor actions
    refreshVendorProfile,
    registerAsVendor,
    updateVendorProfile,
    
    // Utility
    clearError,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApiContext = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

// Higher-order component for API authentication
export const withApiAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, authLoading } = useApiContext();
    
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to access this feature.
            </p>
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
