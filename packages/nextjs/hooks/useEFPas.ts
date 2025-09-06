// packages/nextjs/hooks/useEFPas.ts
import { useState, useEffect, useCallback } from 'react';
import { efpasService, EFPasProfile } from '~~/services/efpasService';

interface UseEFPasResult {
  profile: EFPasProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  meetsVendorRequirements: boolean;
  level: string;
  levelColor: string;
  levelIcon: string;
  levelDescription: string;
}

export const useEFPas = (walletAddress: string | null): UseEFPasResult => {
  const [profile, setProfile] = useState<EFPasProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEFPasProfile = useCallback(async () => {
    if (!walletAddress) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const efpasProfile = await efpasService.getProfile(walletAddress);
      setProfile(efpasProfile);
    } catch (err: any) {
      console.error('EFPas fetch error:', err);
      setProfile(null);
      setError(err.message || 'Failed to fetch EFPas profile');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchEFPasProfile();
  }, [fetchEFPasProfile]);

  const level = profile?.level || 'bronze';
  const levelColor = profile?.levelColor || 'text-amber-600';
  const levelIcon = profile?.levelIcon || '🥉';
  const levelDescription = profile?.levelDescription || 'Basic verification with limited reputation data';
  const meetsVendorRequirements = profile?.meetsVendorRequirements || false;

  return {
    profile,
    loading,
    error,
    refetch: fetchEFPasProfile,
    meetsVendorRequirements,
    level,
    levelColor,
    levelIcon,
    levelDescription
  };
};

// Hook for batch EFPas verification
interface UseBatchEFPasResult {
  profiles: Record<string, EFPasProfile | null>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBatchEFPas = (addresses: string[]): UseBatchEFPasResult => {
  const [profiles, setProfiles] = useState<Record<string, EFPasProfile | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchProfiles = useCallback(async () => {
    if (addresses.length === 0) {
      setProfiles({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        addresses.map(async (address) => {
          try {
            const profile = await efpasService.getProfile(address);
            return { address, profile };
          } catch (err) {
            console.error(`EFPas fetch error for ${address}:`, err);
            return { address, profile: null };
          }
        })
      );
      
      const processedProfiles: Record<string, EFPasProfile | null> = {};
      results.forEach(({ address, profile }) => {
        processedProfiles[address] = profile;
      });
      
      setProfiles(processedProfiles);
      setError(null);
    } catch (err: any) {
      console.error('Batch EFPas fetch error:', err);
      setProfiles({});
      setError(err.message || 'Failed to fetch batch EFPas profiles');
    } finally {
      setLoading(false);
    }
  }, [addresses]);

  useEffect(() => {
    fetchBatchProfiles();
  }, [fetchBatchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchBatchProfiles
  };
};