"use client";

import { useState } from "react";
import CustomLayout from "~~/components/CustomLayout";
import PersistentDownArrow from "~~/components/PersistentDownArrow";

export default function DemoPage() {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "show" | "hidden">("idle");

  const simulatePayment = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setTimeout(() => setPaymentStatus("idle"), 3000);
    }, 2000);
  };

  const showTransactions = () => {
    setTransactionStatus("show");
    setTimeout(() => setTransactionStatus("hidden"), 5000);
  };

  return (
    <CustomLayout>
      {/* Demo Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-900 py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white">Live Demo</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
            Experience the future of payments with our interactive demo
          </p>

          {/* Demo Content */}
          <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Buyer Side */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">As a Buyer</h3>
                <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Tap your phone on an NFC tag</p>
                </div>

                <button
                  onClick={simulatePayment}
                  disabled={paymentStatus === "processing"}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  {paymentStatus === "processing" ? "Processing..." : "Simulate Payment"}
                </button>

                {/* Payment Status Indicator */}
                {paymentStatus === "success" && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 font-semibold">
                      ✅ Payment Successful! $5.00 sent to Coffee Shop
                    </p>
                  </div>
                )}
              </div>

              {/* Vendor Side */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">As a Vendor</h3>
                <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Receive instant payments</p>
                </div>

                <button
                  onClick={showTransactions}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  View Transactions
                </button>

                {/* Transactions Display */}
                {transactionStatus === "show" && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Recent Transactions</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p>✅ $5.00 - Coffee Sale - 2 min ago</p>
                      <p>✅ $3.50 - Pastry - 5 min ago</p>
                      <p>✅ $8.00 - Lunch - 12 min ago</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Demo Stats */}
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Live Demo Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">← 2.3s</div>
                <p className="text-gray-700 dark:text-gray-300">Current Payment Time</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">$0.15</div>
                <p className="text-gray-700 dark:text-gray-300">Total Fees Saved</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">3</div>
                <p className="text-gray-700 dark:text-gray-300">Successful Demos</p>
              </div>
            </div>
          </div>

          {/* How to Use Demo */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">How to Use This Demo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Buyers:</h4>
                <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Click &quot;Simulate Payment&quot; to experience the payment flow</li>
                  <li>• Watch the real-time transaction confirmation</li>
                  <li>• See instant payment processing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">For Vendors:</h4>
                <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Click &quot;View Transactions&quot; to see payment history</li>
                  <li>• Monitor real-time sales data</li>
                  <li>• Track transaction fees saved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PersistentDownArrow />
    </CustomLayout>
  );
}
