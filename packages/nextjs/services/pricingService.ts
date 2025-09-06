// Pricing Service for real-time currency conversion and price updates
// This service handles GHS to USDC conversion and real-time price feeds

export interface PriceData {
  currency: string;
  price: number;
  timestamp: number;
  source: string;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  source: string;
}

export interface PricingConfig {
  baseCurrency: string;
  targetCurrency: string;
  updateInterval: number; // in milliseconds
  fallbackRate: number;
  sources: string[];
}

class PricingService {
  private config: PricingConfig = {
    baseCurrency: 'GHS',
    targetCurrency: 'USDC',
    updateInterval: 30000, // 30 seconds
    fallbackRate: 16.3, // Fallback GHS to USDC rate
    sources: ['coingecko', 'binance', 'coinbase']
  };

  private currentRate: ConversionRate | null = null;
  private priceHistory: PriceData[] = [];
  private updateTimer: NodeJS.Timeout | null = null;
  private subscribers: ((rate: ConversionRate) => void)[] = [];

  constructor() {
    this.initializePricing();
  }

  // Initialize pricing system
  private async initializePricing() {
    try {
      await this.updateConversionRate();
      this.startPeriodicUpdates();
    } catch (error) {
      console.error('Failed to initialize pricing:', error);
      this.setFallbackRate();
    }
  }

  // Start periodic price updates
  private startPeriodicUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(async () => {
      try {
        await this.updateConversionRate();
      } catch (error) {
        console.error('Failed to update conversion rate:', error);
      }
    }, this.config.updateInterval);
  }

  // Update conversion rate from multiple sources
  private async updateConversionRate(): Promise<void> {
    const rates: ConversionRate[] = [];

    // Try multiple sources for better reliability
    for (const source of this.config.sources) {
      try {
        const rate = await this.fetchRateFromSource(source);
        if (rate) {
          rates.push(rate);
        }
      } catch (error) {
        console.warn(`Failed to fetch rate from ${source}:`, error);
      }
    }

    if (rates.length > 0) {
      // Use the most recent rate or average if multiple sources
      const latestRate = rates.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest
      );
      
      this.currentRate = latestRate;
      this.notifySubscribers(latestRate);
    } else {
      // Fallback to cached rate or default
      this.setFallbackRate();
    }
  }

  // Fetch rate from specific source
  private async fetchRateFromSource(source: string): Promise<ConversionRate | null> {
    switch (source) {
      case 'coingecko':
        return await this.fetchFromCoinGecko();
      case 'binance':
        return await this.fetchFromBinance();
      case 'coinbase':
        return await this.fetchFromCoinbase();
      default:
        return null;
    }
  }

  // Fetch from CoinGecko API
  private async fetchFromCoinGecko(): Promise<ConversionRate | null> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ghs'
      );
      
      if (!response.ok) throw new Error('CoinGecko API error');
      
      const data = await response.json();
      const rate = data['usd-coin']?.ghs;
      
      if (rate) {
        return {
          from: 'USDC',
          to: 'GHS',
          rate: rate,
          timestamp: Date.now(),
          source: 'coingecko'
        };
      }
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
    }
    return null;
  }

  // Fetch from Binance API
  private async fetchFromBinance(): Promise<ConversionRate | null> {
    try {
      // First get USDC/USDT rate
      const usdcResponse = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=USDCUSDT'
      );
      
      if (!usdcResponse.ok) throw new Error('Binance USDC API error');
      
      const usdcData = await usdcResponse.json();
      const usdcToUsdt = parseFloat(usdcData.price);
      
      // Then get USDT/GHS rate (if available) or use USD/GHS
      const ghsResponse = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=USDTGHS'
      );
      
      if (!ghsResponse.ok) {
        // Fallback to USD rate
        const usdResponse = await fetch(
          'https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD'
        );
        if (!usdResponse.ok) throw new Error('Binance USD API error');
        
        const usdData = await usdResponse.json();
        const usdtToUsd = parseFloat(usdData.price);
        
        // Use approximate GHS/USD rate (this would need to be updated with real data)
        const ghsToUsd = 0.061; // Approximate rate
        const rate = usdcToUsdt * usdtToUsd / ghsToUsd;
        
        return {
          from: 'USDC',
          to: 'GHS',
          rate: rate,
          timestamp: Date.now(),
          source: 'binance'
        };
      }
      
      const ghsData = await ghsResponse.json();
      const usdtToGhs = parseFloat(ghsData.price);
      const rate = usdcToUsdt * usdtToGhs;
      
      return {
        from: 'USDC',
        to: 'GHS',
        rate: rate,
        timestamp: Date.now(),
        source: 'binance'
      };
    } catch (error) {
      console.error('Binance fetch error:', error);
    }
    return null;
  }

  // Fetch from Coinbase API
  private async fetchFromCoinbase(): Promise<ConversionRate | null> {
    try {
      const response = await fetch(
        'https://api.coinbase.com/v2/exchange-rates?currency=USDC'
      );
      
      if (!response.ok) throw new Error('Coinbase API error');
      
      const data = await response.json();
      const rate = data.data?.rates?.GHS;
      
      if (rate) {
        return {
          from: 'USDC',
          to: 'GHS',
          rate: parseFloat(rate),
          timestamp: Date.now(),
          source: 'coinbase'
        };
      }
    } catch (error) {
      console.error('Coinbase fetch error:', error);
    }
    return null;
  }

  // Set fallback rate
  private setFallbackRate() {
    this.currentRate = {
      from: 'USDC',
      to: 'GHS',
      rate: this.config.fallbackRate,
      timestamp: Date.now(),
      source: 'fallback'
    };
    this.notifySubscribers(this.currentRate);
  }

  // Notify subscribers of rate changes
  private notifySubscribers(rate: ConversionRate) {
    this.subscribers.forEach(callback => {
      try {
        callback(rate);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Public methods

  // Get current conversion rate
  getCurrentRate(): ConversionRate | null {
    return this.currentRate;
  }

  // Convert amount from GHS to USDC
  convertGhsToUsdc(ghsAmount: number): number {
    if (!this.currentRate) {
      return ghsAmount / this.config.fallbackRate;
    }
    return ghsAmount / this.currentRate.rate;
  }

  // Convert amount from USDC to GHS
  convertUsdcToGhs(usdcAmount: number): number {
    if (!this.currentRate) {
      return usdcAmount * this.config.fallbackRate;
    }
    return usdcAmount * this.currentRate.rate;
  }

  // Subscribe to rate updates
  subscribe(callback: (rate: ConversionRate) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Force update conversion rate
  async forceUpdate(): Promise<void> {
    await this.updateConversionRate();
  }

  // Get price history
  getPriceHistory(): PriceData[] {
    return [...this.priceHistory];
  }

  // Update configuration
  updateConfig(newConfig: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.updateInterval) {
      this.startPeriodicUpdates();
    }
  }

  // Get configuration
  getConfig(): PricingConfig {
    return { ...this.config };
  }

  // Cleanup
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    this.subscribers = [];
  }

  // Utility methods for formatting
  formatPrice(amount: number, currency: string, decimals: number = 2): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(amount);
  }

  formatGhsPrice(amount: number): string {
    return `₵${amount.toFixed(2)}`;
  }

  formatUsdcPrice(amount: number): string {
    return `$${amount.toFixed(2)} USDC`;
  }

  // Get rate age in minutes
  getRateAge(): number {
    if (!this.currentRate) return 0;
    return (Date.now() - this.currentRate.timestamp) / (1000 * 60);
  }

  // Check if rate is stale
  isRateStale(maxAgeMinutes: number = 5): boolean {
    return this.getRateAge() > maxAgeMinutes;
  }
}

// Create and export singleton instance
export const pricingService = new PricingService();

// Export types
export type { PriceData, ConversionRate, PricingConfig };
