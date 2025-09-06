'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACTS } from '@/lib/wagmi';
import { PaymentRouterService } from '@/services/paymentRouterService';

export default function NFCPayment() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const handleNFCPayment = async () => {
    if (!address || !amount || !recipient) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));

      // Step 1: Create P2P payment order
      const orderId = await writeContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "recipient", "type": "address"},
              {"name": "amountUSDC", "type": "uint256"},
              {"name": "metadata", "type": "string"}
            ],
            "name": "sendP2PPayment",
            "outputs": [{"name": "orderId", "type": "bytes32"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'sendP2PPayment',
        args: [recipient as `0x${string}`, amountWei, 'NFC Payment']
      });

      // Step 2: Approve the PaymentRouter to spend tokens
      await writeContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: [
          {
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [CONTRACTS.PaymentRouter as `0x${string}`, amountWei]
      });

      // Step 3: Complete the payment
      await writeContract({
        address: CONTRACTS.PaymentRouter as `0x${string}`,
        abi: [
          {
            "inputs": [{"name": "orderId", "type": "bytes32"}],
            "name": "completePayment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'completePayment',
        args: [orderId]
      });

      setSuccess(true);
      setAmount('');
      setRecipient('');
    } catch (err: any) {
      setError(err.message || 'NFC payment failed');
    } finally {
      setLoading(false);
    }
  };

  const startNFCReading = async () => {
    if (!nfcSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    setNfcReading(true);
    setError(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', (event: any) => {
        const decoder = new TextDecoder();
        const message = decoder.decode(event.message.data);
        
        try {
          const data = JSON.parse(message);
          if (data.type === 'payment' && data.recipient && data.amount) {
            setRecipient(data.recipient);
            setAmount(data.amount.toString());
            setNfcReading(false);
          }
        } catch (e) {
          setError('Invalid NFC data format');
          setNfcReading(false);
        }
      });

      ndef.addEventListener('readingerror', () => {
        setError('NFC reading failed');
        setNfcReading(false);
      });

    } catch (err: any) {
      setError(err.message || 'Failed to start NFC reading');
      setNfcReading(false);
    }
  };

  const stopNFCReading = () => {
    setNfcReading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NFC Payment</h2>
        <p className="text-gray-600">Tap to pay with NFC or scan QR code</p>
      </div>

      <div className="space-y-6">
        {/* NFC Status */}
        <div className="text-center">
          {nfcSupported ? (
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <span className="mr-2">📱</span>
              NFC Supported
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
              <span className="mr-2">❌</span>
              NFC Not Supported
            </div>
          )}
        </div>

        {/* NFC Reading Button */}
        {nfcSupported && (
          <div className="text-center">
            <button
              onClick={nfcReading ? stopNFCReading : startNFCReading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                nfcReading
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {nfcReading ? 'Stop NFC Reading' : 'Start NFC Reading'}
            </button>
            {nfcReading && (
              <p className="mt-2 text-sm text-gray-600">Hold your device near an NFC tag...</p>
            )}
          </div>
        )}

        {/* Manual Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or ENS name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800">✅ Payment sent successfully!</p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleNFCPayment}
          disabled={loading || !amount || !recipient || !address}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Send Payment'}
        </button>

        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> NFC payments work on supported devices. You can also manually enter recipient and amount.</p>
        </div>
      </div>
    </div>
  );
}
