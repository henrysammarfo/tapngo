'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACTS } from '@/lib/wagmi';
import { VendorRegistryService } from '@/services/vendorRegistryService';

export default function VendorRegistration() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: '',
    ensName: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Register vendor
      await writeContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "businessName", "type": "string"},
              {"name": "phoneNumber", "type": "string"},
              {"name": "ensName", "type": "string"}
            ],
            "name": "registerVendor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'registerVendor',
        args: [formData.businessName, formData.phoneNumber, formData.ensName]
      });

      setSuccess(true);
      setFormData({ businessName: '', phoneNumber: '', ensName: '' });
    } catch (err: any) {
      setError(err.message || 'Vendor registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register as Vendor</h2>
        <p className="text-gray-600">Register your business to accept payments</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter your business name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ENS Name (Optional)
          </label>
          <input
            type="text"
            value={formData.ensName}
            onChange={(e) => handleInputChange('ensName', e.target.value)}
            placeholder="yourname.eth"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your ENS name will be used for payments (e.g., payments to yourname.eth)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800">✅ Vendor registered successfully!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !formData.businessName || !formData.phoneNumber}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registering...' : 'Register Vendor'}
        </button>

        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> After registration, your business will be searchable and you can accept payments through Tap&Go Pay.</p>
        </div>
      </form>
    </div>
  );
}
