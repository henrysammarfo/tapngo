'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/wagmi';
import { FaucetService } from '@/services/faucetService';
import { VendorRegistryService } from '@/services/vendorRegistryService';
import { SubnameRegistrarService } from '@/services/subnameRegistrarService';
import { PaymasterService } from '@/services/paymasterService';

interface ContractStatus {
  name: string;
  address: string;
  status: 'connected' | 'error' | 'loading';
  details?: string;
}

export default function ContractStatus() {
  const { address } = useAccount();
  const [contracts, setContracts] = useState<ContractStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Test bUSDC contract
  const { data: bUSDCBalance, error: bUSDCError } = useReadContract({
    address: CONTRACTS.bUSDC as `0x${string}`,
    abi: [
      {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address }
  });

  // Test PaymentRouter contract
  const { data: paymentRouterBalance, error: paymentRouterError } = useReadContract({
    address: CONTRACTS.PaymentRouter as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "getCurrentFxRate",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getCurrentFxRate',
    query: { enabled: !!address }
  });

  useEffect(() => {
    const testContracts = async () => {
      setLoading(true);
      const contractStatuses: ContractStatus[] = [];

      // Test bUSDC
      contractStatuses.push({
        name: 'bUSDC Token',
        address: CONTRACTS.bUSDC,
        status: bUSDCError ? 'error' : 'connected',
        details: bUSDCBalance ? `Balance: ${(Number(bUSDCBalance) / 1e6).toFixed(2)} bUSDC` : 'Connected'
      });

      // Test PaymentRouter
      contractStatuses.push({
        name: 'PaymentRouter',
        address: CONTRACTS.PaymentRouter,
        status: paymentRouterError ? 'error' : 'connected',
        details: paymentRouterBalance ? `FX Rate: ${Number(paymentRouterBalance)}` : 'Connected'
      });

      // Test VendorRegistry
      try {
        const vendorCount = await VendorRegistryService.getVendorCount();
        contractStatuses.push({
          name: 'VendorRegistry',
          address: CONTRACTS.VendorRegistry,
          status: 'connected',
          details: `Vendors: ${vendorCount}`
        });
      } catch (error) {
        contractStatuses.push({
          name: 'VendorRegistry',
          address: CONTRACTS.VendorRegistry,
          status: 'error',
          details: 'Connection failed'
        });
      }

      // Test SubnameRegistrar
      try {
        const isAvailable = await SubnameRegistrarService.isSubnameAvailable('test');
        contractStatuses.push({
          name: 'SubnameRegistrar',
          address: CONTRACTS.SubnameRegistrar,
          status: 'connected',
          details: 'Subname registration available'
        });
      } catch (error) {
        contractStatuses.push({
          name: 'SubnameRegistrar',
          address: CONTRACTS.SubnameRegistrar,
          status: 'error',
          details: 'Connection failed'
        });
      }

      // Test Paymaster
      try {
        const isActive = await PaymasterService.isActive();
        contractStatuses.push({
          name: 'Paymaster',
          address: CONTRACTS.Paymaster,
          status: 'connected',
          details: isActive ? 'Active' : 'Inactive'
        });
      } catch (error) {
        contractStatuses.push({
          name: 'Paymaster',
          address: CONTRACTS.Paymaster,
          status: 'error',
          details: 'Connection failed'
        });
      }

      // Test Faucet
      if (address) {
        try {
          const { canClaim } = await FaucetService.canClaimFaucet(address);
          contractStatuses.push({
            name: 'Faucet (bUSDC)',
            address: CONTRACTS.bUSDC,
            status: 'connected',
            details: canClaim ? 'Can claim 10 bUSDC' : 'Cooldown active'
          });
        } catch (error) {
          contractStatuses.push({
            name: 'Faucet (bUSDC)',
            address: CONTRACTS.bUSDC,
            status: 'error',
            details: 'Faucet check failed'
          });
        }
      }

      setContracts(contractStatuses);
      setLoading(false);
    };

    testContracts();
  }, [address, bUSDCBalance, bUSDCError, paymentRouterBalance, paymentRouterError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'loading':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'error':
        return '❌';
      case 'loading':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Status</h2>
        <p className="text-gray-600">Verify all contracts are connected and working</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Testing contracts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(contract.status)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Address:</strong> 
                  <span className="font-mono text-xs ml-1">
                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                  </span>
                </p>
                {contract.details && (
                  <p><strong>Details:</strong> {contract.details}</p>
                )}
              </div>
              
              <div className="mt-3">
                <button
                  onClick={() => window.open(`https://sepolia.basescan.org/address/${contract.address}`, '_blank')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  View on BaseScan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All contracts are deployed on Base Sepolia testnet</p>
      </div>
    </div>
  );
}
