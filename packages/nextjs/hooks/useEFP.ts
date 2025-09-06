import { useState, useEffect } from 'react';
import { efpService, EFPProfile } from '~~/services/efpService';

export const useEFP = (address?: string) => {
  const [profile, setProfile] = useState<EFPProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    const fetchEFPProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const efpProfile = await efpService.getProfile(address);
        setProfile(efpProfile);
      } catch (err) {
        setError('Failed to fetch EFP profile');
        console.error('EFP fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEFPProfile();
  }, [address]);

  return {
    profile,
    score: profile?.score || 0,
    level: profile?.level || 'bronze',
    levelColor: profile?.levelColor || 'text-amber-600',
    levelIcon: profile?.levelIcon || '🥉',
    meetsVendorRequirements: profile?.meetsVendorRequirements || false,
    loading,
    error
  };
};
