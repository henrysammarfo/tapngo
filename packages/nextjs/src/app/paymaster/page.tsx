'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymasterService } from '@/services/paymasterService';

export default function PaymasterPage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadPaymasterData = async () => {
      setLoading(true);
      try {
        const [configData, statsData] = await Promise.all([
          PaymasterService.getConfig(),
          PaymasterService.getStats()
        ]);
        setConfig(configData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading paymaster data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymasterData();
  }, []);

  if (!isConnected) {
    return null;
  }

  const formatEther = (value: bigint) => {
    return (Number(value) / 1e18).toFixed(4);
  };

  const formatGwei = (value: bigint) => {
    return (Number(value) / 1e9).toFixed(2);
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
              <h1 className="text-2xl font-bold text-gray-900">Paymaster</h1>
              <p className="text-gray-600">Gas sponsorship configuration and statistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading paymaster data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    config?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Max Gas Per Day</span>
                  <span className="font-mono">{config?.gasLimits?.maxGasPerDay?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Max Gas Per Month</span>
                  <span className="font-mono">{config?.gasLimits?.maxGasPerMonth?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-mono">{formatEther(config?.balance || 0n)} ETH</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-mono text-lg font-semibold">
                    {formatEther(stats?.balance || 0n)} ETH
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Owner</span>
                  <span className="font-mono text-xs">{stats?.owner?.slice(0, 10)}...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">About Paymaster</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• The Paymaster sponsors gas fees for transactions on Base Sepolia</li>
            <li>• Users can send payments without paying gas fees</li>
            <li>• Transactions are processed instantly with sponsored gas</li>
            <li>• All sponsored transactions are tracked and recorded</li>
            <li>• The Paymaster has limits to prevent abuse</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
