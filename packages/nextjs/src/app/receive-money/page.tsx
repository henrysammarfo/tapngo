'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ReceiveMoneyPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [amount, setAmount] = useState('10');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  // Generate QR code data
  const qrData = {
    type: 'payment_request',
    recipient: address,
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
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Receive Money</h1>
              <p className="text-gray-600">Generate QR code for payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QR Code */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Payment QR Code</h2>
          
          {isConnected ? (
            <div>
              {/* Simple QR Code Placeholder */}
              <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-gray-600">QR Code</p>
                  <p className="text-sm text-gray-500">Amount: {amount} bUSDC</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Share this QR code with others to receive payments
              </p>
              
              <button
                onClick={() => navigator.clipboard.writeText(qrString)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Copy Payment Link
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Please connect your wallet to generate QR code</p>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
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
        </div>

        {/* Your Address */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Wallet Address</h2>
          
          {isConnected ? (
            <div>
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Copy Address
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Please connect your wallet to see your address</p>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to Receive</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Share your QR code or wallet address</li>
            <li>• Others can scan the QR code to send payments</li>
            <li>• Payments will appear in your wallet instantly</li>
            <li>• All transactions are on Base Sepolia testnet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
