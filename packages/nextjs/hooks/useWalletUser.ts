import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useUser, useClerk } from '@clerk/nextjs';

interface WalletUser {
  walletAddress: string | undefined;
  isConnected: boolean;
  isWalletLinked: boolean;
  linkWallet: () => Promise<void>;
  unlinkWallet: () => Promise<void>;
  loading: boolean;
}

export const useWalletUser = (): WalletUser => {
  const { address, isConnected } = useAccount();
  const { user, isLoaded } = useUser();
  const { user: clerkUser } = useClerk();
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if wallet is linked to Clerk user
  useEffect(() => {
    if (isLoaded && user && address) {
      // Check if the wallet address is stored in Clerk user metadata
      const linkedWallets = user.publicMetadata?.linkedWallets as string[] || [];
      setIsWalletLinked(linkedWallets.includes(address.toLowerCase()));
    }
  }, [isLoaded, user, address]);

  const linkWallet = async (): Promise<void> => {
    if (!user || !address) return;

    setLoading(true);
    try {
      // Add wallet address to Clerk user metadata
      const currentWallets = (user.publicMetadata?.linkedWallets as string[]) || [];
      const updatedWallets = [...currentWallets, address.toLowerCase()];

      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          linkedWallets: updatedWallets,
          primaryWallet: address.toLowerCase(), // Set as primary wallet
        },
      });

      setIsWalletLinked(true);
    } catch (error) {
      console.error('Error linking wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unlinkWallet = async (): Promise<void> => {
    if (!user || !address) return;

    setLoading(true);
    try {
      const currentWallets = (user.publicMetadata?.linkedWallets as string[]) || [];
      const updatedWallets = currentWallets.filter(wallet => wallet !== address.toLowerCase());

      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          linkedWallets: updatedWallets,
          primaryWallet: updatedWallets[0] || null, // Set first remaining wallet as primary
        },
      });

      setIsWalletLinked(false);
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    walletAddress: address,
    isConnected,
    isWalletLinked,
    linkWallet,
    unlinkWallet,
    loading,
  };
};
