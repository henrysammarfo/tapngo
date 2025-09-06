'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

interface ProfileCardProps {
  address: string;
  ensName?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  github?: string;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  onFollow?: (address: string) => void;
  onUnfollow?: (address: string) => void;
  showFollowButton?: boolean;
}

export default function ProfileCard({
  address,
  ensName,
  name,
  bio,
  avatar,
  website,
  twitter,
  github,
  followers = 0,
  following = 0,
  isFollowing = false,
  onFollow,
  onUnfollow,
  showFollowButton = true
}: ProfileCardProps) {
  const { address: currentUserAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!onFollow) return;
    setIsLoading(true);
    try {
      await onFollow(address);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!onUnfollow) return;
    setIsLoading(true);
    try {
      await onUnfollow(address);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = name || ensName?.split('.')[0] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const isOwnProfile = currentUserAddress?.toLowerCase() === address.toLowerCase();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{displayName}</h3>
            {ensName && (
              <p className="text-blue-600 font-mono text-sm">{ensName}</p>
            )}
            <p className="text-gray-500 text-sm font-mono">{address}</p>
          </div>
        </div>
        
        {showFollowButton && !isOwnProfile && (
          <div>
            {isFollowing ? (
              <button
                onClick={handleUnfollow}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Unfollowing...' : 'Unfollow'}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Following...' : 'Follow'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <div className="mb-4">
          <p className="text-gray-700">{bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex space-x-6 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{followers}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{following}</div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>

      {/* Social Links */}
      {(website || twitter || github) && (
        <div className="flex space-x-4">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </a>
          )}
          {twitter && (
            <a
              href={`https://twitter.com/${twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          )}
          {github && (
            <a
              href={`https://github.com/${github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
