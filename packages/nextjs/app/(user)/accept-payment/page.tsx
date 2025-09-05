"use client";

import React from "react";
import BackArrow from "~~/components/BackArrow";

const AcceptPayment = () => {
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
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded grid grid-cols-2 gap-1">
                    <div className="bg-gray-400 rounded-sm"></div>
                    <div className="bg-gray-500 rounded-sm"></div>
                    <div className="bg-gray-500 rounded-sm"></div>
                    <div className="bg-gray-400 rounded-sm"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Backup</h3>
                <p className="text-gray-600">If NFC doesn't work</p>
              </div>

              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
                Generate QR Code
              </button>
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
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded grid grid-cols-2 gap-1">
                        <div className="bg-gray-400 rounded-sm"></div>
                        <div className="bg-gray-500 rounded-sm"></div>
                        <div className="bg-gray-500 rounded-sm"></div>
                        <div className="bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Code Backup</h3>
                    <p className="text-gray-600">If NFC doesn't work</p>
                  </div>

                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors">
                    Generate QR Code
                  </button>
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
