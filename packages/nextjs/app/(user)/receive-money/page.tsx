"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useApiContext } from '~~/contexts/ApiContext';
import { useNFC } from '~~/hooks/useNFC';
import { qrService } from '~~/services/qrService';
import { p2pService } from '~~/services/p2pService';
import QRGenerator from '~~/components/QRGenerator';
import BackArrow from '~~/components/BackArrow';
import { 
  QrCodeIcon,
  ShareIcon,
  ClipboardDocumentIcon as CopyIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid';

const ReceiveMoney = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { userProfile } = useApiContext();
  
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [qrData, setQrData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // NFC functionality
  const { 
    isSupported: nfcSupported, 
    isReading, 
    startReading, 
    stopReading,
    writeMessage,
    error: nfcError 
  } = useNFC({
    onPaymentRequest: (data) => {
      // Handle incoming payment requests via NFC
      console.log('Received payment request via NFC:', data);
    }
  });

  useEffect(() => {
    if (walletAddress && userProfile) {
      generateQRCode();
    }
  }, [walletAddress, userProfile, amount, message]);

  const generateQRCode = () => {
    if (!walletAddress) return;

    const paymentData = {
      type: 'payment_request',
      recipientAddress: walletAddress,
      recipientName: userProfile?.firstName || user?.firstName || 'User',
      amountGHS: amount ? parseFloat(amount) : undefined,
      message: message || undefined,
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    const qrString = qrService.generatePaymentQR(paymentData);
    setQrData(qrString);
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
      setAmount(sanitized);
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const sharePaymentRequest = async () => {
    if (navigator.share && qrData) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Send me ${amount ? `₵${amount}` : 'money'} via Tap&Go Pay`,
          url: qrData
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const handleNFCWrite = async () => {
    if (!qrData) return;

    try {
      await writeMessage(qrData);
    } catch (error) {
      console.error('NFC write error:', error);
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please connect your wallet to receive payments.</p>
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
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Receive Money</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Payment Request Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Payment Request</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (GHS) - Optional
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount (optional)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to let sender choose amount
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message for the sender"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        {qrData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment QR Code</h3>
              
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                  <QRGenerator data={qrData} size={200} />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {amount ? `Requesting ₵${amount}` : 'Any amount'} from {userProfile?.firstName || user?.firstName}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <CopyIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {copied ? 'Copied!' : 'Copy QR'}
                  </span>
                </button>

                <button
                  onClick={sharePaymentRequest}
                  className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ShareIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NFC Section */}
        {nfcSupported && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">NFC Payment</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use NFC to share your payment request by tapping phones together.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={handleNFCWrite}
                  disabled={!qrData}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Write to NFC
                </button>

                <button
                  onClick={isReading ? stopReading : startReading}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    isReading 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isReading ? 'Stop Reading' : 'Start Reading'}
                </button>
              </div>

              {nfcError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">{nfcError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to receive payments:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Show your QR code to the sender</li>
            <li>• They scan it with their Tap&Go Pay app</li>
            <li>• They confirm and send the payment</li>
            <li>• You'll receive a notification when payment is complete</li>
          </ul>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Receipts</h3>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recent receipts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Payments you receive will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveMoney;
