'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface QRGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRGenerator({ data, size = 200, className = '' }: QRGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="bg-white p-6 rounded-xl shadow-xl inline-block border-2 border-gray-100">
        <QRCodeSVG
          value={data}
          size={size}
          bgColor="#ffffff"
          fgColor="#1f2937"
          level="M"
          includeMargin={true}
        />
      </div>
      <div className="mt-6">
        <button
          onClick={handleCopy}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
        >
          {copied ? '✅ Copied!' : '📋 Copy QR Data'}
        </button>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        <p>Scan this QR code to send payment</p>
      </div>
    </div>
  );
}
