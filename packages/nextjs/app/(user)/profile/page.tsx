"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useUserData } from '~~/hooks/useUserData';
import { useEFP } from '~~/hooks/useEFP';
import { useEFPas } from '~~/hooks/useEFPas';
import { ensService } from '~~/services/ensService';
import { apiService } from '~~/services/api';
import BackArrow from '~~/components/BackArrow';
import PhoneVerification from '~~/components/PhoneVerification';
import { useApiContext } from '~~/contexts/ApiContext';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  PencilIcon,
  CameraIcon,
  LinkIcon,
  XMarkIcon,
  UserIcon,
  WalletIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  StarIcon
} from '@heroicons/react/20/solid';

const ProfilePage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { userData, loading: userDataLoading, refetch: refetchUserData } = useUserData();
  const { userProfile, refreshUserProfile } = useApiContext();
  const { 
    score: efpScore, 
    loading: efpLoading, 
    error: efpError,
    meetsVendorRequirements: efpMeetsVendorRequirements,
    level: efpLevel,
    levelColor: efpLevelColor,
    levelIcon: efpLevelIcon
  } = useEFP(walletAddress);
  const { 
    score: efpasScore, 
    loading: efpasLoading, 
    error: efpasError,
    meetsVendorRequirements: efpasMeetsVendorRequirements,
    level: efpasLevel,
    levelColor: efpasLevelColor,
    levelIcon: efpasLevelIcon,
    levelDescription: efpasLevelDescription
  } = useEFPas(walletAddress);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: ''
  });
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensLoading, setEnsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      router.push('/sign-in');
    }
  }, [clerkLoaded, clerkUser, router]);

  useEffect(() => {
    if (userData) {
      setEditForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  useEffect(() => {
    const resolveENS = async () => {
      if (walletAddress) {
        setEnsLoading(true);
        try {
          const resolved = await ensService.resolveName(walletAddress);
          setEnsName(resolved);
        } catch (error) {
          console.error('Failed to resolve ENS name:', error);
          setEnsName(null);
        } finally {
          setEnsLoading(false);
        }
      }
    };
    resolveENS();
  }, [walletAddress]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      setEditForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || '',
        phone: userData.phone || ''
      });
    }
  };

  const handleSave = async () => {
    if (!clerkUser) return;

    setSaving(true);
    setError(null);

    try {
      const token = await clerkUser.getToken();
      setAuthToken(token);

      await apiService.updateUserProfile(editForm);
      await refetchUserData();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDisplayName = () => {
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    if (userData?.first_name) {
      return userData.first_name;
    }
    if (clerkUser?.firstName && clerkUser?.lastName) {
      return `${clerkUser.firstName} ${clerkUser.lastName}`;
    }
    if (clerkUser?.firstName) {
      return clerkUser.firstName;
    }
    return clerkUser?.primaryEmailAddress?.emailAddress || 'User';
  };

  const getProfilePicture = () => {
    if (userData?.profile_picture) {
      return userData.profile_picture;
    }
    return clerkUser?.imageUrl || '/default-avatar.png';
  };

  if (!clerkLoaded || userDataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clerkUser) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <BackArrow />
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckIcon className="h-5 w-5" />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture & Basic Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={getProfilePicture()}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <CameraIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {getDisplayName()}
                </h2>
                {userData?.username && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    @{userData.username}
                  </p>
                )}
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <WalletIcon className="h-5 w-5 mr-2" />
                Wallet
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={isWalletLinked ? 'text-green-600' : 'text-red-600'}>
                    {isWalletLinked ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                {walletAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Address:</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                )}
                {ensName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ENS:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {ensName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Contact
              </h3>
              <div className="space-y-3">
                {clerkUser.primaryEmailAddress && (
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {clerkUser.primaryEmailAddress.emailAddress}
                    </span>
                  </div>
                )}
                {userData?.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900 dark:text-white">
                        {userData.phone}
                      </span>
                      {userData.phone_verified ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            {!userProfile?.isPhoneVerified && (
              <PhoneVerification 
                onVerified={() => {
                  refreshUserProfile();
                  refetchUserData();
                }}
                className="mt-6"
              />
            )}
          </div>

          {/* Right Column - Verification & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="p-3 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {userData?.first_name || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="p-3 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {userData?.last_name || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="p-3 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {userData?.username || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="p-3 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                      {userData?.phone || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Verification Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EFP Verification */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">EFP Trust Score</h4>
                  {efpLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 text-sm">Loading...</span>
                    </div>
                  ) : efpError ? (
                    <p className="text-red-600 text-sm">Failed to load EFP data</p>
                  ) : efpScore ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Score:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${efpLevelColor}`}>
                          {efpLevelIcon} {efpScore.trustScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Vendor Ready:</span>
                        <span className={efpMeetsVendorRequirements ? 'text-green-600' : 'text-red-600'}>
                          {efpMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No EFP data available</p>
                  )}
                </div>

                {/* EFPas Verification */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">EFPas Reputation</h4>
                  {efpasLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 text-sm">Loading...</span>
                    </div>
                  ) : efpasError ? (
                    <p className="text-red-600 text-sm">Failed to load EFPas data</p>
                  ) : efpasScore ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Score:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${efpasLevelColor}`}>
                          {efpasLevelIcon} {efpasScore.score}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Level:</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {efpasLevel.charAt(0).toUpperCase() + efpasLevel.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Vendor Ready:</span>
                        <span className={efpasMeetsVendorRequirements ? 'text-green-600' : 'text-red-600'}>
                          {efpasMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No EFPas data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <StarIcon className="h-5 w-5 mr-2" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userData?.login_count || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Login Count</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userData?.last_login ? new Date(userData.last_login).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Last Login</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
