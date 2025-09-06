import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/wagmi';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export interface VendorProfile {
  address: string;
  businessName: string;
  phoneNumber: string;
  ensName: string;
  isActive: boolean;
  registrationDate: number;
}

export class VendorRegistryService {
  /**
   * Check if an address is a registered vendor
   */
  static async isVendor(address: string): Promise<boolean> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: parseAbi([
          'function isVendor(address vendorAddress) view returns (bool)'
        ]),
        functionName: 'isVendor',
        args: [address as `0x${string}`]
      });
      return result;
    } catch (error) {
      console.error('Vendor check error:', error);
      return false;
    }
  }

  /**
   * Check if a vendor is active
   */
  static async isActiveVendor(address: string): Promise<boolean> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: parseAbi([
          'function isActiveVendor(address vendorAddress) view returns (bool)'
        ]),
        functionName: 'isActiveVendor',
        args: [address as `0x${string}`]
      });
      return result;
    } catch (error) {
      console.error('Active vendor check error:', error);
      return false;
    }
  }

  /**
   * Get vendor profile
   */
  static async getVendorProfile(address: string): Promise<VendorProfile | null> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: parseAbi([
          'function getVendorProfile(address vendorAddress) view returns (tuple(string businessName, string phoneNumber, string ensName, bool isActive, uint256 registrationDate))'
        ]),
        functionName: 'getVendorProfile',
        args: [address as `0x${string}`]
      });

      return {
        address,
        businessName: result.businessName,
        phoneNumber: result.phoneNumber,
        ensName: result.ensName,
        isActive: result.isActive,
        registrationDate: Number(result.registrationDate)
      };
    } catch (error) {
      console.error('Get vendor profile error:', error);
      return null;
    }
  }

  /**
   * Get all vendors (this would require a custom contract function)
   * For now, we'll return an empty array since the contract doesn't have this function
   */
  static async getAllVendors(): Promise<VendorProfile[]> {
    try {
      // In a real implementation, this would require a contract function to list all vendors
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Get all vendors error:', error);
      return [];
    }
  }

  /**
   * Register as a vendor
   */
  static async registerVendor(
    businessName: string,
    phoneNumber: string,
    ensName: string
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Vendor registration error:', error);
      throw error;
    }
  }

  /**
   * Update vendor profile
   */
  static async updateVendorProfile(
    businessName: string,
    phoneNumber: string,
    ensName: string
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Update vendor profile error:', error);
      throw error;
    }
  }

  /**
   * Deactivate vendor (admin only)
   */
  static async deactivateVendor(vendorAddress: string): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Deactivate vendor error:', error);
      throw error;
    }
  }

  /**
   * Get vendor count
   */
  static async getVendorCount(): Promise<number> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.VendorRegistry as `0x${string}`,
        abi: parseAbi([
          'function getVendorCount() view returns (uint256)'
        ]),
        functionName: 'getVendorCount'
      });
      return Number(result);
    } catch (error) {
      console.error('Get vendor count error:', error);
      return 0;
    }
  }
}
