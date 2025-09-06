import { useState, useEffect, useCallback } from 'react';
import { nfcService, NFCMessage } from '~~/services/nfcService';

interface UseNFCOptions {
  onPaymentRequest?: (message: NFCMessage) => void;
  onPaymentResponse?: (message: NFCMessage) => void;
  onVendorInfo?: (message: NFCMessage) => void;
  autoStart?: boolean;
}

export const useNFC = (options: UseNFCOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);

  const { onPaymentRequest, onPaymentResponse, onVendorInfo, autoStart = false } = options;

  useEffect(() => {
    setIsSupported(nfcService.getSupportStatus());
    
    if (nfcService.getSupportStatus()) {
      checkPermission();
    }
  }, []);

  useEffect(() => {
    if (autoStart && isSupported && permission === 'granted') {
      startReading();
    }
  }, [autoStart, isSupported, permission]);

  const checkPermission = async () => {
    try {
      const hasPermission = await nfcService.requestPermission();
      setPermission(hasPermission ? 'granted' : 'denied');
    } catch (error) {
      setError('Failed to check NFC permission');
      setPermission('denied');
    }
  };

  const startReading = useCallback(async () => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    if (permission !== 'granted') {
      setError('NFC permission is required');
      return;
    }

    try {
      setError(null);
      await nfcService.startReading((message: NFCMessage) => {
        switch (message.type) {
          case 'payment_request':
            onPaymentRequest?.(message);
            break;
          case 'payment_response':
            onPaymentResponse?.(message);
            break;
          case 'vendor_info':
            onVendorInfo?.(message);
            break;
        }
      });
      setIsReading(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start NFC reading');
    }
  }, [isSupported, permission, onPaymentRequest, onPaymentResponse, onVendorInfo]);

  const stopReading = useCallback(() => {
    nfcService.stopReading();
    setIsReading(false);
  }, []);

  const writeMessage = useCallback(async (message: NFCMessage) => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    if (permission !== 'granted') {
      setError('NFC permission is required');
      return;
    }

    try {
      setError(null);
      setIsWriting(true);
      await nfcService.writeMessage(message);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to write NFC message');
    } finally {
      setIsWriting(false);
    }
  }, [isSupported, permission]);

  const createPaymentRequest = useCallback((vendorId: string, vendorEns: string, amount: number, currency: string = 'GHS') => {
    return nfcService.createPaymentRequest(vendorId, vendorEns, amount, currency);
  }, []);

  const createPaymentResponse = useCallback((orderId: string, status: 'completed' | 'failed') => {
    return nfcService.createPaymentResponse(orderId, status);
  }, []);

  const createVendorInfo = useCallback((vendorId: string, vendorEns: string) => {
    return nfcService.createVendorInfo(vendorId, vendorEns);
  }, []);

  return {
    isSupported,
    isReading,
    isWriting,
    permission,
    error,
    startReading,
    stopReading,
    writeMessage,
    createPaymentRequest,
    createPaymentResponse,
    createVendorInfo,
    checkPermission
  };
};
