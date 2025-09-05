"use client";

import React from "react";
import { CheckIcon, Cog6ToothIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/20/solid";

const AdminDashboard = () => {
  const recentVendors = [
    {
      name: "Ama's Waakye",
      initial: "A",
      color: "bg-green-500",
      amount: "₵2,450",
      time: "today",
    },
    {
      name: "Kofi's Kenkey",
      initial: "K",
      color: "bg-blue-500",
      amount: "₵1,890",
      time: "today",
    },
    {
      name: "Yaa's Banku",
      initial: "Y",
      color: "bg-purple-500",
      amount: "₵3,120",
      time: "today",
    },
  ];

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Cog6ToothIcon width={20} height={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FunnelIcon width={20} height={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Active Vendors</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,247</div>
              <p className="text-green-600 text-sm">+12% this week</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Volume</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">₵2.4M</div>
              <p className="text-green-600 text-sm">+8% this week</p>
            </div>
          </div>
          {/* Paymaster Balance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Paymaster Balance</h3>
              <button className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Top Up
              </button>
            </div>
            <div className="text-3xl font-bold text-gray-900">$45,230 USDC</div>
          </div>
          {/* Recent Vendors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Vendors</h3>
            <div className="space-y-4">
              {recentVendors.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${vendor.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold">{vendor.initial}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.name}</p>
                      <p className="text-gray-500 text-sm">
                        {vendor.amount} {vendor.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-green-100 rounded-lg transition-colors">
                      <CheckIcon width={16} height={16} className="text-green-600" />
                    </button>
                    <button className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                      <XMarkIcon width={16} height={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors">
                  Add New Vendor
                </button>
                <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  View Reports
                </button>
                <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  Manage Settings
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blockchain</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Synced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900">New vendor registered</p>
                  <p className="text-gray-500">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">Payment processed</p>
                  <p className="text-gray-500">5 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">System backup completed</p>
                  <p className="text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
              <Cog6ToothIcon width={24} height={24} className="text-gray-600" />
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
              <FunnelIcon width={24} height={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Metrics and Balance */}
              <div className="lg:col-span-2 space-y-8">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Vendors</h3>
                    <div className="text-5xl font-bold text-gray-900 mb-2">1,247</div>
                    <p className="text-green-600 text-lg font-medium">+12% this week</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Volume</h3>
                    <div className="text-5xl font-bold text-gray-900 mb-2">₵2.4M</div>
                    <p className="text-green-600 text-lg font-medium">+8% this week</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Paymaster Balance */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Paymaster Balance</h3>
                    <button className="bg-blue-600 text-white font-medium py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
                      Top Up
                    </button>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-4">$45,230 USDC</div>
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-gray-600">
                      <span className="block">Available for gas</span>
                      <span className="text-lg font-semibold text-gray-900">$42,180</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="block">Reserved</span>
                      <span className="text-lg font-semibold text-gray-900">$3,050</span>
                    </div>
                  </div>
                </div>

                {/* Recent Vendors */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Recent Vendors</h3>
                    <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentVendors.map((vendor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${vendor.color} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-lg font-bold">{vendor.initial}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{vendor.name}</p>
                            <p className="text-gray-500">
                              {vendor.amount} {vendor.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                            <CheckIcon width={20} height={20} className="text-green-600" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                            <XMarkIcon width={20} height={20} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Quick Actions and Stats */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors">
                      Add New Vendor
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                      View Reports
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors">
                      Manage Settings
                    </button>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Blockchain</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">Synced</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-900">New vendor registered</p>
                      <p className="text-gray-500">2 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Payment processed</p>
                      <p className="text-gray-500">5 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">System backup completed</p>
                      <p className="text-gray-500">1 hour ago</p>
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

export default AdminDashboard;
