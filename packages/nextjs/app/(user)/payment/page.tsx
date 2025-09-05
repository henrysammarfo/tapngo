"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const Payment = () => {
  const router = useRouter();

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeftIcon width={24} height={24} className="text-gray-600" />
          </button>
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
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ama's Waakye Spot</h2>
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

          <div className="space-y-6">
            {/* USDC Balance Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">USDC Balance</p>
                    <p className="text-gray-500">₵150.00 available</p>
                  </div>
                </div>
                <ChevronRightIcon width={24} height={24} className="text-gray-400" />
              </div>

              {/* Balance Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Used</span>
                  <span>₵125.00 / ₵150.00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "83%" }}></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors">
                  Add Funds
                </button>
                <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors">
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
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeftIcon width={24} height={24} className="text-gray-600" />
          </button>
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ama's Waakye Spot</h2>
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
                        <p className="text-lg font-medium text-gray-700">USDC Balance</p>
                        <p className="text-gray-500">₵150.00 available</p>
                      </div>
                    </div>
                    <ChevronRightIcon width={24} height={24} className="text-gray-400" />
                  </div>

                  {/* Balance Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Used</span>
                      <span>₵125.00 / ₵150.00</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "83%" }}></div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors">
                      Add Funds
                    </button>
                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl text-sm font-medium transition-colors">
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
    </>
  );
};

export default Payment;
