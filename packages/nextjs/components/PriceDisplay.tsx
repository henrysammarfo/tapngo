"use client";

import React from 'react';
import { usePricing, usePriceDisplay } from '~~/hooks/usePricing';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/20/solid';

interface PriceDisplayProps {
  ghsAmount: number;
  showRate?: boolean;
  showTimestamp?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  ghsAmount,
  showRate = true,
  showTimestamp = false,
  className = "",
  size = 'md'
}) => {
  const { ghsFormatted, usdcFormatted, rate, isStale } = usePriceDisplay(ghsAmount);
  const { refreshRate, loading, error } = usePricing();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Main price display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-gray-900 dark:text-white font-semibold">
            {ghsFormatted}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            ≈ {usdcFormatted}
          </div>
        </div>
        
        {/* Refresh button */}
        <button
          onClick={refreshRate}
          disabled={loading}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          title="Refresh exchange rate"
        >
          <ArrowPathIcon 
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Rate information */}
      {showRate && rate && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <span>Rate: ₵{rate.rate.toFixed(2)} per USDC</span>
            <span className="text-gray-400">•</span>
            <span className="capitalize">{rate.source}</span>
          </div>
          
          {/* Rate status indicator */}
          <div className="flex items-center space-x-1">
            {isStale ? (
              <>
                <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
                <span>Stale</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-3 h-3 text-green-500" />
                <span>Live</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      {showTimestamp && rate && (
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <ClockIcon className="w-3 h-3" />
          <span>Updated {formatTimestamp(rate.timestamp)}</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-500">
          <ExclamationTriangleIcon className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Price converter component
interface PriceConverterProps {
  initialGhsAmount?: number;
  onAmountChange?: (ghsAmount: number, usdcAmount: number) => void;
  className?: string;
}

export const PriceConverter: React.FC<PriceConverterProps> = ({
  initialGhsAmount = 0,
  onAmountChange,
  className = ""
}) => {
  const { ghsAmount, usdcAmount, updateGhsAmount, updateUsdcAmount, currentRate, loading, error } = usePricing();

  React.useEffect(() => {
    if (initialGhsAmount > 0) {
      updateGhsAmount(initialGhsAmount);
    }
  }, [initialGhsAmount, updateGhsAmount]);

  React.useEffect(() => {
    onAmountChange?.(ghsAmount, usdcAmount);
  }, [ghsAmount, usdcAmount, onAmountChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* GHS Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ghana Cedi (GHS)
        </label>
        <div className="relative">
          <input
            type="number"
            value={ghsAmount || ''}
            onChange={(e) => updateGhsAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            ₵
          </div>
        </div>
      </div>

      {/* Conversion arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>

      {/* USDC Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          USD Coin (USDC)
        </label>
        <div className="relative">
          <input
            type="number"
            value={usdcAmount || ''}
            onChange={(e) => updateUsdcAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            $
          </div>
        </div>
      </div>

      {/* Rate information */}
      {currentRate && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <span>Rate: ₵{currentRate.rate.toFixed(2)} per USDC</span>
          {loading && <span className="ml-2">(Updating...)</span>}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-center text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

// Price ticker component for displaying current rates
interface PriceTickerProps {
  className?: string;
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ className = "" }) => {
  const { currentRate, loading, error, refreshRate } = usePricing();

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg ${className}`}>
        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-600 dark:text-red-400">Failed to load exchange rate</span>
      </div>
    );
  }

  if (!currentRate) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading exchange rate...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">GHS/USDC:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
            ₵{currentRate.rate.toFixed(2)}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentRate.source}
        </div>
      </div>
      
      <button
        onClick={refreshRate}
        disabled={loading}
        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full transition-colors disabled:opacity-50"
      >
        <ArrowPathIcon 
          className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${loading ? 'animate-spin' : ''}`} 
        />
      </button>
    </div>
  );
};

export default PriceDisplay;
