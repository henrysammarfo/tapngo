'use client';

import { useState, useEffect } from 'react';

interface NFCData {
  type: string;
  data: any;
  timestamp: number;
}

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setIsSupported(true);
    }
  }, []);

  const readNFC = async (): Promise<NFCData | null> => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return null;
    }

    try {
      setIsReading(true);
      setError(null);

      const reader = new (window as any).NDEFReader();
      await reader.scan();

      return new Promise((resolve, reject) => {
        reader.addEventListener('reading', (event: any) => {
          const message = event.message;
          const record = message.records[0];
          
          if (record) {
            const data = {
              type: record.recordType,
              data: record.data,
              timestamp: Date.now()
            };
            resolve(data);
          } else {
            reject(new Error('No data found'));
          }
        });

        reader.addEventListener('error', (event: any) => {
          reject(new Error(event.error));
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('NFC read timeout'));
        }, 30000);
      });
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsReading(false);
    }
  };

  const writeNFC = async (data: any): Promise<boolean> => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return false;
    }

    try {
      setError(null);

      const writer = new (window as any).NDEFWriter();
      const message = {
        records: [
          {
            recordType: 'text',
            data: JSON.stringify(data)
          }
        ]
      };

      await writer.write(message);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    isSupported,
    isReading,
    error,
    readNFC,
    writeNFC
  };
}
