'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  className?: string;
}

export default function QRScanner({ onScanSuccess, onScanFailure, className = '' }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-scanner',
        {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (error) => {
          if (onScanFailure) {
            onScanFailure(error);
          }
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className={className}>
      <div id="qr-scanner" ref={containerRef}></div>
    </div>
  );
}
