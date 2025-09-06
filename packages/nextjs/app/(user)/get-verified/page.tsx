"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/20/solid";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';

const GetVerified = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <>
      <BackArrow />

      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100 p-4">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          {/* Verification Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Get Verified</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unlock higher transaction limits and build customer trust
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700 text-sm">Business registration verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700 text-sm">Identity documents approved</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-700 text-sm">Bank account linked</span>
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm font-medium">Verification Status</p>
              <p className="text-gray-500 text-xs mt-1">Level 2 Verified Business</p>
            </div>
            <div className="bg-orange-500 rounded-lg px-3 py-1 flex items-center space-x-1">
              <CheckIcon className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button className="w-full text-lg font-medium text-white shadow-lg px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-500 rounded-xl hover:from-blue-900 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]">
          Continue to Dashboard
        </button>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        <div className="flex items-center justify-center min-h-screen px-8 py-12">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Main Content */}
              <div className="w-full max-w-xl mx-auto lg:mx-0">
                {/* Main Content Card */}
                <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg">
                  {/* Verification Icon */}
                  <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Verified</h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Unlock higher transaction limits and build customer trust
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-base">Business registration verified</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-base">Identity documents approved</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-base">Bank account linked</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status Card */}
                <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 text-base font-medium">Verification Status</p>
                      <p className="text-gray-500 text-sm mt-1">Level 2 Verified Business</p>
                    </div>
                    <div className="bg-orange-500 rounded-lg px-4 py-2 flex items-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-medium">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button className="w-full text-lg font-medium text-white shadow-lg px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-500 rounded-xl hover:from-blue-900 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]">
                  Continue to Dashboard
                </button>
              </div>

              {/* Right Side - Hero Content */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-lg">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-12 text-center">
                    <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-20 h-20 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Verification Complete</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      Congratulations! Your business is now fully verified and ready to accept payments with higher
                      limits and increased customer trust.
                    </p>
                    <div className="grid grid-cols-1 gap-4 text-center">
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="text-3xl font-bold text-orange-600 mb-2">Level 2</div>
                        <div className="text-sm text-gray-600">Verification Level</div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="text-3xl font-bold text-green-600 mb-2">₵50K</div>
                        <div className="text-sm text-gray-600">Daily Limit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GetVerified;
