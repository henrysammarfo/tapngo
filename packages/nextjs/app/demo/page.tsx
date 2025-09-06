'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState('1000.00');
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'payment',
      amount: '25.00',
      recipient: 'Coffee Shop',
      status: 'completed',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'received',
      amount: '50.00',
      sender: 'John Doe',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handlePayment = () => {
    const newTransaction = {
      id: transactions.length + 1,
      type: 'payment',
      amount: '15.00',
      recipient: 'Demo Vendor',
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    setTransactions([newTransaction, ...transactions]);
    setBalance((parseFloat(balance) - 15.00).toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 TapNGo Pay Demo
          </h1>
          <p className="text-xl text-gray-600">
            Live demonstration of instant cryptocurrency payments
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Wallet Connection</h2>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connected Address:</span>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Balance</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ₵{balance}
            </div>
            <div className="text-gray-600">
              ~ ${(parseFloat(balance) * 0.15).toFixed(2)} USDC
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* QR Payment */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">QR Code Payment</h3>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500">QR Code</span>
              </div>
              <button
                onClick={handlePayment}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Scan & Pay ₵15.00
              </button>
            </div>
          </div>

          {/* NFC Payment */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">NFC Tap-to-Pay</h3>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <button
                onClick={handlePayment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Tap to Pay ₵15.00
              </button>
            </div>
          </div>
        </div>

        {/* Smart Contracts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Smart Contracts (Base Sepolia)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700">bUSDC Token</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                0xeb9361Ec0d712C5B12965FB91c409262b7d6703c
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">PaymentRouter</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                0xd4C84453E1640BDD8a9EB0Dd645c0C4208dD66eF
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">VendorRegistry</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                0xA9F04F020CF9F511982719196E25FE7c666c9E4D
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Paymaster</h4>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                0x23E3d0017A282f48bF80dE2A6E670f57be2C9152
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">
                    {tx.type === 'payment' ? `Paid ${tx.recipient}` : `Received from ${tx.sender}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className={`font-semibold ${tx.type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.type === 'payment' ? '-' : '+'}₵{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Demo Features</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>✅ Wallet connection with MetaMask</li>
              <li>✅ Real-time balance updates</li>
              <li>✅ QR code and NFC payment simulation</li>
              <li>✅ Transaction history</li>
              <li>✅ Smart contracts deployed on Base Sepolia</li>
              <li>✅ Mobile-responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
