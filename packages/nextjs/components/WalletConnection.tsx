"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useUser } from '@clerk/nextjs';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { CheckIcon, LinkIcon, XMarkIcon } from '@heroicons/react/20/solid';

export const WalletConnection: React.FC = () => {
  const { user, isLoaded } = useUser();
  const { isConnected } = useAccount();
  const { isWalletLinked, linkWallet, unlinkWallet, loading } = useWalletUser();
  const [isLinking, setIsLinking] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't show wallet connection if user is not logged in
  }

  const handleLinkWallet = async () => {
    if (!isConnected) return;
    
    setIsLinking(true);
    try {
      await linkWallet();
    } catch (error) {
      console.error('Failed to link wallet:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    setIsLinking(true);
    try {
      await unlinkWallet();
    } catch (error) {
      console.error('Failed to unlink wallet:', error);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Wallet Connection */}
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const connected = mounted && account && chain;

          if (!connected) {
            return (
              <button
                onClick={openConnectModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Connect Wallet
              </button>
            );
          }

          return (
            <div className="flex items-center space-x-2">
              {/* Wallet Address Display */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>

              {/* Link/Unlink Button */}
              {isWalletLinked ? (
                <button
                  onClick={handleUnlinkWallet}
                  disabled={isLinking}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {isLinking ? (
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <XMarkIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Unlink</span>
                </button>
              ) : (
                <button
                  onClick={handleLinkWallet}
                  disabled={isLinking || loading}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {isLinking ? (
                    <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Link Wallet</span>
                </button>
              )}

              {/* Linked Status Indicator */}
              {isWalletLinked && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Linked</span>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};
