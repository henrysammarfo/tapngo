"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';
import { useVendorDiscovery } from '~~/hooks/useApi';
import { usePricing } from '~~/hooks/usePricing';
import { PriceDisplay } from '~~/components/PriceDisplay';
import BackArrow from '~~/components/BackArrow';
import { 
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/20/solid';

interface VendorProfile {
  id: string;
  ensName: string;
  businessName: string;
  businessType: string;
  description?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  isEfpVerified: boolean;
  isEfpasVerified: boolean;
  efpScore?: number;
  efpasScore?: number;
  totalEarnings: number;
  totalTransactions: number;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceGHS: number;
  priceUSDC: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

const VendorProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { getVendorByENS } = useVendorDiscovery();
  const { formatGhsPrice } = usePricing();
  
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFollowing, setIsFollowing] = useState(false);

  const ensName = params.ensName as string;

  // Get vendor's bUSDC balance (for display purposes)
  const { data: vendorBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [vendorProfile?.id || "0x0"],
  });

  useEffect(() => {
    const loadVendorProfile = async () => {
      if (!ensName) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getVendorByENS(ensName);
        if (response.success && response.data) {
          setVendorProfile(response.data);
        } else {
          setError('Vendor not found');
        }
      } catch (err) {
        console.error('Error loading vendor profile:', err);
        setError('Failed to load vendor profile');
      } finally {
        setLoading(false);
      }
    };

    loadVendorProfile();
  }, [ensName, getVendorByENS]);

  const handleOrderNow = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!isWalletLinked) {
      router.push('/user-dashboard');
      return;
    }

    // Navigate to payment page with vendor info
    router.push(`/payment?vendor=${encodeURIComponent(ensName)}`);
  };

  const handleFollow = () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    setIsFollowing(!isFollowing);
    // TODO: Implement follow functionality
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${vendorProfile?.businessName} - Tap&Go Pay`,
          text: `Check out ${vendorProfile?.businessName} on Tap&Go Pay`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vendor Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <BackArrow />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Vendor Profile</h1>
        <button
          onClick={handleShare}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Vendor Header */}
        <div className="bg-white dark:bg-gray-800 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                {vendorProfile.businessName.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {vendorProfile.businessName}
                </h2>
                {vendorProfile.isEfpVerified && (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-2">{vendorProfile.ensName}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span>{vendorProfile.rating.toFixed(1)}</span>
                </div>
                <span>{vendorProfile.totalTransactions} orders</span>
                <span>{vendorProfile.businessType}</span>
              </div>
            </div>
          </div>

          {vendorProfile.description && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">{vendorProfile.description}</p>
          )}

          {/* Contact Info */}
          <div className="mt-4 space-y-2">
            {vendorProfile.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4" />
                <span>{vendorProfile.location}</span>
              </div>
            )}
            {vendorProfile.phoneNumber && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <PhoneIcon className="w-4 h-4" />
                <span>{vendorProfile.phoneNumber}</span>
              </div>
            )}
            {vendorProfile.website && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <GlobeAltIcon className="w-4 h-4" />
                <a href={vendorProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {vendorProfile.website}
                </a>
              </div>
            )}
          </div>

          {/* Verification Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {vendorProfile.isEfpVerified && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                EFP Verified
              </span>
            )}
            {vendorProfile.isEfpasVerified && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                EFPas Verified
              </span>
            )}
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
              Tap&Go Vendor
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOrderNow}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              <span>Order Now</span>
            </button>
            
            <button
              onClick={handleFollow}
              className={`py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                isFollowing
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <HeartIcon className="w-5 h-5" />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Menu</h3>
          
          {/* Category Filter */}
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems
              .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatGhsPrice(item.priceGHS)}
                    </p>
                    {!item.isAvailable && (
                      <p className="text-xs text-red-500">Out of stock</p>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {menuItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No menu items available</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vendor Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vendorProfile.totalTransactions}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatGhsPrice(vendorProfile.totalEarnings)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
