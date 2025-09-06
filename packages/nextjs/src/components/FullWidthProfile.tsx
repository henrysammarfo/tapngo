'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ENSService } from '@/services/ensService';
import { EFPService } from '@/services/efpService';
import ProfileCard from './ProfileCard';

interface FullWidthProfileProps {
  address: string;
}

export default function FullWidthProfile({ address }: FullWidthProfileProps) {
  const { address: currentUserAddress } = useAccount();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [address]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get profile from localStorage first (demo data)
      const localProfile = localStorage.getItem(`profile_${address}`);
      if (localProfile) {
        const profileData = JSON.parse(localProfile);
        setProfile(profileData);
        setLoading(false);
        return;
      }

      // Try to get ENS name and profile
      const ensName = await ENSService.reverseResolve(address);
      const efpProfile = await EFPService.getProfile(address);

      setProfile({
        address,
        ensName,
        name: efpProfile.name || ensName?.split('.')[0] || `${address.slice(0, 6)}...${address.slice(-4)}`,
        bio: efpProfile.bio || 'Tap&Go Pay user',
        avatar: efpProfile.avatar || '',
        website: efpProfile.website || '',
        twitter: efpProfile.twitter || '',
        github: efpProfile.github || '',
        followers: efpProfile.followers || 0,
        following: efpProfile.following || 0
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetAddress: string) => {
    try {
      // This would call the EFP contract to follow
      console.log(`Following ${targetAddress}`);
      // In a real implementation, this would use useWriteContract
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (targetAddress: string) => {
    try {
      // This would call the EFP contract to unfollow
      console.log(`Unfollowing ${targetAddress}`);
      // In a real implementation, this would use useWriteContract
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div>
              <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-2">👤</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">No profile data available for this address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileCard
        address={profile.address}
        ensName={profile.ensName}
        name={profile.name}
        bio={profile.bio}
        avatar={profile.avatar}
        website={profile.website}
        twitter={profile.twitter}
        github={profile.github}
        followers={profile.followers}
        following={profile.following}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        showFollowButton={currentUserAddress?.toLowerCase() !== address.toLowerCase()}
      />
    </div>
  );
}
