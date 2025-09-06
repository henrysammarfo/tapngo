import { useState, useEffect, useCallback } from 'react';
import { ensService, ENSResolutionResult } from '~~/services/ensService';
import { Address } from 'viem';

interface UseENSResult {
  address: Address | null;
  resolver: Address | null;
  isVendorSubname: boolean;
  subnameLabel?: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useENS = (ensName: string | null): UseENSResult => {
  const [result, setResult] = useState<ENSResolutionResult>({
    address: null,
    resolver: null,
    isVendorSubname: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchENS = useCallback(async () => {
    if (!ensName) {
      setResult({
        address: null,
        resolver: null,
        isVendorSubname: false
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resolution = await ensService.resolveENS(ensName);
      setResult(resolution);
    } catch (err: any) {
      console.error('ENS resolution error:', err);
      setResult({
        address: null,
        resolver: null,
        isVendorSubname: false
      });
      setError(err.message || 'Failed to resolve ENS name');
    } finally {
      setLoading(false);
    }
  }, [ensName]);

  useEffect(() => {
    fetchENS();
  }, [fetchENS]);

  return {
    address: result.address,
    resolver: result.resolver,
    isVendorSubname: result.isVendorSubname,
    subnameLabel: result.subnameLabel,
    loading,
    error,
    refetch: fetchENS
  };
};

// Hook for reverse ENS lookup (address to ENS)
interface UseReverseENSResult {
  ensName: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReverseENS = (address: Address | null): UseReverseENSResult => {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReverseENS = useCallback(async () => {
    if (!address) {
      setEnsName(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if it's a vendor subname
      const vendorSubname = await ensService.getVendorSubname(address);
      if (vendorSubname) {
        setEnsName(vendorSubname);
        return;
      }

      // TODO: Implement reverse ENS lookup for external ENS names
      // This would require querying the ENS registry for reverse resolution
      setEnsName(null);
    } catch (err: any) {
      console.error('Reverse ENS lookup error:', err);
      setEnsName(null);
      setError(err.message || 'Failed to lookup ENS name');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchReverseENS();
  }, [fetchReverseENS]);

  return {
    ensName,
    loading,
    error,
    refetch: fetchReverseENS
  };
};

// Hook for ENS text records (avatar, description, etc.)
interface UseENSTextRecordResult {
  value: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useENSTextRecord = (ensName: string | null, key: string): UseENSTextRecordResult => {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTextRecord = useCallback(async () => {
    if (!ensName || !key) {
      setValue(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const textValue = await ensService.getTextRecord(ensName, key);
      setValue(textValue);
    } catch (err: any) {
      console.error('ENS text record fetch error:', err);
      setValue(null);
      setError(err.message || 'Failed to fetch ENS text record');
    } finally {
      setLoading(false);
    }
  }, [ensName, key]);

  useEffect(() => {
    fetchTextRecord();
  }, [fetchTextRecord]);

  return {
    value,
    loading,
    error,
    refetch: fetchTextRecord
  };
};

// Hook for ENS avatar
export const useENSAvatar = (ensName: string | null) => {
  return useENSTextRecord(ensName, 'avatar');
};

// Hook for ENS description
export const useENSDescription = (ensName: string | null) => {
  return useENSTextRecord(ensName, 'description');
};
