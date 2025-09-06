'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACTS } from '@/lib/wagmi';
import { SubnameRegistrarService } from '@/services/subnameRegistrarService';

export default function SubnameRegistration() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [subname, setSubname] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<boolean | null>(null);

  const checkAvailability = async () => {
    if (!subname.trim()) return;
    
    try {
      const isAvailable = await SubnameRegistrarService.isSubnameAvailable(subname);
      setAvailability(isAvailable);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability(null);
    }
  };

  const handleRegister = async () => {
    if (!subname.trim() || !address) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check availability first
      const isAvailable = await SubnameRegistrarService.isSubnameAvailable(subname);
      if (!isAvailable) {
        setError('Subname is not available');
        setLoading(false);
        return;
      }

      // Register the subname
      await writeContract({
        address: CONTRACTS.SubnameRegistrar as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "subname", "type": "string"}
            ],
            "name": "registerUserSubname",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          }
        ],
        functionName: 'registerUserSubname',
        args: [subname],
        value: 0n // Free registration
      });

      // Store the registration locally for search functionality
      const registrationData = {
        subname,
        address,
        timestamp: Date.now(),
        fullName: `${subname}.tapngo.eth`
      };
      
      // Store in localStorage for demo purposes
      const existingRegistrations = JSON.parse(localStorage.getItem('subnameRegistrations') || '[]');
      existingRegistrations.push(registrationData);
      localStorage.setItem('subnameRegistrations', JSON.stringify(existingRegistrations));

      setSuccess(true);
      setSubname('');
      setAvailability(null);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isValidSubname = (name: string) => {
    // Basic validation: alphanumeric and hyphens only, 3-20 characters
    const regex = /^[a-zA-Z0-9-]{3,20}$/;
    return regex.test(name);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register ENS Subname</h2>
        <p className="text-gray-600">Get your own .tapngo.eth subname</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subname
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={subname}
              onChange={(e) => {
                setSubname(e.target.value.toLowerCase());
                setAvailability(null);
              }}
              placeholder="yourname"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-mono">
              .tapngo.eth
            </span>
          </div>
          {subname && !isValidSubname(subname) && (
            <p className="text-red-600 text-sm mt-1">
              Subname must be 3-20 characters, alphanumeric and hyphens only
            </p>
          )}
        </div>

        {subname && isValidSubname(subname) && (
          <div>
            <button
              onClick={checkAvailability}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Check Availability
            </button>
            {availability !== null && (
              <div className={`mt-2 p-3 rounded-lg ${
                availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {availability ? '✅ Available!' : '❌ Not available'}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800">✅ Subname registered successfully!</p>
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={loading || !subname || !isValidSubname(subname) || availability === false}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Registering...' : 'Register Subname'}
        </button>

        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This registers a subname locally on Base Sepolia. For full ENS integration, the parent domain (tapngo.eth) would need to be owned on Ethereum mainnet.</p>
        </div>
      </div>
    </div>
  );
}
