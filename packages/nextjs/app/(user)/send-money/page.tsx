"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";

const SendMoney = () => {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState("₵50");
  const [transferComplete, setTransferComplete] = useState(false);

  const quickAmounts = ["₵10", "₵25", "₵50"];

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeftIcon width={24} height={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Send Money</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Enter Amount Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Enter Amount</h3>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">{selectedAmount}.00</div>
              <p className="text-gray-500 text-sm">≈ $3.07 USDC</p>
            </div>
            <div className="flex space-x-3">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    selectedAmount === amount ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Ready to Send Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">↑</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Send</h2>
            <p className="text-gray-600 text-sm mb-6">Hold phones together to transfer</p>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold text-sm">You</span>
                </div>
                <p className="text-xs text-gray-600">Sender</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold text-sm">K</span>
                </div>
                <p className="text-xs text-gray-600">Kwame</p>
              </div>
            </div>
          </div>

          {/* Transfer Complete Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transfer Complete</h3>
                <p className="text-gray-600 text-sm">Kwame received {selectedAmount}.00</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full text-lg font-medium text-white shadow-lg border px-3 py-4  bg-linear-99 bg-gradient-to-r from-blue-800 to-blue-500  rounded-2xl"
          >
            Send Another
          </button>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeftIcon width={24} height={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Send Money</h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Amount Selection */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Enter Amount</h3>
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-gray-900 mb-4">{selectedAmount}.00</div>
                    <p className="text-gray-500 text-xl">≈ $3.07 USDC</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {quickAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-4 px-6 rounded-2xl text-lg font-medium transition-colors ${
                          selectedAmount === amount
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Status */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Transfer Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold">{selectedAmount}.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Recipient</span>
                      <span className="font-semibold">Kwame</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="text-green-600 font-semibold">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Transfer Interface */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-white text-4xl font-bold">↑</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Send</h2>
                  <p className="text-gray-600 text-lg mb-8">Hold phones together to transfer</p>

                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 font-bold text-lg">You</span>
                      </div>
                      <p className="text-gray-600">Sender</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-600 font-bold text-lg">K</span>
                      </div>
                      <p className="text-gray-600">Kwame</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Complete */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Transfer Complete</h3>
                      <p className="text-gray-600 text-lg">Kwame received {selectedAmount}.00</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full text-lg font-medium text-white shadow-lg border px-3 py-4  bg-linear-99 bg-gradient-to-r from-blue-800 to-blue-500  rounded-2xl"
                >
                  Send Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SendMoney;
