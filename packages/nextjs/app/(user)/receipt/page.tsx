"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useUser } from '@clerk/nextjs';

const Receipt = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

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

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100 p-4">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Success Icon and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm">Your payment has been processed</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 text-sm">To</span>
              <span className="text-gray-900 font-medium">Ama&apos;s Waakye Spot</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Amount</span>
              <div className="text-right">
                <div className="text-gray-900 font-bold text-lg">₵25.00</div>
                <div className="text-gray-500 text-sm">$1.53 USDC</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Transaction ID</span>
              <span className="text-gray-900 font-mono text-sm">0x7a8b...9c2d</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 text-sm">Time</span>
              <span className="text-gray-900 font-medium">2:34 PM</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors">
              View on BaseScan
            </button>
            <button className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Share Receipt
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl text-base hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        <div className="flex items-center justify-center min-h-screen px-8 py-12">
          <div className="max-w-2xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Receipt Details */}
              <div className="space-y-6">
                {/* Success Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckIcon className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
                  <p className="text-gray-600 text-lg">Your payment has been processed</p>
                </div>

                {/* Payment Details Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Transaction Details</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-gray-600">To</span>
                      <span className="text-gray-900 font-medium">Ama&apos;s Waakye Spot</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-gray-600">Amount</span>
                      <div className="text-right">
                        <div className="text-gray-900 font-bold text-xl">₵25.00</div>
                        <div className="text-gray-500">$1.53 USDC</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-gray-900 font-mono">0x7a8b...9c2d</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <span className="text-gray-600">Time</span>
                      <span className="text-gray-900 font-medium">2:34 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions and Summary */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Actions</h3>
                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 text-white font-medium py-4 rounded-xl hover:bg-blue-700 transition-colors">
                      View on BaseScan
                    </button>
                    <button className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-4 rounded-xl hover:bg-gray-50 transition-colors">
                      Share Receipt
                    </button>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-medium">₵25.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network Fee</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium text-green-600">Confirmed</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>₵25.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Done Button */}
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl text-lg shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
