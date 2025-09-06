import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/wagmi';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export class SubnameRegistrarService {
  /**
   * Register a new ENS subname for vendors
   */
  static async registerSubname(subname: string): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Subname registration error:', error);
      throw error;
    }
  }

  /**
   * Register a new ENS subname for regular users
   */
  static async registerUserSubname(subname: string): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('User subname registration error:', error);
      throw error;
    }
  }

  /**
   * Check if a subname is available
   */
  static async isSubnameAvailable(subname: string): Promise<boolean> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.SubnameRegistrar as `0x${string}`,
        abi: parseAbi([
          'function isSubnameRegistered(string memory subname) view returns (bool)'
        ]),
        functionName: 'isSubnameRegistered',
        args: [subname]
      });
      return !result; // Available if not registered
    } catch (error) {
      console.error('Subname availability check error:', error);
      return false;
    }
  }

  /**
   * Get subname owner
   */
  static async getSubnameOwner(subname: string): Promise<string | null> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.SubnameRegistrar as `0x${string}`,
        abi: parseAbi([
          'function getSubnameOwner(string memory subname) view returns (address)'
        ]),
        functionName: 'getSubnameOwner',
        args: [subname]
      });
      return result;
    } catch (error) {
      console.error('Subname owner check error:', error);
      return null;
    }
  }

  /**
   * Get all subnames for an owner
   */
  static async getSubnamesByOwner(owner: string): Promise<string[]> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.SubnameRegistrar as `0x${string}`,
        abi: parseAbi([
          'function getSubnamesByOwner(address owner) view returns (string[] memory)'
        ]),
        functionName: 'getSubnamesByOwner',
        args: [owner as `0x${string}`]
      });
      return result;
    } catch (error) {
      console.error('Get subnames by owner error:', error);
      return [];
    }
  }

  /**
   * Set resolver for a subname
   */
  static async setResolver(
    parentName: string,
    subname: string,
    resolver: string
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Set resolver error:', error);
      throw error;
    }
  }

  /**
   * Set text record for a subname
   */
  static async setTextRecord(
    parentName: string,
    subname: string,
    key: string,
    value: string
  ): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Set text record error:', error);
      throw error;
    }
  }
}
