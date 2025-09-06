import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiService, User, Vendor, Transaction } from '~~/services/api';

export interface UserData {
  user: User | null;
  vendor: Vendor | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export const useUserData = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData>({
    user: null,
    vendor: null,
    transactions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !clerkUser) {
        setUserData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setUserData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch user data
        const userResponse = await apiService.getUser(clerkUser.id);
        if (!userResponse.success) {
          throw new Error(userResponse.error || 'Failed to fetch user data');
        }

        const user = userResponse.data!;
        setUserData(prev => ({ ...prev, user }));

        // If user is a vendor, fetch vendor data
        if (user.isVendor) {
          const vendorResponse = await apiService.getVendor(clerkUser.id);
          if (vendorResponse.success) {
            setUserData(prev => ({ ...prev, vendor: vendorResponse.data! }));
          }
        }

        // Fetch transactions
        const transactionsResponse = await apiService.getTransactions(clerkUser.id);
        if (transactionsResponse.success) {
          setUserData(prev => ({ ...prev, transactions: transactionsResponse.data! }));
        }

        setUserData(prev => ({ ...prev, loading: false }));
      } catch (error) {
        setUserData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
      }
    };

    fetchUserData();
  }, [isLoaded, clerkUser]);

  const refreshUserData = async () => {
    if (!clerkUser) return;

    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }));

      const userResponse = await apiService.getUser(clerkUser.id);
      if (userResponse.success) {
        setUserData(prev => ({ ...prev, user: userResponse.data! }));
      }

      if (userData.user?.isVendor) {
        const vendorResponse = await apiService.getVendor(clerkUser.id);
        if (vendorResponse.success) {
          setUserData(prev => ({ ...prev, vendor: vendorResponse.data! }));
        }
      }

      const transactionsResponse = await apiService.getTransactions(clerkUser.id);
      if (transactionsResponse.success) {
        setUserData(prev => ({ ...prev, transactions: transactionsResponse.data! }));
      }

      setUserData(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  return {
    ...userData,
    refreshUserData,
  };
};
