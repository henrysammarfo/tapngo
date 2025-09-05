import axios from 'axios';

export class FXService {
  static async getExchangeRate(fromCurrency = 'GHS', toCurrency = 'USD') {
    try {
      // Using a free FX API (you can replace with your preferred provider)
      const response = await axios.get(
        `${process.env.FX_API_URL}/latest`,
        {
          params: {
            base: fromCurrency,
            symbols: toCurrency,
            access_key: process.env.FX_API_KEY
          },
          timeout: 10000
        }
      );

      const rate = response.data.rates[toCurrency];
      
      if (!rate) {
        throw new Error('Exchange rate not found');
      }

      // Convert to 6 decimal places (like USDC)
      const formattedRate = Math.round(rate * 1000000) / 1000000;

      return {
        success: true,
        data: {
          from: fromCurrency,
          to: toCurrency,
          rate: formattedRate,
          timestamp: new Date(),
          source: 'api'
        }
      };
    } catch (error) {
      console.error('❌ FX API error:', error.message);
      
      // Fallback to default rate (1 GHS = 0.1 USD for testing)
      const fallbackRate = 0.1;
      
      return {
        success: false,
        data: {
          from: fromCurrency,
          to: toCurrency,
          rate: fallbackRate,
          timestamp: new Date(),
          source: 'fallback'
        },
        error: error.message
      };
    }
  }

  static async convertAmount(amount, fromCurrency = 'GHS', toCurrency = 'USD') {
    try {
      const rateData = await this.getExchangeRate(fromCurrency, toCurrency);
      const convertedAmount = amount * rateData.data.rate;
      
      return {
        success: true,
        data: {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: Math.round(convertedAmount * 1000000) / 1000000,
          convertedCurrency: toCurrency,
          rate: rateData.data.rate,
          timestamp: rateData.data.timestamp
        }
      };
    } catch (error) {
      console.error('❌ Currency conversion error:', error.message);
      throw new Error('Failed to convert currency');
    }
  }

  static async getSupportedCurrencies() {
    try {
      const response = await axios.get(
        `${process.env.FX_API_URL}/symbols`,
        {
          params: {
            access_key: process.env.FX_API_KEY
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        data: response.data.symbols
      };
    } catch (error) {
      console.error('❌ Supported currencies fetch error:', error.message);
      
      // Return default supported currencies
      return {
        success: false,
        data: {
          'GHS': 'Ghanaian Cedi',
          'USD': 'US Dollar',
          'EUR': 'Euro',
          'GBP': 'British Pound'
        },
        error: error.message
      };
    }
  }
}
