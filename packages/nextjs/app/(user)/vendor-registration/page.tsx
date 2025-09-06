"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useEFP } from '~~/hooks/useEFP';
import { useEFPas } from '~~/hooks/useEFPas';
import { ensService } from '~~/services/ensService';
import { apiService } from '~~/services/api';
import BackArrow from '~~/components/BackArrow';
import { 
  CheckIcon, 
  ExclamationTriangleIcon, 
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhoneIcon,
  UserIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/20/solid';

interface VendorFormData {
  ens_name: string;
  business_name: string;
  business_description: string;
  business_category: string;
  business_website: string;
  business_logo: string;
  phone: string;
}

const businessCategories = [
  'Food & Beverage',
  'Retail',
  'Services',
  'Technology',
  'Healthcare',
  'Education',
  'Entertainment',
  'Transportation',
  'Real Estate',
  'Finance',
  'Other'
];

const VendorRegistrationPage = () => {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  const { 
    score: efpScore, 
    loading: efpLoading, 
    meetsVendorRequirements: efpMeetsVendorRequirements,
    level: efpLevel,
    levelColor: efpLevelColor,
    levelIcon: efpLevelIcon
  } = useEFP(walletAddress);
  const { 
    score: efpasScore, 
    loading: efpasLoading, 
    meetsVendorRequirements: efpasMeetsVendorRequirements,
    level: efpasLevel,
    levelColor: efpasLevelColor,
    levelIcon: efpasLevelIcon
  } = useEFPas(walletAddress);

  const [formData, setFormData] = useState<VendorFormData>({
    ens_name: '',
    business_name: '',
    business_description: '',
    business_category: '',
    business_website: '',
    business_logo: '',
    phone: ''
  });

  const [ensAvailability, setEnsAvailability] = useState<boolean | null>(null);
  const [checkingEns, setCheckingEns] = useState(false);
  const [ensError, setEnsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      router.push('/sign-in');
    }
  }, [clerkLoaded, clerkUser, router]);

  useEffect(() => {
    // Check if user can proceed based on requirements
    const hasWallet = isWalletLinked && walletAddress;
    const hasEfp = efpMeetsVendorRequirements;
    const hasEfpas = efpasMeetsVendorRequirements;
    const hasPhone = clerkUser?.primaryPhoneNumber?.phoneNumber;
    
    setCanProceed(hasWallet && hasEfp && hasEfpas && hasPhone);
  }, [isWalletLinked, walletAddress, efpMeetsVendorRequirements, efpasMeetsVendorRequirements, clerkUser]);

  const handleInputChange = (field: keyof VendorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear ENS availability when ENS name changes
    if (field === 'ens_name') {
      setEnsAvailability(null);
      setEnsError(null);
    }
  };

  const checkEnsAvailability = async () => {
    if (!formData.ens_name) {
      setEnsError('Please enter an ENS subname');
      return;
    }

    const fullEnsName = `${formData.ens_name}.tapngo.eth`;
    const validation = ensService.validateEnsName(formData.ens_name);
    
    if (!validation.isValid) {
      setEnsError(validation.error);
      return;
    }

    setCheckingEns(true);
    setEnsError(null);

    try {
      const available = await ensService.isSubnameAvailable(formData.ens_name);
      setEnsAvailability(available);
      
      if (!available) {
        setEnsError('This ENS subname is already taken');
      }
    } catch (error) {
      console.error('Error checking ENS availability:', error);
      setEnsError('Failed to check ENS availability');
    } finally {
      setCheckingEns(false);
    }
  };

  const handleSubmit = async () => {
    if (!clerkUser || !canProceed) {
      setError('Please complete all requirements before registering');
      return;
    }

    if (!ensAvailability) {
      setError('Please check ENS availability first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await clerkUser.getToken();
      setAuthToken(token);

      const response = await apiService.post('/vendor/register', {
        ...formData,
        ens_name: `${formData.ens_name}.tapngo.eth`
      });

      if (response.data.success) {
        setSuccess('Vendor registration submitted successfully! Your application is under review.');
        setTimeout(() => {
          router.push('/business-home');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Failed to register vendor:', err);
      setError(err.response?.data?.error?.message || 'Failed to register vendor');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!clerkLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clerkUser) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <BackArrow />
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 mt-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Become a Vendor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Register your business to accept payments on Tap&Go Pay
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Requirements</span>
            <span>Business Info</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Step 1: Requirements Check */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Vendor Requirements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Wallet Connection */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Wallet Connection
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                    <span className={isWalletLinked ? 'text-green-600' : 'text-red-600'}>
                      {isWalletLinked ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  {walletAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Address:</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Verification */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Phone Verification
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified:</span>
                    <span className={clerkUser.primaryPhoneNumber ? 'text-green-600' : 'text-red-600'}>
                      {clerkUser.primaryPhoneNumber ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  {clerkUser.primaryPhoneNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {clerkUser.primaryPhoneNumber.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* EFP Verification */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  EFP Trust Score
                </h3>
                {efpLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm">Loading...</span>
                  </div>
                ) : efpScore ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Score:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${efpLevelColor}`}>
                        {efpLevelIcon} {efpScore.trustScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vendor Ready:</span>
                      <span className={efpMeetsVendorRequirements ? 'text-green-600' : 'text-red-600'}>
                        {efpMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No EFP data available</p>
                )}
              </div>

              {/* EFPas Verification */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  EFPas Reputation
                </h3>
                {efpasLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm">Loading...</span>
                  </div>
                ) : efpasScore ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Score:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${efpasLevelColor}`}>
                        {efpasLevelIcon} {efpasScore.score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vendor Ready:</span>
                      <span className={efpasMeetsVendorRequirements ? 'text-green-600' : 'text-red-600'}>
                        {efpasMeetsVendorRequirements ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No EFPas data available</p>
                )}
              </div>
            </div>

            {!canProceed && (
              <div className="bg-yellow-50 dark:bg-yellow-900 rounded-2xl p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Please complete all requirements before proceeding to vendor registration.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Business Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ENS Subname *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.ens_name}
                    onChange={(e) => handleInputChange('ens_name', e.target.value)}
                    placeholder="your-business-name"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="p-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    .tapngo.eth
                  </span>
                  <button
                    onClick={checkEnsAvailability}
                    disabled={checkingEns || !formData.ens_name}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingEns ? 'Checking...' : 'Check'}
                  </button>
                </div>
                {ensError && <p className="text-red-600 text-sm mt-1">{ensError}</p>}
                {ensAvailability !== null && (
                  <p className={`text-sm mt-1 ${ensAvailability ? 'text-green-600' : 'text-red-600'}`}>
                    {ensAvailability ? '✅ Available' : '❌ Not available'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Category *
                </label>
                <select
                  value={formData.business_category}
                  onChange={(e) => handleInputChange('business_category', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {businessCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Website
                </label>
                <input
                  type="url"
                  value={formData.business_website}
                  onChange={(e) => handleInputChange('business_website', e.target.value)}
                  placeholder="https://your-website.com"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                placeholder="Describe your business..."
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Logo URL
              </label>
              <input
                type="url"
                value={formData.business_logo}
                onChange={(e) => handleInputChange('business_logo', e.target.value)}
                placeholder="https://your-website.com/logo.png"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Review & Submit
            </h2>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Business Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ENS Name:</span>
                  <span className="text-gray-900 dark:text-white">{formData.ens_name}.tapngo.eth</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Business Name:</span>
                  <span className="text-gray-900 dark:text-white">{formData.business_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-gray-900 dark:text-white">{formData.business_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Website:</span>
                  <span className="text-gray-900 dark:text-white">{formData.business_website || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="text-gray-900 dark:text-white">{formData.business_description}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-6">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Your vendor application will be reviewed by our team</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• Once approved, you can start accepting payments</li>
                    <li>• You'll have access to vendor dashboard and analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !canProceed}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || !ensAvailability || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationPage;
