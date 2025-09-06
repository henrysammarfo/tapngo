'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaymentRouterService } from '@/services/paymentRouterService';

export default function TransactionHistoryPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (address) {
        setLoading(true);
        try {
          const txHistory = await PaymentRouterService.getPaymentHistory(address);
          setTransactions(txHistory);
        } catch (error) {
          console.error('Error loading transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTransactions();
  }, [address]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600">View your payment history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600 mb-6">
                  Your transaction history will appear here once you start making payments
                </p>
                <button
                  onClick={() => router.push('/send-money')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Send Your First Payment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.from.toLowerCase() === address?.toLowerCase() ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <span className={`text-lg ${
                          tx.from.toLowerCase() === address?.toLowerCase() ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.from.toLowerCase() === address?.toLowerCase() ? '↗' : '↙'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.from.toLowerCase() === address?.toLowerCase() ? 'Sent to' : 'Received from'} 
                          {' '}{tx.from.toLowerCase() === address?.toLowerCase() ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : tx.from.slice(0, 6) + '...' + tx.from.slice(-4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.from.toLowerCase() === address?.toLowerCase() ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.from.toLowerCase() === address?.toLowerCase() ? '-' : '+'}
                        {(Number(tx.amount) / 1e6).toFixed(2)} bUSDC
                      </p>
                      <p className="text-sm text-gray-600">
                        ₵{((Number(tx.amount) / 1e6) * 15.5).toFixed(2)} GHS
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">About Transaction History</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• All transactions are recorded on Base Sepolia blockchain</li>
            <li>• You can view transaction details on BaseScan</li>
            <li>• Transaction history is automatically updated</li>
            <li>• All payments are processed instantly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
