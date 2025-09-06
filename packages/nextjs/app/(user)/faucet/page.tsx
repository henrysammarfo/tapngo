"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useAccount } from 'wagmi';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useFaucet } from '~~/hooks/useApi';
import { useApiContext } from '~~/contexts/ApiContext';
import BackArrow from '~~/components/BackArrow';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  BanknotesIcon,
  ClockIcon,
  WalletIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/20/solid';

import { FaucetInfo } from '~~/services/apiService';

interface FaucetStatus {
  wallet_address: string;
  eth_balance: string;
  busdc_balance: string;
  can_request: boolean;
  faucet_cooldown: string;
  contract_address: string;
}

const FaucetPage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { address: connectedWalletAddress, isConnected } = useAccount();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { isAuthenticated } = useApiContext();

  const { 
    faucetInfo, 
    loading, 
    error, 
    getFaucetInfo, 
    requestFaucet, 
    getFaucetStatus 
  } = useFaucet();

  const [faucetStatus, setFaucetStatus] = useState<FaucetStatus | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Smart contract interactions
  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const { data: canClaimData } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "canClaimFaucet",
    args: [walletAddress],
  });

  const { writeContractAsync: writeFaucetAsync } = useScaffoldWriteContract({
    contractName: "bUSDC",
  });

  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      router.push('/sign-in');
    }
  }, [clerkLoaded, clerkUser, router]);

  useEffect(() => {
    if (isAuthenticated) {
      getFaucetInfo();
    }
  }, [isAuthenticated, getFaucetInfo]);

  useEffect(() => {
    if (walletAddress && isAuthenticated) {
      getFaucetStatus(walletAddress);
    }
  }, [walletAddress, isAuthenticated, getFaucetStatus]);

  const handleClaimFaucet = async () => {
    if (!walletAddress || !isWalletLinked) {
      setLocalError('Please connect and link your wallet first');
      return;
    }

    if (!canClaimData || !canClaimData[0]) {
      setLocalError('You cannot claim from the faucet at this time. Please check the cooldown period.');
      return;
    }

    setRequesting(true);
    setLocalError(null);
    setSuccess(null);

    try {
      // First request from backend API
      const apiResponse = await requestFaucet(walletAddress, 10);
      
      if (apiResponse.success) {
        // Then call the smart contract
        await writeFaucetAsync({
          functionName: "claimFaucet",
        });

        setSuccess('Successfully claimed bUSDC from faucet!');
        
        // Refresh status after successful claim
        setTimeout(() => {
          getFaucetStatus(walletAddress);
        }, 2000);
      } else {
        setLocalError(typeof apiResponse.error === 'string' ? apiResponse.error : 'Failed to request from faucet');
      }
    } catch (err: any) {
      console.error('Failed to claim faucet:', err);
      setLocalError(err.message || 'Failed to claim from faucet');
    } finally {
      setRequesting(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return (Number(balance) / 1e6).toFixed(2);
  };

  const getTimeUntilClaim = () => {
    if (!canClaimData || canClaimData[0]) {
      return 'Available now';
    }
    
    const timeUntilClaim = Number(canClaimData[1]);
    const hours = Math.floor(timeUntilClaim / 3600);
    const minutes = Math.floor((timeUntilClaim % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!clerkLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clerkUser) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <BackArrow />
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 mt-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <BanknotesIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            bUSDC Faucet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get test bUSDC tokens to try Tap&Go Pay
          </p>
        </div>

        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">{error || localError}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Wallet Status */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <WalletIcon className="h-5 w-5 mr-2" />
                Wallet Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Connection:</span>
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Linked:</span>
                  <span className={isWalletLinked ? 'text-green-600' : 'text-red-600'}>
                    {isWalletLinked ? 'Linked' : 'Not Linked'}
                  </span>
                </div>
                {walletAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Address:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Balance */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Balance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">bUSDC:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBalance(busdcBalance)} bUSDC
                  </span>
                </div>
                {faucetStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ETH:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faucetStatus.eth_balance} ETH
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Faucet Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Faucet Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Can Claim:</span>
                  <span className={canClaimData?.[0] ? 'text-green-600' : 'text-red-600'}>
                    {canClaimData?.[0] ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Until Claim:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {getTimeUntilClaim()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Claim Faucet */}
          <div className="space-y-6">
            {/* Claim Section */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Claim bUSDC
              </h3>
              {faucetInfo && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {faucetInfo?.amount_per_request || '10'} bUSDC
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Available per claim
                    </p>
                  </div>

                  <button
                    onClick={handleClaimFaucet}
                    disabled={!isWalletLinked || !canClaimData?.[0] || loading}
                    className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <BanknotesIcon className="h-5 w-5" />
                    )}
                    <span>{loading ? 'Claiming...' : 'Claim bUSDC'}</span>
                  </button>

                  {!isWalletLinked && (
                    <p className="text-sm text-red-600 text-center">
                      Please connect and link your wallet to claim tokens
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Faucet Information */}
            {faucetInfo && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Faucet Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Token:</span>
                    <span className="text-gray-900 dark:text-white">{faucetInfo?.token_name || 'bUSDC'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="text-gray-900 dark:text-white">{faucetInfo?.amount_per_request || '10'} per claim</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cooldown:</span>
                    <span className="text-gray-900 dark:text-white">{faucetInfo?.cooldown_period || '24 hours'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="text-gray-900 dark:text-white">{faucetInfo?.network?.name || 'Base Sepolia'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Min ETH:</span>
                    <span className="text-gray-900 dark:text-white">{faucetInfo?.requirements?.min_eth_balance || '0.001'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Requirements
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Connected Web3 wallet (MetaMask, Coinbase, etc.)
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Minimum 0.001 ETH for gas fees
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  Base Sepolia network
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  24-hour cooldown between claims
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaucetPage;
