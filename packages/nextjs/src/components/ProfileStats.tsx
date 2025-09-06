'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { EFPService } from '@/services/efpService';

interface ProfileStatsProps {
  address: string;
}

interface Stats {
  followers: number;
  following: number;
  totalTransactions: number;
  totalVolume: number;
  rating: number;
}

export default function ProfileStats({ address }: ProfileStatsProps) {
  const { address: currentUserAddress } = useAccount();
  const [stats, setStats] = useState<Stats>({
    followers: 0,
    following: 0,
    totalTransactions: 0,
    totalVolume: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [address]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get EFP stats
      const efpProfile = await EFPService.getProfile(address);
      
      // In a real implementation, you would also fetch transaction stats from your contracts
      setStats({
        followers: efpProfile.followers || 0,
        following: efpProfile.following || 0,
        totalTransactions: 0, // Would come from PaymentRouter contract
        totalVolume: 0, // Would come from PaymentRouter contract
        rating: 0 // Would come from vendor rating system
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Statistics</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-300 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.followers}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.following}</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</div>
          <div className="text-sm text-gray-600">Transactions</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalVolume.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Volume (bUSDC)</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.rating.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>

      {/* Additional stats for vendors */}
      {currentUserAddress?.toLowerCase() === address.toLowerCase() && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Your Activity</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-800">Vendor Payments</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-lg font-bold text-green-600">0</div>
              <div className="text-sm text-green-800">P2P Transfers</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-lg font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-800">NFC Payments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
