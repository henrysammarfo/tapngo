'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SimpleHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TapNGo Pay</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#demo" className="text-gray-600 hover:text-blue-600">Demo</a>
              <a href="#contracts" className="text-gray-600 hover:text-blue-600">Contracts</a>
            </nav>

            <div className="flex space-x-4">
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Live Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Future of Payments
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Instant cryptocurrency payments using NFC and QR technology. 
            Built on Base network for fast, secure, and affordable transactions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Live Demo →
            </Link>
            <a
              href="#features"
              className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Key Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">NFC Tap-to-Pay</h3>
              <p className="text-gray-600">
                Hold phones together for instant peer-to-peer transfers. 
                No internet required for the NFC connection.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">QR Code Payments</h3>
              <p className="text-gray-600">
                Scan QR codes to pay vendors instantly. 
                Perfect for coffee shops, restaurants, and retail.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Vendor Tools</h3>
              <p className="text-gray-600">
                Business registration, menu management, 
                and payment analytics for vendors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Experience the future of payments with our live demo
          </p>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">User Experience</h3>
                <ul className="text-left space-y-3 text-gray-600">
                  <li>✅ Connect wallet in seconds</li>
                  <li>✅ Get demo USDC tokens</li>
                  <li>✅ Make instant payments</li>
                  <li>✅ View transaction history</li>
                  <li>✅ Mobile-optimized interface</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold mb-4">Vendor Features</h3>
                <ul className="text-left space-y-3 text-gray-600">
                  <li>✅ Business registration</li>
                  <li>✅ Digital menu creation</li>
                  <li>✅ QR code generation</li>
                  <li>✅ Payment analytics</li>
                  <li>✅ Real-time notifications</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
              >
                Launch Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contracts Section */}
      <section id="contracts" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Smart Contracts on Base Sepolia
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">bUSDC Token</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border">
                0xeb9361Ec0d712C5B12965FB91c409262b7d6703c
              </p>
              <p className="text-gray-600 mt-2">Base USDC Test Token for payments</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">PaymentRouter</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border">
                0xd4C84453E1640BDD8a9EB0Dd645c0C4208dD66eF
              </p>
              <p className="text-gray-600 mt-2">Main payment processing contract</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">VendorRegistry</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border">
                0xA9F04F020CF9F511982719196E25FE7c666c9E4D
              </p>
              <p className="text-gray-600 mt-2">Vendor management and verification</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Paymaster</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border">
                0x23E3d0017A282f48bF80dE2A6E670f57be2C9152
              </p>
              <p className="text-gray-600 mt-2">Gasless transaction support</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View on BaseScan
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-xl font-bold">TapNGo Pay</span>
          </div>
          
          <p className="text-gray-400 mb-6">
            Built with ❤️ for the future of payments in Ghana and beyond
          </p>
          
          <div className="flex justify-center space-x-6">
            <a href="https://github.com/henrysammarfo/tapngo" className="text-gray-400 hover:text-white">
              GitHub
            </a>
            <a href="https://base.org" className="text-gray-400 hover:text-white">
              Base Network
            </a>
            <a href="https://sepolia.basescan.org" className="text-gray-400 hover:text-white">
              BaseScan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
