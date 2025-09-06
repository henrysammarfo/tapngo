'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '@/lib/wagmi';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import QRCodeScanner from '@/components/QRCodeScanner';

export default function PaymentPage() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'scan'>('send');
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Your Wallet</h1>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !sendForm.recipient || !sendForm.amount) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amountWei = BigInt(Math.floor(parseFloat(sendForm.amount) * 1e6));
      let recipientAddress = sendForm.recipient;

      // If recipient is an ENS name, resolve it first
      if (sendForm.recipient.endsWith('.eth') || sendForm.recipient.endsWith('.tapngo.eth')) {
        const { RealENSService } = await import('@/services/realENSService');
        const resolved = await RealENSService.resolveName(sendForm.recipient);
        if (!resolved) {
          throw new Error('Could not resolve ENS name');
        }
        recipientAddress = resolved;
      }

      // Simple transfer using bUSDC contract
      await writeContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "to", "type": "address"},
              {"name": "amount", "type": "uint256"}
            ],
            "name": "transfer",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'transfer',
        args: [recipientAddress as `0x${string}`, amountWei]
      });

      setSuccess(true);
      setSendForm({ recipient: '', amount: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const paymentData = JSON.parse(data);
      setSendForm(prev => ({
        ...prev,
        recipient: paymentData.recipient,
        amount: paymentData.amount
      }));
      setActiveTab('send');
    } catch (error) {
      setError('Invalid QR code data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T&G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tap&Go Pay
                </h1>
                <p className="text-gray-600 text-sm">Payment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'send'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Send Money
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'receive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Receive Money
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scan'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Scan QR
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Money</h2>
            
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address or ENS Name
                </label>
                <input
                  type="text"
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder="0x... or name.eth"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (bUSDC)
                </label>
                <input
                  type="number"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <input
                  type="text"
                  value={sendForm.message}
                  onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Payment message"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
                  <p className="text-green-800">✅ Payment sent successfully!</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !sendForm.recipient || !sendForm.amount}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Payment'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'receive' && (
          <QRCodeGenerator amount="" recipient={address} />
        )}

        {activeTab === 'scan' && (
          <QRCodeScanner onScan={handleQRScan} onError={setError} />
        )}
      </div>
    </div>
  );
}
