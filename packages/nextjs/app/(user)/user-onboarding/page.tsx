"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

const userOnBoarding = () => {
  const router = useRouter();

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="">
        <ChevronLeftIcon width={24} height={24} color="black" onClick={() => router.back()} />
      </div>{" "}
      <div className="lg:hidden">
        <div className="flex flex-col gap-3">
          <div className="">
            <h1 className="font-bold text-2xl text-center">Create Your Account</h1>
            <p className=" text-center">Join Ghana's fastest growing payment network</p>
          </div>

          <div className="shadow-lg bg-white rounded-xl px-3 py-4 h-30 ">
            <label className="text-sm" htmlFor="phone">
              Phone Number
            </label>
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <span className="bg-gray-100 border-r-2 border-gray-200 p-3">+233</span>
              <div className="px-3">
                <input
                  className="py-3 border-0 focus:ring-0 focus:outline-none"
                  type="text"
                  name="phone"
                  id="phone"
                  placeholder="24 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shadow-lg bg-white rounded-xl h-30 px-3 py-4 ">
            <label className="text-sm" htmlFor="">
              Create PIN
            </label>
            <input
              type="text"
              name=""
              id=""
              className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 shadow-lg  bg-white rounded-xl px-3 py-4 h-30 ">
            <label className="text-sm" htmlFor="bname">
              Business Name
            </label>
            <input
              className="placeholder:font-medium border-2 border-gray-200 rounded-xl px-3 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              type="text"
              name=""
              id="bname"
              placeholder="Ama's Waakye Spot"
            />
          </div>

          <div className="shadow-lg bg-white rounded-xl px-3 py-4">
            <label className="text-sm" htmlFor="">
              Claim Your Subname
            </label>
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <div className="px-3 py-2">
                <input className="placeholder:font-medium border-0 focus:ring-0 focus:outline-none" type="text" name="" id="" placeholder="ama-waakye" />
              </div>
              <span className="border-l-2 border-gray-200 text-gray-400 font-medium p-2 bg-gray-100">.tapn</span>
            </div>

            <span className="text-xs text-gray-400  font-medium">
              <p>Customer can send payments to ama-waakye.tapngo.eth</p>
            </span>
          </div>

          <button
            type="button"
            className="text-lg font-medium text-white shadow-lg border px-3 py-4  bg-linear-99 bg-gradient-to-r from-blue-800 to-blue-500  rounded-2xl"
          >
            Continue
          </button>
        </div>
      </div>
      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Form */}
            <div className="w-full max-w-lg mx-auto lg:mx-0">
              {/* Header Section */}
              <div className="text-left mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Account</h1>
                <p className="text-lg text-gray-600">Join Ghana's fastest growing payment network</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Phone Number */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone-lg">
                    Phone Number
                  </label>
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <span className="bg-gray-100 border-r-2 border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 flex items-center">
                      +233
                    </span>
                    <input
                      className="flex-1 px-4 py-3 text-base border-0 focus:ring-0 focus:outline-none"
                      type="tel"
                      name="phone-lg"
                      id="phone-lg"
                      placeholder="24 123 4567"
                    />
                  </div>
                </div>

                {/* Create PIN */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="pin-lg">
                    Create PIN
                  </label>
                  <input
                    type="password"
                    name="pin-lg"
                    id="pin-lg"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter 4-digit PIN"
                  />
                </div>

                {/* Business Name */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bname-lg">
                    Business Name
                  </label>
                  <input
                    className="w-full placeholder:font-medium border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    type="text"
                    name="bname-lg"
                    id="bname-lg"
                    placeholder="Ama's Waakye Spot"
                  />
                </div>

                {/* Claim Subname */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="subname-lg">
                    Claim Your Subname
                  </label>
                  <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                    <input
                      className="flex-1 px-4 py-3 text-base border-0 focus:ring-0 focus:outline-none placeholder:font-medium"
                      type="text"
                      name="subname-lg"
                      id="subname-lg"
                      placeholder="ama-waakye"
                    />
                    <span className="border-l-2 border-gray-200 text-gray-400 font-medium px-4 py-3 bg-gray-100 flex items-center text-base">
                      .tapn
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Customer can send payments to ama-waakye.tapngo.eth</p>
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  className="w-full text-lg font-medium text-white shadow-lg px-6 py-4 bg-gradient-to-r from-blue-800 to-blue-500 rounded-xl hover:from-blue-900 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Placeholder for hero image - you can replace this with an actual image */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-12 text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to PayNGo</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Join thousands of businesses already using PayNGo to accept payments quickly and securely across
                    Ghana.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">10K+</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">₵2M+</div>
                      <div className="text-sm text-gray-600">Transactions</div>
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

export default userOnBoarding;
