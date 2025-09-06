"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';
import { useNFC } from '~~/hooks/useNFC';
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useWalletUser } from '~~/hooks/useWalletUser';
import QRGenerator from '~~/components/QRGenerator';
import { qrService, QRService } from '~~/services/qrService';
import { paymentService } from '~~/services/paymentService';

const AcceptPayment = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const [amount, setAmount] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get vendor earnings
  const { data: vendorEarnings } = useScaffoldReadContract({
    contractName: "PaymentRouter",
    functionName: "getVendorEarnings",
    args: [walletAddress],
  });

  // NFC functionality
  const { 
    isSupported: nfcSupported, 
    isReading, 
    startReading, 
    stopReading, 
    writeMessage,
    createPaymentRequest,
    error: nfcError 
  } = useNFC({
    onPaymentRequest: (message) => {
      console.log('Received payment request:', message);
      // Handle incoming payment request
    }
  });

  // Smart contract integration
  const { writeContractAsync: writePaymentRouterAsync } = useScaffoldWriteContract({
    contractName: "PaymentRouter"
  });

  const handleStartNFC = async () => {
    if (nfcSupported) {
      await startReading();
    }
  };

  const handleStopNFC = () => {
    stopReading();
  };

  const handleAcceptPayment = async () => {
    if (!amount || !user) return;
    
    setIsAccepting(true);
    try {
      // Create payment request message
      const paymentRequest = createPaymentRequest(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        parseFloat(amount)
      );
      
      // Write NFC message
      await writeMessage(paymentRequest);
      
      // Process payment via smart contract
      // await writePaymentRouterAsync({
      //   functionName: "processPayment",
      //   args: [/* payment details */]
      // });
      
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleGenerateQR = () => {
    if (!amount || !walletAddress) {
      setError('Please enter an amount and ensure wallet is connected');
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    const validation = paymentService.validatePaymentAmount(amountNum);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    const paymentData = QRService.generatePaymentRequestQR({
      amount: amountNum,
      currency: 'bUSDC',
      vendor_ens: 'vendor.tapngo.eth', // This should come from vendor profile
      vendor_address: walletAddress || '0x0'
    });

    setPaymentData(paymentData);
    setShowQR(true);
    setError(null);
  };

  const handleQRExpire = () => {
    setShowQR(false);
    setPaymentData(null);
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
          <p className="text-gray-600 mb-6">Please connect your wallet to accept payments</p>
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

          <h1 className="text-lg font-semibold text-gray-900">Accept Payment</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Amount Input */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Enter Amount</h3>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">₵</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                min="0"
                step="0.01"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* NFC Payment Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">H</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready for NFC Payment</h2>
            <p className="text-gray-600 text-sm mb-6">Ask customer to tap their phone</p>

            <button className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-sm hover:bg-blue-700 transition-colors mb-4">
              Show NFC
            </button>

            <p className="text-gray-400 text-sm">or</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waiting for payment...</span>
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-sm text-gray-500">Make sure NFC is enabled on both devices</div>
            </div>
          </div>
          {/*  QR Code and Settings */}
          <div className="space-y-6">
            {/* QR Code Backup */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              {showQR && paymentData ? (
                <QRGenerator
                  type="payment"
                  data={paymentData}
                  size={200}
                  onExpire={handleQRExpire}
                />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded grid grid-cols-2 gap-1">
                      <div className="bg-gray-400 rounded-sm"></div>
                      <div className="bg-gray-500 rounded-sm"></div>
                      <div className="bg-gray-500 rounded-sm"></div>
                      <div className="bg-gray-400 rounded-sm"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Backup</h3>
                  <p className="text-gray-600 mb-6">If NFC doesn't work</p>

                  <button 
                    onClick={handleGenerateQR}
                    disabled={!amount || !isWalletLinked}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Auto-accept payments</span>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sound notifications</span>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Vibration</span>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Earnings */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Total Earnings</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {paymentService.formatAmount(
                    vendorEarnings ? Number(vendorEarnings) / 1e6 : 0,
                    'USDC'
                  )}
                </div>
                <p className="text-gray-500 text-sm">Lifetime earnings from payments</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Payments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">K</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Kwame A.</p>
                      <p className="text-sm text-gray-500">2 mins ago</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">₵25.00</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Akosua M.</p>
                      <p className="text-sm text-gray-500">15 mins ago</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">₵45.00</span>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <BackArrow />

          <h1 className="text-2xl font-semibold text-gray-900">Accept Payment</h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-4xl w-full">
            {/* Amount Input */}
            <div className="bg-white rounded-3xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-medium text-gray-700 mb-6">Enter Amount</h3>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">₵</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-3xl font-bold text-gray-900 bg-transparent border-none outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-3">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - NFC Payment */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
                  <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-white text-4xl font-bold">H</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready for NFC Payment</h2>
                  <p className="text-gray-600 text-lg mb-8">Ask customer to tap their phone</p>

                  <button className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl text-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] mb-6">
                    Show NFC
                  </button>

                  <p className="text-gray-400 text-lg">or</p>
                </div>

                {/* Payment Status */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Waiting for payment...</span>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-500">Make sure NFC is enabled on both devices</div>
                  </div>
                </div>
              </div>

              {/* Right Side - QR Code and Settings */}
              <div className="space-y-6">
                {/* QR Code Backup */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  {showQR && paymentData ? (
                    <QRGenerator
                      type="payment"
                      data={paymentData}
                      size={200}
                      onExpire={handleQRExpire}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded grid grid-cols-2 gap-1">
                          <div className="bg-gray-400 rounded-sm"></div>
                          <div className="bg-gray-500 rounded-sm"></div>
                          <div className="bg-gray-500 rounded-sm"></div>
                          <div className="bg-gray-400 rounded-sm"></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Backup</h3>
                      <p className="text-gray-600 mb-6">If NFC doesn't work</p>

                      <button 
                        onClick={handleGenerateQR}
                        disabled={!amount || !isWalletLinked}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Settings */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Auto-accept payments</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sound notifications</span>
                      <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Vibration</span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Earnings */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Total Earnings</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-3">
                      {paymentService.formatAmount(
                        vendorEarnings ? Number(vendorEarnings) / 1e6 : 0,
                        'USDC'
                      )}
                    </div>
                    <p className="text-gray-500">Lifetime earnings from payments</p>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Payments</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-bold">K</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Kwame A.</p>
                          <p className="text-sm text-gray-500">2 mins ago</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">₵25.00</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-bold">A</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Akosua M.</p>
                          <p className="text-sm text-gray-500">15 mins ago</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">₵45.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AcceptPayment;
