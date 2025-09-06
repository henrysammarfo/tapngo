"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useApiContext } from '~~/contexts/ApiContext';
import { useVendor } from '~~/hooks/useApi';
import { useMenu } from '~~/hooks/useApi';
import { usePricing } from '~~/hooks/usePricing';
import PriceDisplay from '~~/components/PriceDisplay';
import BackArrow from '~~/components/BackArrow';
import { 
  CheckIcon, 
  ExclamationTriangleIcon,
  QrCodeIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/20/solid';

const VendorDashboard = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { vendorProfile, refreshVendorProfile } = useApiContext();
  const { getVendorProfile, updateVendorProfile } = useVendor();
  const { menuItems, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { convertUsdcToGhs, formatGhsPrice } = usePricing();

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'transactions' | 'settings'>('overview');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Get vendor's bUSDC balance
  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  // Smart contract integration for withdrawals
  const { writeContractAsync: writeBusdcAsync } = useScaffoldWriteContract({
    contractName: "bUSDC"
  });

  useEffect(() => {
    if (isLoaded && isWalletLinked) {
      getVendorProfile();
      getMenuItems();
    }
  }, [isLoaded, isWalletLinked, getVendorProfile, getMenuItems]);

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

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Not a Vendor</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to register as a vendor to access this dashboard.</p>
          <button
            onClick={() => router.push('/vendor-registration')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register as Vendor
          </button>
        </div>
      </div>
    );
  }

  const handleWithdraw = async () => {
    if (!busdcBalance || busdcBalance === 0n) {
      alert('No funds to withdraw');
      return;
    }

    try {
      // For now, we'll just show a message - in production, this would integrate with a withdrawal service
      alert('Withdrawal functionality will be implemented with a proper withdrawal service');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed');
    }
  };

  const handleAddMenuItem = async (itemData: any) => {
    try {
      await createMenuItem(itemData);
      setShowAddItem(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleUpdateMenuItem = async (itemId: string, itemData: any) => {
    try {
      await updateMenuItem(itemId, itemData);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(itemId);
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <BackArrow />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Vendor Dashboard</h1>
        <button
          onClick={() => router.push('/profile')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <CogIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Vendor Info */}
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                {vendorProfile.businessName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {vendorProfile.businessName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {vendorProfile.ensName}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Balance</h3>
          {busdcBalance ? (
            <PriceDisplay 
              ghsAmount={convertUsdcToGhs(Number(busdcBalance) / 1e6)}
              showRate={false}
              size="lg"
            />
          ) : (
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₵0.00</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">~ $0.00 USDC</p>
            </div>
          )}
          <button
            onClick={handleWithdraw}
            disabled={!busdcBalance || busdcBalance === 0n}
            className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw Funds
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => router.push('/accept-payment')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <QrCodeIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Accept Payment</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Menu</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'menu', label: 'Menu', icon: PlusIcon },
              { id: 'transactions', label: 'Transactions', icon: BanknotesIcon },
              { id: 'settings', label: 'Settings', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{vendorProfile.totalTransactions}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatGhsPrice(vendorProfile.totalEarnings)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Verification Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone Verified</span>
                      {vendorProfile.isPhoneVerified ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">EFP Verified</span>
                      {vendorProfile.isEfpVerified ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">EFPas Verified</span>
                      {vendorProfile.isEfpasVerified ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Items</h3>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {menuItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No menu items yet</p>
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatGhsPrice(item.priceGHS)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Transaction history will be displayed here</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vendor Settings</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/menu-management')}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Menu Management</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Manage your menu items and categories</div>
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">Profile Settings</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Update your vendor profile information</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Menu Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Menu Item</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddMenuItem({
                name: formData.get('name'),
                description: formData.get('description'),
                priceGHS: parseFloat(formData.get('price') as string),
                category: formData.get('category'),
                isAvailable: true
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (GHS)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="snacks">Snacks</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
