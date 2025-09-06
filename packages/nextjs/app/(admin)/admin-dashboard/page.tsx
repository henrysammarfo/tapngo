"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CheckIcon, Cog6ToothIcon, ExclamationTriangleIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { AdminActivity, PaymasterInfo, SystemStats, VendorProfile, adminService } from "~~/services/adminService";

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [recentVendors, setRecentVendors] = useState<VendorProfile[]>([]);
  const [paymasterInfo, setPaymasterInfo] = useState<PaymasterInfo | null>(null);
  const [recentActivity, setRecentActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: Paymaster balance is fetched via adminService.getPaymasterInfo()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      setError(null);

      try {
        // Load all dashboard data in parallel
        const [stats, vendors, paymaster, activity] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getVendors(1, 5), // Get first 5 vendors
          adminService.getPaymasterInfo(),
          adminService.getAdminActivity(1, 5), // Get first 5 activities
        ]);

        setSystemStats(stats);
        setRecentVendors(vendors.vendors);
        setPaymasterInfo(paymaster);
        setRecentActivity(activity.activities);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await adminService.approveVendor(vendorId);
      // Refresh data
      window.location.reload();
    } catch (err: any) {
      console.error("Error approving vendor:", err);
      setError(err.message || "Failed to approve vendor");
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    try {
      await adminService.suspendVendor(vendorId, "Suspended by admin");
      // Refresh data
      window.location.reload();
    } catch (err: any) {
      console.error("Error suspending vendor:", err);
      setError(err.message || "Failed to suspend vendor");
    }
  };

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
              <div className="text-3xl font-bold text-gray-900 mb-1">{systemStats?.activeVendors || 0}</div>
              <p className="text-gray-500 text-sm">{systemStats?.pendingVendors || 0} pending</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Volume</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {adminService.formatCurrency(systemStats?.totalVolumeGHS || 0, "GHS")}
              </div>
              <p className="text-gray-500 text-sm">{systemStats?.totalTransactions || 0} transactions</p>
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
            <div className="text-3xl font-bold text-gray-900">
              {adminService.formatCurrency(paymasterInfo?.balance || 0, "USDC")}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Available: {adminService.formatCurrency(paymasterInfo?.availableBalance || 0, "USDC")}
            </div>
          </div>
          {/* Recent Vendors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Vendors</h3>
            <div className="space-y-4">
              {recentVendors.length > 0 ? (
                recentVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{vendor.businessName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vendor.businessName}</p>
                        <p className="text-gray-500 text-sm">
                          {vendor.ensName} • {adminService.formatDate(vendor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${adminService.getVendorStatusColor(vendor.status)}`}
                      >
                        {vendor.status}
                      </span>
                      {vendor.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <CheckIcon width={16} height={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleSuspendVendor(vendor.id)}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <XMarkIcon width={16} height={16} className="text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No vendors found</p>
              )}
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
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <div key={activity.id} className="text-sm">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-gray-500">
                        {adminService.formatDate(activity.createdAt)} • {activity.admin.firstName}{" "}
                        {activity.admin.lastName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
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
                    <div className="text-5xl font-bold text-gray-900 mb-2">{systemStats?.activeVendors || 0}</div>
                    <p className="text-gray-500 text-lg">{systemStats?.pendingVendors || 0} pending approval</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: systemStats?.totalVendors
                            ? `${(systemStats.activeVendors / systemStats.totalVendors) * 100}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Volume</h3>
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {adminService.formatCurrency(systemStats?.totalVolumeGHS || 0, "GHS")}
                    </div>
                    <p className="text-gray-500 text-lg">{systemStats?.totalTransactions || 0} transactions</p>
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: systemStats?.totalVolumeGHS
                            ? `${Math.min((systemStats.totalVolumeGHS / 1000000) * 100, 100)}%`
                            : "0%",
                        }}
                      ></div>
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
                  <div className="text-4xl font-bold text-gray-900 mb-4">
                    {adminService.formatCurrency(paymasterInfo?.balance || 0, "USDC")}
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-gray-600">
                      <span className="block">Available for gas</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {adminService.formatCurrency(paymasterInfo?.availableBalance || 0, "USDC")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="block">Reserved</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {adminService.formatCurrency(paymasterInfo?.reservedBalance || 0, "USDC")}
                      </span>
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
                    {recentVendors.length > 0 ? (
                      recentVendors.map(vendor => (
                        <div
                          key={vendor.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-bold">
                                {vendor.businessName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{vendor.businessName}</p>
                              <p className="text-gray-500">
                                {vendor.ensName} • {adminService.formatDate(vendor.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${adminService.getVendorStatusColor(vendor.status)}`}
                            >
                              {vendor.status}
                            </span>
                            {vendor.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveVendor(vendor.id)}
                                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                  <CheckIcon width={20} height={20} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() => handleSuspendVendor(vendor.id)}
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <XMarkIcon width={20} height={20} className="text-red-600" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No vendors found</p>
                    )}
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
                    {recentActivity.length > 0 ? (
                      recentActivity.map(activity => (
                        <div key={activity.id} className="text-sm">
                          <p className="text-gray-900">{activity.description}</p>
                          <p className="text-gray-500">
                            {adminService.formatDate(activity.createdAt)} • {activity.admin.firstName}{" "}
                            {activity.admin.lastName}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
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
