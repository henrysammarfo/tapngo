'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

interface QRCodeGeneratorProps {
  amount?: string;
  recipient?: string;
}

export default function QRCodeGenerator({ amount = '', recipient = '' }: QRCodeGeneratorProps) {
  const { address } = useAccount();
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    if (address) {
      const paymentData = {
        type: 'payment',
        recipient: recipient || address,
        amount: amount || '0',
        network: 'base-sepolia',
        timestamp: Date.now()
      };
      setQrData(JSON.stringify(paymentData));
    }
  }, [address, amount, recipient]);

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'payment-qr.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const generateQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 200, 200);
    
    // Draw a simple QR-like pattern for demo
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, 10, 180, 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(20, 20, 160, 160);
    
    // Draw some squares to simulate QR code
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(30 + i * 20, 30 + j * 20, 15, 15);
        }
      }
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [qrData]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment QR Code</h3>
        <p className="text-gray-600">Scan to receive payment</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <canvas
            id="qr-canvas"
            width="200"
            height="200"
            className="border border-gray-300"
          ></canvas>
        </div>

        {/* QR Code Data */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Payment Data:</p>
          <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
            <p className="text-xs font-mono break-all">{qrData}</p>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadQR}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download QR Code
        </button>

        {/* Payment Info */}
        <div className="text-center text-sm text-gray-600">
          <p><strong>Amount:</strong> {amount || 'Any'}</p>
          <p><strong>Recipient:</strong> {recipient || address}</p>
        </div>
      </div>
    </div>
  );
}
