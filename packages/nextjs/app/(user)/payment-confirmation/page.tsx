"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWalletUser } from '~~/hooks/useWalletUser';
import { paymentService, PaymentConfirmation } from '~~/services/paymentService';
import { qrService, PaymentQRData } from '~~/services/qrService';

const PaymentConfirmation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  
  const [paymentData, setPaymentData] = useState<PaymentQRData | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smart contract hooks
  const { writeContractAsync: writePaymentRouterAsync } = useScaffoldWriteContract({
    contractName: "PaymentRouter"
  });

  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const { data: currentFxRate } = useScaffoldReadContract({
    contractName: "PaymentRouter",
    functionName: "currentFxRate",
  });

  const { data: platformFeeBps } = useScaffoldReadContract({
    contractName: "PaymentRouter",
    functionName: "platformFeeBps",
  });

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const dataParam = searchParams.get('data');
        if (!dataParam) {
          setError('Invalid payment data');
          return;
        }

        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setPaymentData(decodedData);

        // Calculate payment confirmation
        const amountUSDC = await paymentService.calculateUSDCAmount(
          decodedData.amount,
          async (params: any) => {
            // Mock read contract function for calculation
            return (decodedData.amount * (currentFxRate || 1e6)) / 1e6;
          }
        );

        const platformFeePercentage = platformFeeBps ? Number(platformFeeBps) / 100 : 0.25;
        const platformFee = (amountUSDC * platformFeePercentage) / 100;
        const vendorAmount = amountUSDC - platformFee;

        setConfirmation({
          orderId: decodedData.order_id,
          amountGHS: decodedData.amount,
          amountUSDC,
          vendorENS: decodedData.vendor_ens,
          vendorAddress: decodedData.vendor_address,
          fxRate: currentFxRate ? Number(currentFxRate) / 1e6 : 1,
          platformFee,
          vendorAmount,
        });
      } catch (err) {
        console.error('Error loading payment data:', err);
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isWalletLinked) {
      loadPaymentData();
    }
  }, [isLoaded, isWalletLinked, searchParams, currentFxRate, platformFeeBps]);

  const handleConfirmPayment = async () => {
    if (!paymentData || !confirmation || !walletAddress) return;

    setProcessing(true);
    setError(null);

    try {
      // Check if user has sufficient balance
      const balance = busdcBalance ? Number(busdcBalance) / 1e6 : 0;
      if (balance < confirmation.amountUSDC) {
        setError('Insufficient bUSDC balance. Please add funds first.');
        return;
      }

      // Initiate Quick Pay transaction
      const orderId = await paymentService.initiateQuickPay(
        confirmation.vendorAddress,
        confirmation.amountGHS,
        writePaymentRouterAsync
      );

      // Complete the payment
      await paymentService.completePayment(orderId, writePaymentRouterAsync);

      // Navigate to receipt page
      router.push(`/receipt?orderId=${orderId}`);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !confirmation) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleCancel}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700"
          >
            Go Back
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
          <h1 className="text-lg font-semibold text-gray-900">Confirm Payment</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Vendor Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">
                  {confirmation?.vendorENS?.charAt(0).toUpperCase() || 'V'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {confirmation?.vendorENS || 'Vendor'}
              </h2>
              <p className="text-gray-500 text-sm">{confirmation?.vendorAddress}</p>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Amount to pay</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}
              </div>
              <p className="text-gray-500 text-sm">
                ≈ {paymentService.formatAmount(confirmation?.amountUSDC || 0, 'USDC')}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount (GHS)</span>
                <span className="font-medium">
                  {paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount (bUSDC)</span>
                <span className="font-medium">
                  {paymentService.formatAmount(confirmation?.amountUSDC || 0, 'USDC')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange Rate</span>
                <span className="font-medium">1 GHS = {confirmation?.fxRate.toFixed(4)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium text-red-600">
                  -{paymentService.formatAmount(confirmation?.platformFee || 0, 'USDC')}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Vendor Receives</span>
                  <span className="text-green-600">
                    {paymentService.formatAmount(confirmation?.vendorAmount || 0, 'USDC')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Your bUSDC Balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentService.formatAmount(
                    busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                    'USDC'
                  )}
                </p>
              </div>
              <div className="text-right">
                {busdcBalance && confirmation && Number(busdcBalance) / 1e6 >= confirmation.amountUSDC ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XMarkIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
            {busdcBalance && confirmation && Number(busdcBalance) / 1e6 < confirmation.amountUSDC && (
              <p className="text-sm text-red-600 mt-2">
                Insufficient balance. Please add funds first.
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={processing || !busdcBalance || Number(busdcBalance) / 1e6 < (confirmation?.amountUSDC || 0)}
              className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Pay ${paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}`}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={processing}
              className="w-full bg-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400">
            Secured by Base blockchain • Gas fees covered
          </p>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <BackArrow />
          <h1 className="text-2xl font-semibold text-gray-900">Confirm Payment</h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-2xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Vendor Info */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                      <span className="text-white text-2xl font-bold">
                        {confirmation?.vendorENS?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {confirmation?.vendorENS || 'Vendor'}
                    </h2>
                    <p className="text-gray-500">{confirmation?.vendorAddress}</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-6">Amount to pay</h3>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-4">
                      {paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}
                    </div>
                    <p className="text-gray-500 text-lg">
                      ≈ {paymentService.formatAmount(confirmation?.amountUSDC || 0, 'USDC')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Payment Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-6">Payment Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount (GHS)</span>
                      <span className="font-medium">
                        {paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount (bUSDC)</span>
                      <span className="font-medium">
                        {paymentService.formatAmount(confirmation?.amountUSDC || 0, 'USDC')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="font-medium">1 GHS = {confirmation?.fxRate.toFixed(4)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-medium text-red-600">
                        -{paymentService.formatAmount(confirmation?.platformFee || 0, 'USDC')}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Vendor Receives</span>
                        <span className="text-green-600">
                          {paymentService.formatAmount(confirmation?.vendorAmount || 0, 'USDC')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-lg font-medium text-gray-700">Your bUSDC Balance</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {paymentService.formatAmount(
                          busdcBalance ? Number(busdcBalance) / 1e6 : 0,
                          'USDC'
                        )}
                      </p>
                    </div>
                    <div>
                      {busdcBalance && confirmation && Number(busdcBalance) / 1e6 >= confirmation.amountUSDC ? (
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      ) : (
                        <XMarkIcon className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                  </div>
                  {busdcBalance && confirmation && Number(busdcBalance) / 1e6 < confirmation.amountUSDC && (
                    <p className="text-sm text-red-600">
                      Insufficient balance. Please add funds first.
                    </p>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing || !busdcBalance || Number(busdcBalance) / 1e6 < (confirmation?.amountUSDC || 0)}
                    className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : `Pay ${paymentService.formatAmount(confirmation?.amountGHS || 0, 'GHS')}`}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    disabled={processing}
                    className="w-full bg-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-center text-sm text-gray-400">
                  Secured by Base blockchain • Gas fees covered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentConfirmation;
