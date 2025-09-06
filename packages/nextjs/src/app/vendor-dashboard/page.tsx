'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/wagmi';

export default function VendorDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [vendorInfo, setVendorInfo] = useState<any>(null);

  // Check if registered as vendor
  const { data: isVendor } = useReadContract({
    address: CONTRACTS.VendorRegistry as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "vendor", "type": "address"}],
        "name": "isVendor",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'isVendor',
    args: [address!],
    query: { enabled: !!address }
  });

  // Get vendor info
  const { data: vendorData } = useReadContract({
    address: CONTRACTS.VendorRegistry as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "vendorAddress", "type": "address"}],
        "name": "getVendorProfile",
        "outputs": [
          {
            "components": [
              {"name": "wallet", "type": "address"},
              {"name": "ensName", "type": "string"},
              {"name": "businessName", "type": "string"},
              {"name": "phoneHash", "type": "string"},
              {"name": "phoneVerified", "type": "bool"},
              {"name": "efpVerified", "type": "bool"},
              {"name": "efpasScore", "type": "uint256"},
              {"name": "status", "type": "uint8"},
              {"name": "registrationTime", "type": "uint256"},
              {"name": "lastUpdated", "type": "uint256"}
            ],
            "name": "profile",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getVendorProfile',
    args: [address!],
    query: { enabled: !!address && isVendor }
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (vendorData) {
      setVendorInfo(vendorData);
    }
  }, [vendorData]);

  if (!isConnected) {
    return null;
  }

  if (!isVendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not a Vendor</h2>
          <p className="text-gray-600 mb-6">You need to register as a vendor first.</p>
          <button
            onClick={() => router.push('/vendor-register')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Register as Vendor
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Manage your business payments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Wallet</p>
                <p className="font-mono text-sm">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Info */}
        {vendorInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Business Name</p>
                <p className="font-semibold">{vendorInfo.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">ENS Name</p>
                <p className="font-semibold font-mono">{vendorInfo.ensName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Verified</p>
                <p className={`font-semibold ${vendorInfo.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {vendorInfo.phoneVerified ? '✅ Verified' : '❌ Not Verified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${
                  vendorInfo.status === 1 ? 'text-green-600' : 
                  vendorInfo.status === 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {vendorInfo.status === 1 ? 'Active' : 
                   vendorInfo.status === 0 ? 'Pending' : 'Suspended'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ENS Subname */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your ENS Subname</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-mono text-lg">
              {vendorInfo?.ensName || 'yourbusiness.tapngo.eth'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Customers can send payments to this ENS name
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => router.push('/vendor-qr')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold">Generate QR</h3>
            <p className="text-sm opacity-90">Create payment QR code</p>
          </button>

          <button
            onClick={() => router.push('/vendor-nfc')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="text-2xl mb-2">📲</div>
            <h3 className="font-semibold">NFC Setup</h3>
            <p className="text-sm opacity-90">Configure NFC payments</p>
          </button>

          <button
            onClick={() => router.push('/vendor-analytics')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm opacity-90">View payment stats</p>
          </button>

          <button
            onClick={() => router.push('/vendor-settings')}
            className="bg-gray-600 text-white p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm opacity-90">Manage business info</p>
          </button>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No payments received yet</p>
            <p className="text-sm">Payment history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
