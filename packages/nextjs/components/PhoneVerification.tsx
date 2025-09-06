"use client";

import React, { useState, useEffect } from 'react';
import { useApiContext } from '~~/contexts/ApiContext';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  PhoneIcon,
  ClockIcon 
} from '@heroicons/react/20/solid';

interface PhoneVerificationProps {
  onVerified?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerified,
  onError,
  className = ""
}) => {
  const { userProfile, verifyPhoneNumber, confirmPhoneOTP, authError } = useApiContext();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already verified
  useEffect(() => {
    if (userProfile?.isPhoneVerified) {
      setStep('verified');
    }
  }, [userProfile]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await verifyPhoneNumber(phoneNumber);
      if (success) {
        setStep('otp');
        setCountdown(60); // 60 second countdown
      } else {
        setError(authError || 'Failed to send OTP');
        onError?.(authError || 'Failed to send OTP');
      }
    } catch (err) {
      const errorMsg = 'Failed to send OTP';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await confirmPhoneOTP(phoneNumber, otp);
      if (success) {
        setStep('verified');
        onVerified?.();
      } else {
        setError(authError || 'Invalid OTP');
        onError?.(authError || 'Invalid OTP');
      }
    } catch (err) {
      const errorMsg = 'Failed to verify OTP';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError(null);

    try {
      const success = await verifyPhoneNumber(phoneNumber);
      if (success) {
        setCountdown(60);
        setOtp('');
      } else {
        setError(authError || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +233 XX XXX XXXX for Ghana
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
    }
  };

  if (step === 'verified') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <CheckIcon className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Phone Verified</h3>
            <p className="text-sm text-green-600">
              Your phone number {userProfile?.phoneNumber} has been verified
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <PhoneIcon className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Phone Verification</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="+233 XX XXX XXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={17}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your phone number with country code (e.g., +233 for Ghana)
            </p>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || !phoneNumber.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            onClick={() => setStep('phone')}
            className="w-full text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Change Phone Number
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;
