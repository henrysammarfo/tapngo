'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTRACTS } from '@/lib/wagmi';
import { ENSService } from '@/services/ensService';
import { PaymentRouterService } from '@/services/paymentRouterService';

export default function SendMoneyPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isENS, setIsENS] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  // Get bUSDC balance
  const { data: balance } = useReadContract({
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

  // Write contract for transfer
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Check if input is ENS name and resolve it
  useEffect(() => {
    const checkENS = async () => {
      if (recipient && recipient.includes('.eth')) {
        setIsENS(true);
        try {
          const address = await ENSService.resolveName(recipient);
          setResolvedAddress(address);
        } catch (err) {
          setResolvedAddress(null);
        }
      } else {
        setIsENS(false);
        setResolvedAddress(null);
      }
    };

    checkENS();
  }, [recipient]);

  const handleSend = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    // Use resolved address if ENS, otherwise use recipient directly
    const targetAddress = isENS ? resolvedAddress : recipient;
    
    if (isENS && !resolvedAddress) {
      setError('ENS name could not be resolved');
      return;
    }

    if (!targetAddress) {
      setError('Invalid recipient address');
      return;
    }

    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6)); // bUSDC has 6 decimals

    if (balance && balance < amountWei) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Create P2P payment order
      const orderId = await writeContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "recipient", "type": "address"},
              {"name": "amountGHS", "type": "uint256"},
              {"name": "metadata", "type": "string"}
            ],
            "name": "sendP2PPayment",
            "outputs": [{"name": "orderId", "type": "bytes32"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'sendP2PPayment',
        args: [targetAddress as `0x${string}`, BigInt(Math.floor(parseFloat(amount))), 'P2P payment'],
      });

      // Step 2: Approve the PaymentRouter to spend tokens
      await writeContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "value", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [CONTRACTS.PaymentRouter as `0x${string}`, amountWei],
      });

      // Step 3: Complete the payment
      await writeContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "orderId", "type": "bytes32"}
            ],
            "name": "completePayment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'completePayment',
        args: [orderId],
      });

      setSuccess(true);
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return (Number(balance) / 1e6).toFixed(2);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
              <p className="text-gray-600">Send bUSDC to any address</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balance</h2>
          <div className="text-3xl font-bold text-blue-600">
            {formatBalance(balance)} bUSDC
          </div>
          <p className="text-gray-600 mt-2">≈ ₵{(Number(formatBalance(balance)) * 15.5).toFixed(2)} GHS</p>
        </div>

        {/* Send Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Payment</h2>
          
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800">Payment sent successfully!</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address or ENS Name
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x... or example.eth"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isENS && (
                <div className="mt-2">
                  {resolvedAddress ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <span className="text-sm">✅</span>
                      <span className="text-sm">Resolved to: {resolvedAddress}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <span className="text-sm">❌</span>
                      <span className="text-sm">ENS name not found</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (bUSDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {amount && (
                <p className="text-sm text-gray-600 mt-1">
                  ≈ ₵{(parseFloat(amount) * 15.5).toFixed(2)} GHS
                </p>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={loading || !isConnected || !recipient || !amount || (isENS && !resolvedAddress)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Sending...' : 'Send Payment'}
            </button>
          </div>

          {/* Status Info */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Wallet Status: {isConnected ? '✅ Connected' : '❌ Not Connected'}</p>
            {!isConnected && (
              <p className="text-red-600 mt-2">Please connect your wallet to send payments</p>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to Send</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Enter the recipient's wallet address or ENS name (e.g., example.eth)</li>
            <li>• ENS names will be automatically resolved to addresses</li>
            <li>• Enter the amount in bUSDC</li>
            <li>• Confirm the transaction in your wallet</li>
            <li>• Transaction will be processed on Base Sepolia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
