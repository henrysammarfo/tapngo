'use client';

import { useState } from 'react';
import { RealENSService } from '@/services/realENSService';

export default function ENSSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{
    type: 'address' | 'ens';
    input: string;
    output: string;
    success: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResult(null);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Check if input is an address (starts with 0x and is 42 characters)
      if (query.startsWith('0x') && query.length === 42) {
        // Reverse lookup: address to ENS
        const ensName = await RealENSService.reverseResolve(query);
        setResult({
          type: 'address',
          input: query,
          output: ensName || 'No ENS name found',
          success: !!ensName
        });
      } else if (query.endsWith('.tapngo.eth')) {
        // Search by registered subname
        const registrations = JSON.parse(localStorage.getItem('subnameRegistrations') || '[]');
        const registration = registrations.find((r: any) => r.fullName === query);
        if (registration) {
          setResult({
            type: 'subname',
            input: query,
            output: registration.address,
            success: true
          });
        } else {
          setResult({
            type: 'subname',
            input: query,
            output: 'Subname not found',
            success: false
          });
        }
      } else {
        // Try to find in registered subnames first
        const registrations = JSON.parse(localStorage.getItem('subnameRegistrations') || '[]');
        const registration = registrations.find((r: any) => r.subname === query);
        if (registration) {
          setResult({
            type: 'subname',
            input: query,
            output: registration.address,
            success: true
          });
        } else {
          // Forward lookup: ENS to address
          const address = await RealENSService.resolveName(query);
          setResult({
            type: 'ens',
            input: query,
            output: address || 'Address not found',
            success: !!address
          });
        }
      }
    } catch (error: any) {
      setResult({
        type: query.startsWith('0x') ? 'address' : 'ens',
        input: query,
        output: '',
        success: false,
        error: error.message || 'Search failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatAddress = (address: string) => {
    if (address.length === 42 && address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ENS Lookup
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
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter ENS name (e.g., vitalik.eth) or address (0x...)"
            className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="absolute inset-y-0 right-0 px-6 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {result && (
          <div className="mb-8">
            <div className={`p-6 rounded-lg border-2 ${
              result.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {result.type === 'ens' ? 'ENS to Address' : 'Address to ENS'}
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'Found' : 'Not Found'}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {result.type === 'ens' ? 'ENS Name' : 'Address'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm">
                      {result.input}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.input)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {result.type === 'ens' ? 'Resolved Address' : 'ENS Name'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm">
                      {result.output}
                    </code>
                    {result.success && (
                      <button
                        onClick={() => copyToClipboard(result.output)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {result.error && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">ENS to Address</h4>
              <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• vitalik.eth</li>
                <li>• ens.eth</li>
                <li>• uniswap.eth</li>
                <li>• aave.eth</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Address to ENS</h4>
              <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</li>
                <li>• 0x1234567890123456789012345678901234567890</li>
                <li>• Any Ethereum address</li>
              </ul>
            </div>
          </div>
        </div>

        {/* About ENS */}
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">About ENS (Ethereum Name Service)</h3>
          <p className="text-blue-800 text-sm mb-3">
            ENS is a distributed, open, and extensible naming system based on the Ethereum blockchain. 
            It maps human-readable names like 'vitalik.eth' to machine-readable identifiers such as Ethereum addresses.
          </p>
          <div className="text-sm text-blue-800">
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Resolve ENS names to addresses</li>
              <li>Reverse resolve addresses to ENS names</li>
              <li>Store text records (avatars, descriptions, etc.)</li>
              <li>Subdomain support for organizations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}