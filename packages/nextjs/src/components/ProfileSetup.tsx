'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { RealENSService } from '@/services/realENSService';

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatar: '',
    website: '',
    twitter: '',
    github: ''
  });
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'ens' | 'profile'>('ens');
  const [error, setError] = useState<string | null>(null);

  const handleENSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ensName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      // Check if ENS name is available
      const isAvailable = await RealENSService.isNameAvailable(ensName);
      if (!isAvailable) {
        setError('ENS name is not available');
        setLoading(false);
        return;
      }
      
      setStep('profile');
    } catch (error) {
      console.error('Error checking ENS name:', error);
      setError('Error checking ENS name availability');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create ENS profile by setting text records
      const transactions = await ENSProfileService.createENSProfile(ensName, profile);
      
      // Execute transactions one by one
      for (const txData of transactions) {
        // This would need to be implemented with proper contract interaction
        // For now, we'll simulate the process
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Store locally for demo purposes (in production, this would be on-chain)
      localStorage.setItem(`profile_${address}`, JSON.stringify({
        ...profile,
        ensName,
        address
      }));
      
      onComplete();
    } catch (error) {
      console.error('Error setting up profile:', error);
      setError('Error setting up profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Profile</h2>
        <p className="text-gray-600">Create your Tap&Go Pay profile with ENS integration</p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'ens' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'profile' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {step === 'ens' ? (
        <form onSubmit={handleENSSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ENS Name
            </label>
            <input
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="yourname.eth"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose an ENS name for your profile (e.g., alice.eth)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !ensName.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking...' : 'Check Availability'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅ ENS name <strong>{ensName}</strong> is available!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={profile.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://your-website.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twitter Handle
            </label>
            <input
              type="text"
              value={profile.twitter}
              onChange={(e) => handleInputChange('twitter', e.target.value)}
              placeholder="@username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Username
            </label>
            <input
              type="text"
              value={profile.github}
              onChange={(e) => handleInputChange('github', e.target.value)}
              placeholder="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setStep('ens')}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !profile.name.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}