"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { ensService } from '~~/services/ensService';
import { usePricing } from '~~/hooks/usePricing';
import PriceDisplay from '~~/components/PriceDisplay';
import BackArrow from '~~/components/BackArrow';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/20/solid';

interface ENSResult {
  name: string;
  address: string;
  avatar?: string;
  isVendor?: boolean;
  vendorInfo?: {
    businessName: string;
    description?: string;
    rating?: number;
  };
}

const SendToENS = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { convertGhsToUsdc, formatGhsPrice } = usePricing();
  
  const [ensQuery, setEnsQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ENSResult[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<ENSResult | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Get user's bUSDC balance
  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  // Smart contract integration
  const { writeContractAsync: writeBusdcAsync } = useScaffoldWriteContract({
    contractName: "bUSDC"
  });

  const searchENS = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Search for ENS names
      const results: ENSResult[] = [];
      
      // Add .eth names
      if (query.includes('.eth')) {
        const address = await ensService.resolveENS(query);
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          results.push({
            name: query,
            address: address,
            isVendor: query.includes('.tapngo.eth')
          });
        }
      } else {
        // Search for .tapngo.eth subnames
        const subname = `${query}.tapngo.eth`;
        const address = await ensService.resolveENS(subname);
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          results.push({
            name: subname,
            address: address,
            isVendor: true
          });
        }

        // Also try .eth
        const ethName = `${query}.eth`;
        const ethAddress = await ensService.resolveENS(ethName);
        if (ethAddress && ethAddress !== '0x0000000000000000000000000000000000000000') {
          results.push({
            name: ethName,
            address: ethAddress,
            isVendor: false
          });
        }
      }

      setSearchResults(results);
    } catch (err) {
      console.error('ENS search error:', err);
      setError('Failed to search ENS names');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchENS(ensQuery);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
      setAmount(sanitized);
    }
  };

  const handleSend = async () => {
    if (!selectedRecipient || !amount || !walletAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountGHS = parseFloat(amount);
      const amountWei = BigInt(Math.floor(amountGHS * 1e6)); // bUSDC has 6 decimals

      // Check balance
      if (busdcBalance && busdcBalance < amountWei) {
        throw new Error('Insufficient balance');
      }

      // Execute transfer
      await writeBusdcAsync({
        functionName: "transfer",
        args: [selectedRecipient.address, amountWei],
      });

      // Navigate to receipt page
      router.push(`/receipt?recipient=${encodeURIComponent(selectedRecipient.name)}&amount=${amountGHS}&message=${encodeURIComponent(message)}`);
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isWalletLinked) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please connect your wallet to send payments.</p>
          <button
            onClick={() => router.push('/user-dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <BackArrow />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Send to ENS</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
            {busdcBalance ? (
              <PriceDisplay 
                ghsAmount={convertGhsToUsdc(Number(busdcBalance) / 1e6)}
                showRate={false}
                size="sm"
              />
            ) : (
              <span className="text-sm font-semibold text-gray-900 dark:text-white">₵0.00</span>
            )}
          </div>
        </div>

        {/* ENS Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search ENS Name</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={ensQuery}
                onChange={(e) => setEnsQuery(e.target.value)}
                placeholder="Enter ENS name (e.g., jason.eth or shop.tapngo.eth)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            
            <button
              type="submit"
              disabled={searching || !ensQuery.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Search Results</h3>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRecipient(result)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedRecipient?.name === result.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {result.isVendor ? (
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{result.name}</span>
                        {result.isVendor && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Vendor
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.address.slice(0, 6)}...{result.address.slice(-4)}
                      </p>
                    </div>
                    {selectedRecipient?.name === result.name && (
                      <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Form */}
        {selectedRecipient && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Payment</h2>
            
            {/* Recipient Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  {selectedRecipient.isVendor ? (
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRecipient.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRecipient.address.slice(0, 6)}...{selectedRecipient.address.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (GHS)
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {amount && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    ≈ ${convertGhsToUsdc(parseFloat(amount) || 0).toFixed(2)} USDC
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : `Send ${amount ? formatGhsPrice(parseFloat(amount)) : 'Payment'}`}
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to send to ENS:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Enter an ENS name like "jason.eth" or "shop.tapngo.eth"</li>
            <li>• Tap&Go vendors use .tapngo.eth subnames</li>
            <li>• Regular users can have .eth names</li>
            <li>• The system will resolve the name to a wallet address</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SendToENS;
