'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/wagmi';
import { FaucetService } from '@/services/faucetService';

export default function FaucetButton() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's bUSDC balance
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

  const handleClaimFaucet = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if user can claim from faucet
      const { canClaim, timeUntilClaim } = await FaucetService.canClaimFaucet(address);
      if (!canClaim) {
        const hours = Math.floor(timeUntilClaim / 3600);
        const minutes = Math.floor((timeUntilClaim % 3600) / 60);
        setError(`You cannot claim tokens yet. Please wait ${hours}h ${minutes}m.`);
        setLoading(false);
        return;
      }

      // Claim tokens from faucet
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
        functionName: 'claimFaucet'
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens from faucet');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return (Number(balance) / 1e6).toFixed(2);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Test Token Faucet</h3>
        <p className="text-gray-600 text-sm">Get test bUSDC tokens for testing</p>
      </div>

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Your Balance:</span>
            <span className="font-semibold text-lg">
              {formatBalance(balance)} bUSDC
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">✅ Tokens requested successfully!</p>
          </div>
        )}

        {/* Claim Button */}
        <button
          onClick={handleClaimFaucet}
          disabled={loading || !address}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Claiming...' : 'Claim 10 bUSDC'}
        </button>

        <div className="text-xs text-gray-500 text-center">
          <p>Claim 10 bUSDC every 24 hours. This faucet provides test tokens on Base Sepolia for development and testing purposes.</p>
        </div>
      </div>
    </div>
  );
}
