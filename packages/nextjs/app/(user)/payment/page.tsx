"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, QrCodeIcon } from "@heroicons/react/20/solid";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useWalletUser } from '~~/hooks/useWalletUser';
import QRScanner from '~~/components/QRScanner';
import { qrService, PaymentQRData, VendorQRData } from '~~/services/qrService';
import { paymentService } from '~~/services/paymentService';

const Payment = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<PaymentQRData | VendorQRData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get user's bUSDC balance
  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const handleQRScan = (data: PaymentQRData | VendorQRData) => {
    setScannedData(data);
    setShowScanner(false);
    setError(null);
    
    if (data.type === 'payment_request') {
      // Validate QR data freshness
      if (!qrService.isQRDataFresh(data)) {
        setError('QR code has expired. Please ask the vendor for a new one.');
        return;
      }
      
      // Navigate to payment confirmation
      router.push(`/payment-confirmation?data=${encodeURIComponent(JSON.stringify(data))}`);
    } else if (data.type === 'vendor_info') {
      // Navigate to vendor profile or payment form
      router.push(`/vendor/${data.vendor_ens}`);
    }
  };

  const handleQRError = (error: string) => {
    setError(error);
    setShowScanner(false);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setError(null);
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
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to make payments</p>
          <button
            onClick={() => router.push('/user-dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <BackArrow />

          <h1 className="text-lg font-semibold text-gray-900">Payment</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Recipient Information Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ama&apos;s Waakye Spot</h2>
              <p className="text-gray-500 text-sm">ama-waakye.tapngo.eth</p>
            </div>
          </div>

          {/* Amount to Pay Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Amount to pay</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">₵25.00</div>
              <p className="text-gray-500 text-sm">≈ $1.53 USDC</p>
            </div>
          </div>

          {/* QR Scanner Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h3>
              <p className="text-gray-600 text-sm mb-4">Scan a vendor's QR code to make a payment</p>
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Scan QR Code
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* USDC Balance Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">bUSDC Balance</p>
                    <p className="text-gray-500">
                      {paymentService.formatAmount(
                        busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                        'USDC'
                      )} available
                    </p>
                  </div>
                </div>
                <ChevronRightIcon width={24} height={24} className="text-gray-400" />
              </div>

              {/* Balance Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Available</span>
                  <span>
                    {paymentService.formatAmount(
                      busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                      'USDC'
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => router.push('/faucet')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  Add Funds
                </button>
                <button 
                  onClick={() => router.push('/user-dashboard')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  View History
                </button>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-6">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">₵25.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₵25.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-sm hover:bg-green-700 transition-colors">
            Pay ₵25.00
          </button>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400">Secured by Base blockchain • Gas fees covered</p>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <BackArrow />

          <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-2xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Payment Form */}
              <div className="space-y-6">
                {/* Recipient Information Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                      <span className="text-white text-2xl font-bold">A</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ama&apos;s Waakye Spot</h2>
                    <p className="text-gray-500">ama-waakye.tapngo.eth</p>
                  </div>
                </div>

                {/* Amount to Pay Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-6">Amount to pay</h3>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-4">₵25.00</div>
                    <p className="text-gray-500 text-lg">≈ $1.53 USDC</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Payment Details */}
              <div className="space-y-6">
                {/* USDC Balance Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">bUSDC Balance</p>
                        <p className="text-gray-500">
                          {paymentService.formatAmount(
                            busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                            'USDC'
                          )} available
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon width={24} height={24} className="text-gray-400" />
                  </div>

                  {/* Balance Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Available</span>
                      <span>
                        {paymentService.formatAmount(
                          busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                          'USDC'
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => router.push('/faucet')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                    >
                      Add Funds
                    </button>
                    <button 
                      onClick={() => router.push('/user-dashboard')}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
                    >
                      View History
                    </button>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-6">Payment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">₵25.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Fee</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>₵25.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <button className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]">
                  Pay ₵25.00
                </button>

                {/* Footer Text */}
                <p className="text-center text-sm text-gray-400">Secured by Base blockchain • Gas fees covered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onError={handleQRError}
          onClose={handleCloseScanner}
          title="Scan Payment QR Code"
          description="Point your camera at a vendor's QR code to make a payment"
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 z-50">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Payment;
