"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon, UserPlusIcon, QrCodeIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import BackArrow from "~~/components/BackArrow";
import { useUser } from '@clerk/nextjs';
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useWalletUser } from '~~/hooks/useWalletUser';
import { useNFC } from '~~/hooks/useNFC';
import QRScanner from '~~/components/QRScanner';
import { p2pService, P2PTransfer } from '~~/services/p2pService';
import { qrService } from '~~/services/qrService';
import { parseUnits } from 'viem';

const SendMoney = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { walletAddress, isWalletLinked } = useWalletUser();
  
  const [selectedAmount, setSelectedAmount] = useState("₵50");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [transferComplete, setTransferComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  // Get user's bUSDC balance
  const { data: busdcBalance } = useScaffoldReadContract({
    contractName: "bUSDC",
    functionName: "balanceOf",
    args: [walletAddress],
  });

  // Smart contract integration
  const { writeContractAsync: writeBusdcAsync } = useScaffoldWriteContract({
    contractName: "bUSDC"
  });

  // NFC functionality
  const { 
    isSupported: nfcSupported, 
    isReading, 
    startReading, 
    stopReading, 
    writeMessage,
    error: nfcError 
  } = useNFC({
    onPaymentRequest: (data) => {
      const transferData = p2pService.parseNFCTransferData(data);
      if (transferData && p2pService.isNFCTransferDataFresh(transferData)) {
        setRecipientAddress(transferData.senderAddress);
        setSelectedAmount(`₵${transferData.amountGHS}`);
        setMessage(transferData.message);
      }
    }
  });

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const userContacts = await p2pService.getContacts();
        setContacts(userContacts);
      } catch (err) {
        console.error('Error loading contacts:', err);
      }
    };

    if (isLoaded && isWalletLinked) {
      loadContacts();
    }
  }, [isLoaded, isWalletLinked]);

  const handleTransfer = async () => {
    if (!recipientAddress || !selectedAmount) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(selectedAmount.replace('₵', ''));
      const amountWei = parseUnits(amount.toString(), 6); // bUSDC has 6 decimals

      // Check balance
      if (busdcBalance && busdcBalance < amountWei) {
        throw new Error("Insufficient balance");
      }

      // Execute transfer
      await writeBusdcAsync({
        functionName: "transfer",
        args: [recipientAddress, amountWei],
      });

      // Create transfer record
      const transfer: P2PTransfer = {
        id: Date.now().toString(),
        fromAddress: walletAddress,
        toAddress: recipientAddress,
        amount: amount,
        amountWei: amountWei.toString(),
        message: message,
        timestamp: Date.now(),
        status: 'completed',
        type: 'send'
      };

      // Save to local storage
      await p2pService.saveTransfer(transfer);

      // Add to contacts if not exists
      await p2pService.addContact({
        address: recipientAddress,
        name: recipientName || `Contact ${recipientAddress.slice(0, 6)}...`,
        lastTransaction: Date.now()
      });

      setTransferComplete(true);
    } catch (err: any) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = qrService.parsePaymentQR(data);
      if (qrData.type === 'payment_request') {
        setRecipientAddress(qrData.recipientAddress);
        setSelectedAmount(`₵${qrData.amountGHS}`);
        setMessage(qrData.message || "");
      }
      setShowScanner(false);
    } catch (err) {
      setError("Invalid QR code");
      setShowScanner(false);
    }
  };

  const handleContactSelect = (contact: any) => {
    setRecipientAddress(contact.address);
    setRecipientName(contact.name);
    setShowContacts(false);
  };

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

  const quickAmounts = ["₵10", "₵25", "₵50"];

  return (
    <>
      {/* Mobile and Tablet Layout (sm and md screens) */}
      <div className="lg:hidden min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <BackArrow />

          <h1 className="text-lg font-semibold text-gray-900">Send Money</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Enter Amount Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Enter Amount</h3>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">{selectedAmount}.00</div>
              <p className="text-gray-500 text-sm">≈ $3.07 USDC</p>
            </div>
            <div className="flex space-x-3">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                    selectedAmount === amount ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Ready to Send Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl font-bold">↑</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Send</h2>
            <p className="text-gray-600 text-sm mb-6">Hold phones together to transfer</p>

            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold text-sm">You</span>
                </div>
                <p className="text-xs text-gray-600">Sender</p>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold text-sm">K</span>
                </div>
                <p className="text-xs text-gray-600">Kwame</p>
              </div>
            </div>
          </div>

          {/* Transfer Complete Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transfer Complete</h3>
                <p className="text-gray-600 text-sm">Kwame received {selectedAmount}.00</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full text-lg font-medium text-white shadow-lg border px-3 py-4  bg-linear-99 bg-gradient-to-r from-blue-800 to-blue-500  rounded-2xl"
          >
            Send Another
          </button>
        </div>
      </div>

      {/* Desktop Layout (lg screens and above) */}
      <div className="hidden lg:block min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <BackArrow />

          <h1 className="text-2xl font-semibold text-gray-900">Send Money</h1>
          <div className="w-10"></div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8 py-12">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side - Amount Selection */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Enter Amount</h3>
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-gray-900 mb-4">{selectedAmount}.00</div>
                    <p className="text-gray-500 text-xl">≈ $3.07 USDC</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {quickAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-4 px-6 rounded-2xl text-lg font-medium transition-colors ${
                          selectedAmount === amount
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Status */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Transfer Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold">{selectedAmount}.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Recipient</span>
                      <span className="font-semibold">Kwame</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="text-green-600 font-semibold">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Transfer Interface */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-white text-4xl font-bold">↑</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Send</h2>
                  <p className="text-gray-600 text-lg mb-8">Hold phones together to transfer</p>

                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 font-bold text-lg">You</span>
                      </div>
                      <p className="text-gray-600">Sender</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-green-600 font-bold text-lg">K</span>
                      </div>
                      <p className="text-gray-600">Kwame</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Complete */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Transfer Complete</h3>
                      <p className="text-gray-600 text-lg">Kwame received {selectedAmount}.00</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full text-lg font-medium text-white shadow-lg border px-3 py-4  bg-linear-99 bg-gradient-to-r from-blue-800 to-blue-500  rounded-2xl"
                >
                  Send Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QRScanner onScan={handleQRScan} />
          </div>
        </div>
      )}

      {/* Contacts Modal */}
      {showContacts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Contact</h3>
              <button
                onClick={() => setShowContacts(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <button
                    key={contact.address}
                    onClick={() => handleContactSelect(contact)}
                    className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No contacts found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendMoney;
