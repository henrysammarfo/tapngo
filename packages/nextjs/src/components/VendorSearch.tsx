'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { VendorRegistryService } from '@/services/vendorRegistryService';
import { ENSService } from '@/services/ensService';

interface VendorProfile {
  address: string;
  businessName: string;
  phoneNumber: string;
  ensName: string;
  isActive: boolean;
  registrationDate: number;
}

export default function VendorSearch() {
  const { address: connectedAddress } = useAccount();
  const [query, setQuery] = useState('');
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllVendors();
  }, []);

  const loadAllVendors = async () => {
    setLoading(true);
    try {
      // Since getAllVendors returns empty array, let's create some mock vendors for demo
      // In a real implementation, this would fetch from the contract
      const mockVendors: VendorProfile[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          businessName: 'Demo Coffee Shop',
          phoneNumber: '+233 24 123 4567',
          ensName: 'coffee.eth',
          isActive: true,
          registrationDate: Math.floor(Date.now() / 1000) - 86400
        },
        {
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          businessName: 'Tech Store',
          phoneNumber: '+233 20 987 6543',
          ensName: 'techstore.eth',
          isActive: true,
          registrationDate: Math.floor(Date.now() / 1000) - 172800
        }
      ];
      setVendors(mockVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      loadAllVendors();
      return;
    }

    setLoading(true);
    try {
      let results: VendorProfile[] = [];

      // Search by business name
      const nameResults = vendors.filter(vendor =>
        vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Search by ENS name
      const ensResults = vendors.filter(vendor =>
        vendor.ensName.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Search by address
      const addressResults = vendors.filter(vendor =>
        vendor.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Combine and deduplicate results
      const allResults = [...nameResults, ...ensResults, ...addressResults];
      const uniqueResults = allResults.filter((vendor, index, self) =>
        index === self.findIndex(v => v.address === vendor.address)
      );

      setVendors(uniqueResults);
    } catch (error) {
      console.error('Error searching vendors:', error);
      setError('Search failed');
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Search</h2>
        <p className="text-gray-600">Find registered vendors on Tap&Go Pay</p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search by business name, ENS name, or address..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No vendors found</p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.address} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vendor.businessName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>ENS:</strong> {vendor.ensName || 'Not set'}</p>
                    <p><strong>Phone:</strong> {vendor.phoneNumber}</p>
                    <p><strong>Address:</strong> 
                      <span className="font-mono text-xs ml-1">
                        {vendor.address.slice(0, 6)}...{vendor.address.slice(-4)}
                      </span>
                    </p>
                    <p><strong>Registered:</strong> {formatDate(vendor.registrationDate)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => window.open(`https://sepolia.basescan.org/address/${vendor.address}`, '_blank')}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    View on BaseScan
                  </button>
                  {vendor.ensName && (
                    <button
                      onClick={() => window.open(`https://app.ens.domains/name/${vendor.ensName}`, '_blank')}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm hover:bg-purple-200 transition-colors"
                    >
                      View ENS
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
