'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '@/lib/wagmi';
import UserProfile from '@/components/UserProfile';
import ProfileSetup from '@/components/ProfileSetup';
import SubnameRegistration from '@/components/SubnameRegistration';
import FaucetButton from '@/components/FaucetButton';
import ContractStatus from '@/components/ContractStatus';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Get bUSDC balance
  const { data: balance } = useReadContract({
    address: CONTRACTS.bUSDC as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (address) {
      // Check if user has a profile
      const hasProfile = localStorage.getItem(`profile_${address}`);
      if (!hasProfile) {
        setShowProfileSetup(true);
      }
    }
  }, [address]);

  if (!isConnected) {
    return null;
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return (Number(balance) / 1e6).toFixed(2);
  };

  const formatGHSBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    const usdcAmount = Number(balance) / 1e6;
    const ghsAmount = usdcAmount * 15.5; // 1 USDC = 15.5 GHS
    return ghsAmount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T&G</span>
              </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tap&Go Pay
              </h1>
              <p className="text-gray-700 text-sm">Dashboard</p>
            </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
        {/* User Profile or Profile Setup */}
        {address && (
          <div className="mb-8">
            {showProfileSetup ? (
              <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
            ) : (
              <UserProfile address={address} />
            )}
          </div>
        )}

        {/* Subname Registration */}
        {address && !showProfileSetup && (
          <div className="mb-8">
            <SubnameRegistration />
          </div>
        )}

        {/* Faucet */}
        {address && !showProfileSetup && (
          <div className="mb-8">
            <FaucetButton />
          </div>
        )}

        {/* Contract Status */}
        {address && !showProfileSetup && (
          <div className="mb-8">
            <ContractStatus />
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Balance</h2>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2 text-white">
            ₵{(Number(formatBalance(balance)) * 15.5).toFixed(2)} GHS
          </div>
          <p className="text-blue-100 text-lg">{formatBalance(balance)} bUSDC</p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-blue-100">Live on Base Sepolia</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/payment')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send Money</h3>
            <p className="text-gray-600">Send to ENS names, addresses, or scan QR codes</p>
          </button>

          <button
            onClick={() => router.push('/receive-money')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Receive Money</h3>
            <p className="text-gray-600">Generate QR codes or share your ENS name</p>
          </button>

          <button
            onClick={() => router.push('/faucet')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🚰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Test Tokens</h3>
            <p className="text-gray-600">Claim 10 bUSDC from the faucet</p>
          </button>

          <button
            onClick={() => router.push('/vendor-register')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-8 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🏪</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Become Vendor</h3>
            <p className="text-gray-600">Register your business to accept payments</p>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/transaction-history')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">History</h3>
            <p className="text-gray-600 text-sm">View transaction history</p>
          </button>

          <button
            onClick={() => router.push('/ens-lookup')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">ENS Lookup</h3>
            <p className="text-gray-600 text-sm">Resolve .eth names</p>
          </button>

        <button
          onClick={() => router.push('/efp-social')}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">EFP Social</h3>
          <p className="text-gray-600 text-sm">Social profiles & connections</p>
        </button>

        <button
          onClick={() => router.push('/ens-lookup')}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">ENS Lookup</h3>
          <p className="text-gray-600 text-sm">Resolve ENS names & addresses</p>
        </button>

        <button
          onClick={() => router.push('/vendor-search')}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3">
            <span className="text-2xl">🏪</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Vendor Search</h3>
          <p className="text-gray-600 text-sm">Find registered vendors</p>
        </button>

        <button
          onClick={() => router.push('/vendor-register')}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Register Vendor</h3>
          <p className="text-gray-600 text-sm">Register your business</p>
        </button>

          <button
            onClick={() => router.push('/nfc-pay')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">📲</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">NFC Pay</h3>
            <p className="text-gray-600 text-sm">Tap to pay with NFC</p>
          </button>

          <button
            onClick={() => router.push('/paymaster')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 text-left transition-all duration-300 transform hover:scale-105 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3">
              <span className="text-2xl">⛽</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Paymaster</h3>
            <p className="text-gray-600 text-sm">Gas sponsorship info</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📈</span>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-6">Your transaction history will appear here once you start making payments</p>
            <button
              onClick={() => router.push('/payment')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Make Your First Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
