'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/wagmi';

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Check if can claim from faucet
  const { data: canClaim } = useReadContract({
    address: CONTRACTS.bUSDC as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "canClaimFaucet",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'canClaimFaucet',
    args: [address!],
    query: { enabled: !!address }
  });

  // Write contract for claiming
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleClaimFaucet = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await writeContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: [
          {
            "inputs": [],
            "name": "claimFaucet",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'claimFaucet',
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to claim from faucet');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return (Number(balance) / 1e6).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">bUSDC Faucet</h1>
              <p className="text-gray-600">Get test tokens for Base Sepolia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Balance</h2>
          <div className="text-3xl font-bold text-blue-600">
            {formatBalance(balance)} bUSDC
          </div>
          <p className="text-gray-600 mt-2">≈ ₵{(Number(formatBalance(balance)) * 15.5).toFixed(2)} GHS</p>
        </div>

        {/* Faucet Claim */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Test Tokens</h2>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">10 bUSDC</div>
            <p className="text-gray-600">Available per claim</p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800">Successfully claimed 10 bUSDC from faucet!</p>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaimFaucet}
            disabled={loading || !isConnected || !canClaim}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Claiming...' : 'Claim 10 bUSDC'}
          </button>

          {/* Status Info */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Wallet Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
            <p>Can Claim: {canClaim ? '✅ Yes' : '❌ No (24h cooldown)'}</p>
            {!isConnected && (
              <p className="text-red-600 mt-2">Please connect your wallet to claim tokens</p>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Faucet Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Get 10 bUSDC test tokens per claim</li>
            <li>• 24-hour cooldown between claims</li>
            <li>• Only works on Base Sepolia testnet</li>
            <li>• Tokens are for testing purposes only</li>
            <li>• No real value - testnet only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
