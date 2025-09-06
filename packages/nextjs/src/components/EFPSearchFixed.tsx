'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { RealENSService } from '@/services/realENSService';
import { RealEFPService } from '@/services/realEFPService';

interface User {
  address: string;
  ensName: string | null;
  name: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
}

export default function EFPSearchFixed() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendingUsers();
  }, []);

  const loadTrendingUsers = async () => {
    try {
      setLoading(true);
      const trending = await RealEFPService.getTrendingUsers();
      const users: User[] = [];

      for (const address of trending) {
        try {
          const profile = await RealEFPService.getProfile(address);
          users.push({
            address,
            ensName: profile.ensName,
            name: profile.name,
            bio: profile.bio,
            avatar: profile.avatar,
            followers: profile.followers,
            following: profile.following
          });
        } catch (error) {
          console.error(`Error loading profile for ${address}:`, error);
        }
      }

      setTrendingUsers(users);
    } catch (error) {
      console.error('Error loading trending users:', error);
      setError('Failed to load trending users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const results = await RealEFPService.searchUsers(searchQuery);
      const users: User[] = [];

      for (const result of results) {
        users.push({
          address: result.address,
          ensName: result.ensName,
          name: result.name,
          bio: result.bio,
          avatar: result.avatar,
          followers: result.followers,
          following: result.following
        });
      }

      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Search failed');
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Search Users</h2>
        
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ENS name or address..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((user) => (
              <div key={user.address} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{user.name}</h4>
                    {user.ensName && (
                      <p className="text-blue-600 font-mono text-sm">{user.ensName}</p>
                    )}
                    <p className="text-gray-600 text-sm">{user.bio}</p>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>{user.followers} followers</span>
                      <span>{user.following} following</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFollow(user.address)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Follow
                  </button>
                  <button
                    onClick={() => handleUnfollow(user.address)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Users */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Users</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading trending users...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trendingUsers.map((user) => (
              <div key={user.address} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{user.name}</h4>
                    {user.ensName && (
                      <p className="text-blue-600 font-mono text-sm">{user.ensName}</p>
                    )}
                    <p className="text-gray-600 text-sm">{user.bio}</p>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>{user.followers} followers</span>
                      <span>{user.following} following</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFollow(user.address)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Follow
                  </button>
                  <button
                    onClick={() => handleUnfollow(user.address)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
