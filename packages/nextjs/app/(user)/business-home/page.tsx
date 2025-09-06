"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useUser } from '@clerk/nextjs';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useWalletUser } from "~~/hooks/useWalletUser";

const BuyerHome = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress } = useWalletUser();

  // Get vendor's USDC balance from the smart contract using wallet address
  const { data: usdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress || "0x0"],
  });

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

  const recentTransactions = [
    {
      name: "Kwame A.",
      initial: "K",
      color: "bg-green-500",
      amount: "₵25.00",
      usd: "$1.53 USDC",
      time: "2 mins ago",
    },
    {
      name: "Akosua M.",
      initial: "A",
      color: "bg-blue-500",
      amount: "₵45.00",
      usd: "$2.76 USDC",
      time: "15 mins ago",
    },
    {
      name: "Yaw K.",
      initial: "Y",
      color: "bg-purple-500",
      amount: "₵30.00",
      usd: "$1.84 USDC",
      time: "1 hour ago",
    },
  ];

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Good morning, Ama</h1>
              <p className="text-gray-500 text-sm">ama-waakye.tapngo.eth</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Balance and Sales Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-sm font-medium mb-2">Total Balance</h2>
                <div className="text-3xl font-bold mb-1">₵4,850.00</div>
                <p className="text-blue-100 text-sm">$297.50 USDC</p>
              </div>
              <div className="text-right">
                <h2 className="text-sm font-medium mb-2">Today's Sales</h2>
                <div className="text-3xl font-bold mb-1">₵320.00</div>
                <p className="text-blue-100 text-sm">+12% from yesterday</p>
              </div>
            </div>
            <div className="flex space-x-3 justify-between">
              <button className="backdrop-blur-2xl  bg-white/30  font-medium py-3 px-5 rounded-xl text-sm hover:bg-opacity-30">
                Withdraw
              </button>
              <button 
                onClick={() => router.push("/menu-management")}
                className="backdrop-blur-2xl  bg-white/30  font-medium py-3 px-5 rounded-xl text-sm hover:bg-opacity-30 transition-colors"
              >
                Menu Editor
              </button>
            </div>
          </div>

          {/* Accept Payment Button */}
          <button
            onClick={() => router.push("/accept-payment")}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-lg shadow-sm hover:bg-green-700 transition-colors"
          >
            Accept Payment
          </button>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${transaction.color} rounded-full flex items-center justify-center`}>
                      <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-gray-500 text-sm">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{transaction.amount}</p>
                    <p className="text-gray-500 text-sm">{transaction.usd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">₵320</div>
                  <div className="text-sm text-gray-600">Today's Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
                  <div className="text-sm text-gray-600">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">₵4,850</div>
                  <div className="text-sm text-gray-600">Total Balance</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => router.push("/payment")}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Make Payment
                </button>
                <button
                  onClick={() => router.push("/send-money")}
                  className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Send Money
                </button>
                <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Payment received from Kwame</p>
                  <p className="text-gray-500">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Balance updated</p>
                  <p className="text-gray-500">5 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">New transaction processed</p>
                  <p className="text-gray-500">15 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Good morning, Ama</h1>
              <p className="text-gray-500 text-lg">ama-waakye.tapngo.eth</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Balance and Actions */}
              <div className="lg:col-span-2 space-y-8">
                {/* Balance and Sales Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="text-lg font-medium mb-4">Total Balance</h2>
                      <div className="text-5xl font-bold mb-2">
                        ₵{usdcBalance ? (Number(usdcBalance) / 1e6 * 16.3).toFixed(2) : '0.00'}
                      </div>
                      <p className="text-blue-100 text-lg">
                        {usdcBalance ? (Number(usdcBalance) / 1e6).toFixed(2) : '0.00'} USDC
                      </p>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium mb-4">Today's Sales</h2>
                      <div className="text-5xl font-bold mb-2">₵320.00</div>
                      <p className="text-blue-100 text-lg">+12% from yesterday</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => router.push("/vendor-dashboard")}
                      className="bg-white bg-opacity-20 text-white font-medium py-3 px-6 rounded-xl hover:bg-opacity-30 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => router.push("/menu-management")}
                      className="bg-white bg-opacity-20 text-white font-medium py-3 px-6 rounded-xl hover:bg-opacity-30 transition-colors"
                    >
                      Menu Editor
                    </button>
                  </div>
                </div>

                {/* Accept Payment Button */}
                <button
                  onClick={() => router.push("/accept-payment")}
                  className="w-full bg-green-600 text-white font-semibold py-6 rounded-3xl text-2xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Accept Payment
                </button>

                {/* Recent Transactions */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Recent Transactions</h3>
                    <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 ${transaction.color} rounded-full flex items-center justify-center`}
                          >
                            <CheckIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{transaction.name}</p>
                            <p className="text-gray-500">{transaction.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-lg">{transaction.amount}</p>
                          <p className="text-gray-500">{transaction.usd}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Quick Stats and Actions */}
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">₵320</div>
                      <div className="text-sm text-gray-600">Today's Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">12</div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">₵4,850</div>
                      <div className="text-sm text-gray-600">Total Balance</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push("/payment")}
                      className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Make Payment
                    </button>
                    <button
                      onClick={() => router.push("/send-money")}
                      className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Send Money
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                      View Reports
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">Payment received from Kwame</p>
                      <p className="text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">Balance updated</p>
                      <p className="text-gray-500">5 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">New transaction processed</p>
                      <p className="text-gray-500">15 minutes ago</p>
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

export default BuyerHome;
