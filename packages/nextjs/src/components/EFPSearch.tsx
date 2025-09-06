'use client';

import { useState, useEffect } from 'react';
import { EFPService, EFPProfile } from '@/services/efpService';
import { ENSService } from '@/services/ensService';

export default function EFPSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EFPProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingUsers, setTrendingUsers] = useState<EFPProfile[]>([]);

  useEffect(() => {
    loadTrendingUsers();
  }, []);

  const loadTrendingUsers = async () => {
    try {
      const trending = await EFPService.getTrendingUsers(5);
      setTrendingUsers(trending);
    } catch (error) {
      console.error('Error loading trending users:', error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await EFPService.searchUsers(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          EFP Social Search
        </h1>
        
        {/* Search Input */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by ENS name or address..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {query && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Results for "{query}"
            </h2>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((profile, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-12 h-12 rounded-full" />
                      ) : (
                        <span className="text-white font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                      {profile.ensName && (
                        <p className="text-blue-600 font-mono text-sm">{profile.ensName}</p>
                      )}
                      <p className="text-gray-600 text-sm">{profile.bio}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{profile.followers} followers</span>
                        <span>{profile.following} following</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {profile.socialLinks.twitter && (
                        <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      {profile.socialLinks.github && (
                        <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Searching...' : 'No users found'}
              </div>
            )}
          </div>
        )}

        {/* Trending Users */}
        {!query && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trending Users
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingUsers.map((profile, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{profile.name}</h3>
                      {profile.ensName && (
                        <p className="text-blue-600 font-mono text-xs">{profile.ensName}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{profile.bio}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{profile.followers} followers</span>
                    <span>{profile.following} following</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About EFP */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">About EFP (Ethereum Follow Protocol)</h3>
          <p className="text-blue-800 text-sm">
            EFP is a social graph protocol for Ethereum that enables users to follow each other and build social connections on-chain. 
            It integrates with ENS to provide rich profile information and social features for Web3 applications.
          </p>
        </div>
      </div>
    </div>
  );
}
