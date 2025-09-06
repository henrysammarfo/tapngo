"use client";

import React, { useState, useRef, useEffect } from 'react';
import { qrService, PaymentQRData, VendorQRData } from '~~/services/qrService';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon,
  CameraIcon,
  QrCodeIcon
} from '@heroicons/react/20/solid';

interface QRScannerProps {
  onScan: (data: PaymentQRData | VendorQRData) => void;
  onError: (error: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  onClose,
  title = "Scan QR Code",
  description = "Point your camera at a QR code to scan"
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setHasPermission(true);
      })
      .catch((err) => {
        console.error('Camera permission denied:', err);
        setHasPermission(false);
        setError('Camera permission is required to scan QR codes');
      });
  }, []);

  const handleScan = (result: string) => {
    if (!result) return;

    setIsScanning(false);
    
    try {
      const parsedData = qrService.parseQRData(result);
      
      if (!parsedData) {
        onError('Invalid QR code format');
        return;
      }

      // Check if QR code is expired
      if (qrService.isQRExpired(parsedData.timestamp)) {
        onError('QR code has expired');
        return;
      }

      // Validate the data based on type
      if (parsedData.type === 'payment_request') {
        if (!qrService.validatePaymentQR(parsedData)) {
          onError('Invalid payment QR code');
          return;
        }
      } else if (parsedData.type === 'vendor_info') {
        if (!qrService.validateVendorQR(parsedData)) {
          onError('Invalid vendor QR code');
          return;
        }
      } else {
        onError('Unsupported QR code type');
        return;
      }

      onScan(parsedData);
    } catch (err) {
      console.error('QR scan error:', err);
      onError('Failed to process QR code');
    }
  };

  const handleError = (err: any) => {
    console.error('QR scanner error:', err);
    setError('Failed to access camera');
    setIsScanning(false);
  };

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Camera Permission Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please allow camera access to scan QR codes
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <QrCodeIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {description}
        </p>

        {/* Scanner */}
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 h-64 flex items-center justify-center">
            <div className="text-center">
              <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">QR Scanner</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Camera access required for QR scanning
              </p>
              <button
                onClick={() => {
                  // Simulate a successful scan for demo purposes
                  const mockData = {
                    type: 'payment_request' as const,
                    amount: 25.00,
                    currency: 'GHS',
                    vendor_ens: 'demo.tapngo.eth',
                    vendor_address: '0x1234567890123456789012345678901234567890',
                    timestamp: Date.now()
                  };
                  handleScan(JSON.stringify(mockData));
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Demo Scan
              </button>
            </div>
          </div>

          {!hasPermission && (
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Requesting camera permission...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-64 bg-red-50 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Position the QR code within the frame above
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
