"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from "~~/hooks/useWalletUser";
import { ensService } from "~~/services/ensService";
import { efpService } from "~~/services/efpService";
import { useEFPas } from "~~/hooks/useEFPas";
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';

const ENSSetup = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { 
    profile: efpasProfile,
    loading: efpasLoading, 
    error: efpasError,
    meetsVendorRequirements: efpasMeetsVendorRequirements,
    level: efpasLevel,
    levelColor: efpasLevelColor,
    levelIcon: efpasLevelIcon,
    levelDescription: efpasLevelDescription
  } = useEFPas(walletAddress || null);
  
  const efpasScore = efpasProfile?.score || 0;
  
  const [ensName, setEnsName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [efpVerification, setEfpVerification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  const handleCheckAvailability = async () => {
    if (!ensName.trim()) return;

    setIsChecking(true);
    setError(null);
    
    try {
      const validation = ensService.validateEnsName(ensName);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid ENS name');
        setIsAvailable(false);
        return;
      }

      const available = await ensService.isNameAvailable(ensName);
      setIsAvailable(available);
      
      if (available && walletAddress) {
        // Check EFP verification
        setIsVerifying(true);
        const efpResult = await efpService.verifyAddress(walletAddress as `0x${string}`);
        setEfpVerification(efpResult);
        setIsVerifying(false);
      }
    } catch (error) {
      setError('Error checking ENS availability');
      console.error('ENS check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClaimENS = async () => {
    if (!isAvailable || !walletAddress) return;
    
    try {
      // Here you would integrate with your SubnameRegistrar contract
      // For now, we'll just show a success message
      alert('ENS subname claiming would be implemented here with smart contract interaction');
    } catch (error) {
      setError('Error claiming ENS subname');
      console.error('ENS claim error:', error);
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'high': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      {/* Mobile and Tablet Layout */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 sm:hidden md:hidden">
        <div className="p-6">
          <BackArrow />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Setup ENS Subname
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Claim your unique .tapngo.eth subname for your business
            </p>

            {/* Wallet Connection Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Wallet Connection
              </h3>
              {isWalletLinked ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                  <span className="font-medium">Wallet Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-medium">Wallet Not Connected</span>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet connected'}
              </p>
            </div>

            {/* ENS Name Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Your Subname
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  placeholder="yourbusiness"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <span className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
                  .tapngo.eth
                </span>
              </div>
              <button
                onClick={handleCheckAvailability}
                disabled={isChecking || !ensName.trim()}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
              >
                {isChecking ? 'Checking...' : 'Check Availability'}
              </button>
            </div>

            {/* Availability Status */}
            {isAvailable !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Availability Status
                </h3>
                {isAvailable ? (
                  <div className="flex items-center space-x-2 text-green-600 mb-4">
                    <CheckIcon className="w-5 h-5" />
                    <span className="font-medium">Available!</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600 mb-4">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-medium">Not Available</span>
                  </div>
                )}
                
                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}

                {isAvailable && (
                  <button
                    onClick={handleClaimENS}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    Claim {ensName}.tapngo.eth
                  </button>
                )}
              </div>
            )}

            {/* EFP Verification */}
            {efpVerification && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  EFP Trust Score
                </h3>
                {isVerifying ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Verifying...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Trust Score:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrustLevelColor(efpService.getTrustLevel(efpVerification.trustScore))}`}>
                        {efpVerification.trustScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Followers:</span>
                      <span className="font-medium">{efpVerification.followers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Following:</span>
                      <span className="font-medium">{efpVerification.following}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EFPas Verification */}
            {walletAddress && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  EFPas Reputation Score
                </h3>
                {efpasLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading reputation...</span>
                  </div>
                ) : efpasError ? (
                  <div className="text-red-600 text-sm">
                    Failed to load EFPas score: {efpasError}
                  </div>
                ) : efpasScore ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reputation Score:</span>
                      <span className="font-medium">{efpasScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${efpasLevelColor}`}>
                        {efpasLevelIcon} {efpasLevel.charAt(0).toUpperCase() + efpasLevel.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Vendor Ready:</span>
                      <span className={efpasMeetsVendorRequirements ? 'text-green-600' : 'text-red-600'}>
                        {efpasMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    {efpasProfile?.attributes && (
                      <div>
                        <span className="text-gray-600 text-sm">Attributes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {efpasProfile.attributes.identityVerified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Identity Verified
                            </span>
                          )}
                          {efpasProfile.attributes.sybilResistant && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Sybil Resistant
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No EFPas reputation data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-8">
          <BackArrow />
          
          <div className="mt-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Setup ENS Subname
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Claim your unique .tapngo.eth subname for your business
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Wallet Connection Status */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Wallet Connection
                  </h3>
                  {isWalletLinked ? (
                    <div className="flex items-center space-x-3 text-green-600">
                      <CheckIcon className="w-6 h-6" />
                      <span className="font-medium text-lg">Wallet Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-red-600">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                      <span className="font-medium text-lg">Wallet Not Connected</span>
                    </div>
                  )}
                  <p className="text-gray-500 mt-2">
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'No wallet connected'}
                  </p>
                </div>

                {/* ENS Name Input */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Choose Your Subname
                  </h3>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      placeholder="yourbusiness"
                      className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                    />
                    <span className="px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-lg">
                      .tapngo.eth
                    </span>
                  </div>
                  <button
                    onClick={handleCheckAvailability}
                    disabled={isChecking || !ensName.trim()}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
                  >
                    {isChecking ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Availability Status */}
                {isAvailable !== null && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Availability Status
                    </h3>
                    {isAvailable ? (
                      <div className="flex items-center space-x-3 text-green-600 mb-6">
                        <CheckIcon className="w-6 h-6" />
                        <span className="font-medium text-lg">Available!</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-red-600 mb-6">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                        <span className="font-medium text-lg">Not Available</span>
                      </div>
                    )}
                    
                    {error && (
                      <p className="text-red-600 mb-6">{error}</p>
                    )}

                    {isAvailable && (
                      <button
                        onClick={handleClaimENS}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
                      >
                        Claim {ensName}.tapngo.eth
                      </button>
                    )}
                  </div>
                )}

                {/* EFP Verification */}
                {efpVerification && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      EFP Trust Score
                    </h3>
                    {isVerifying ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 text-lg">Verifying...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Trust Score:</span>
                          <span className={`px-4 py-2 rounded-full text-lg font-medium ${getTrustLevelColor(efpService.getTrustLevel(efpVerification.trustScore))}`}>
                            {efpVerification.trustScore}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Followers:</span>
                          <span className="font-medium text-lg">{efpVerification.followers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Following:</span>
                          <span className="font-medium text-lg">{efpVerification.following}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EFPas Verification */}
                {walletAddress && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      EFPas Reputation Score
                    </h3>
                    {efpasLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 text-lg">Loading reputation...</span>
                      </div>
                    ) : efpasError ? (
                      <div className="text-red-600 text-lg">
                        Failed to load EFPas score: {efpasError}
                      </div>
                    ) : efpasScore ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Reputation Score:</span>
                          <span className="font-medium text-lg">{efpasScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Level:</span>
                          <span className={`px-4 py-2 rounded-full text-lg font-medium ${efpasLevelColor}`}>
                            {efpasLevelIcon} {efpasLevel.charAt(0).toUpperCase() + efpasLevel.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-lg">Vendor Ready:</span>
                          <span className={efpasMeetsVendorRequirements ? 'text-green-600 text-lg' : 'text-red-600 text-lg'}>
                            {efpasMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                        {efpasProfile?.attributes && (
                          <div>
                            <span className="text-gray-600 text-lg">Attributes:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {efpasProfile.attributes.identityVerified && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                                  Identity Verified
                                </span>
                              )}
                              {efpasProfile.attributes.sybilResistant && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg">
                                  Sybil Resistant
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-lg">
                        No EFPas reputation data available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ENSSetup;
