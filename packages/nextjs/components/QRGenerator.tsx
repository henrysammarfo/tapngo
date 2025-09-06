"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { qrService, PaymentQRData, VendorQRData } from '~~/services/qrService';
import { 
  QrCodeIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ShareIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid';

interface QRGeneratorProps {
  type: 'payment' | 'vendor';
  data: any;
  size?: number;
  showControls?: boolean;
  onExpire?: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  type,
  data,
  size = 256,
  showControls = true,
  onExpire
}) => {
  const [qrData, setQrData] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let qrString = '';
    
    if (type === 'payment') {
      qrString = qrService.generatePaymentRequestQR(data);
    } else if (type === 'vendor') {
      qrString = qrService.generateVendorQR(data);
    }
    
    setQrData(qrString);
  }, [type, data]);

  useEffect(() => {
    if (!qrData) return;

    const parsedData = qrService.parseQRData(qrData);
    if (!parsedData) return;

    const updateTimer = () => {
      const remaining = qrService.getTimeRemaining(parsedData.timestamp);
      setTimeRemaining(remaining);
      
      if (remaining === 'Expired') {
        setIsExpired(true);
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [qrData, onExpire]);

  const handleDownload = () => {
    if (!qrData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    
    // Create a temporary div to render the QR code
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Render QR code to canvas (simplified approach)
    const svg = new QRCodeSVG({
      value: qrData,
      size: size,
      bgColor: '#ffffff',
      fgColor: '#000000',
      level: 'M',
      includeMargin: true
    });

    // For now, we'll use a simple approach
    // In a real implementation, you'd convert SVG to canvas
    const link = document.createElement('a');
    link.download = `qr-code-${type}-${Date.now()}.png`;
    link.href = `data:image/svg+xml;base64,${btoa(svg.toString())}`;
    link.click();

    document.body.removeChild(tempDiv);
  };

  const handleShare = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${type === 'payment' ? 'Payment' : 'Vendor'} QR Code`,
          text: `Scan this QR code to ${type === 'payment' ? 'make a payment' : 'view vendor info'}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(qrData);
        alert('QR code data copied to clipboard');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  if (!qrData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Generating QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="text-center">
        {/* QR Code */}
        <div className="mb-4">
          {isExpired ? (
            <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400 font-medium">QR Code Expired</p>
              </div>
            </div>
          ) : (
            <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
              <QRCodeSVG
                value={qrData}
                size={size}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
                includeMargin={true}
              />
            </div>
          )}
        </div>

        {/* QR Code Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {type === 'payment' ? 'Payment QR Code' : 'Vendor QR Code'}
          </h3>
          
          {type === 'payment' && (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Amount: {qrService.formatCurrency(data.amount, data.currency)}</p>
              <p>Vendor: {data.vendor_ens}</p>
              {data.order_id && <p>Order: {data.order_id}</p>}
            </div>
          )}
          
          {type === 'vendor' && (
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Business: {data.business_name}</p>
              <p>ENS: {data.ens_name}</p>
              <p>Category: {data.category}</p>
            </div>
          )}
        </div>

        {/* Timer */}
        {!isExpired && timeRemaining && (
          <div className="mb-4 flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            <span>Expires in: {timeRemaining}</span>
          </div>
        )}

        {/* Controls */}
        {showControls && !isExpired && (
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>
            {type === 'payment' 
              ? 'Customer scans this QR code to make a payment'
              : 'Customers scan this QR code to view your business info'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
