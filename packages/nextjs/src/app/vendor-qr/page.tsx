'use client';

import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/wagmi';
import QRGenerator from '@/components/QRGenerator';

export default function VendorQRPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');
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
        "inputs": [{"name": "vendor", "type": "address"}],
        "name": "getVendorInfo",
        "outputs": [
          {"name": "businessName", "type": "string"},
          {"name": "phoneNumber", "type": "string"},
          {"name": "email", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "isActive", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getVendorInfo',
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

  // Generate QR code data
  const qrData = {
    type: 'vendor_payment',
    vendor: address,
    vendorName: vendorInfo?.[0] || 'Vendor',
    ensSubname: `${vendorInfo?.[0]?.toLowerCase().replace(/\s+/g, '') || 'vendor'}.tapngo.eth`,
    amount: parseFloat(amount) || 0,
    message: message || '',
    timestamp: Date.now()
  };

  const qrString = JSON.stringify(qrData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => router.push('/vendor-dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Vendor Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Payment QR Code</h1>
              <p className="text-gray-600">Generate QR codes for customer payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment QR Code</h2>
            <QRGenerator data={qrString} size={300} />
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (bUSDC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    ≈ ₵{(parseFloat(amount) * 15.5).toFixed(2)} GHS
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Payment description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Vendor Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Vendor Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Business:</strong> {vendorInfo?.[0] || 'Loading...'}</p>
                <p><strong>ENS Subname:</strong> {vendorInfo?.[0]?.toLowerCase().replace(/\s+/g, '') || 'vendor'}.tapngo.eth</p>
                <p><strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Loading...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Set the payment amount and optional message</li>
            <li>• Display the QR code to customers</li>
            <li>• Customers scan the QR code with their wallet</li>
            <li>• Payments are sent directly to your wallet</li>
            <li>• All transactions are recorded on Base Sepolia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
