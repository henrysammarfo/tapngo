// ENS Service for Tap&Go Pay
// Implements real ENS resolution and vendor subname management using Sepolia ENS

import { createPublicClient, http, Address, keccak256, namehash } from 'viem';
import { sepolia } from 'viem/chains';

// ENS Registry Contract ABI (simplified)
const ENS_REGISTRY_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'resolver',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Public Resolver ABI (simplified)
const PUBLIC_RESOLVER_ABI = [
  {
    inputs: [{ name: 'node', type: 'bytes32' }],
    name: 'addr',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'name', type: 'string' }
    ],
    name: 'text',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Subname Registrar ABI (for vendor subnames under tapandgo.eth)
const SUBNAME_REGISTRAR_ABI = [
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' }
    ],
    name: 'registerSubname',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'getSubnameOwner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'address', type: 'address' }],
    name: 'getVendorSubname',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Sepolia ENS Contract addresses
const SEPOLIA_ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as Address;
const SEPOLIA_PUBLIC_RESOLVER_ADDRESS = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63' as Address;

// Tap&Go specific addresses (Base Sepolia)
const SUBNAME_REGISTRAR_ADDRESS = '0x75c4D11F142bB29996B11533e6EF9f741c45De7C' as Address;

// Create client for Sepolia ENS resolution
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface ENSResolutionResult {
  address: Address | null;
  resolver: Address | null;
  isVendorSubname: boolean;
  subnameLabel?: string;
}

export interface VendorSubnameInfo {
  ensName: string;
  vendorAddress: Address;
  isVerified: boolean;
  businessName?: string;
}

class ENSService {
  /**
   * Resolve any ENS name to an Ethereum address
   * Works for both external ENS names (alice.eth) and vendor subnames (ama.tapngo.eth)
   * 
   * @param ensName - The ENS name to resolve (e.g., "alice.eth", "ama.tapngo.eth")
   * @returns Promise<ENSResolutionResult>
   */
  async resolveENS(ensName: string): Promise<ENSResolutionResult> {
    try {
      // Normalize the ENS name
      const normalizedName = ensName.toLowerCase().trim();
      
      // Check if it's a vendor subname under tapngo.eth
      if (normalizedName.endsWith('.tapngo.eth')) {
        return await this.resolveVendorSubname(normalizedName);
      }
      
      // For external ENS names, resolve via Sepolia ENS registry
      return await this.resolveExternalENS(normalizedName);
    } catch (error) {
      console.error('ENS resolution error:', error);
      return {
        address: null,
        resolver: null,
        isVendorSubname: false
      };
    }
  }

  /**
   * Resolve external ENS names (e.g., alice.eth, vitalik.eth)
   * Uses Sepolia ENS registry and public resolver
   */
  private async resolveExternalENS(ensName: string): Promise<ENSResolutionResult> {
    try {
      // Calculate namehash for the ENS name
      const node = namehash(ensName);
      
      // Get the resolver for this name
      const resolverAddress = await sepoliaClient.readContract({
        address: SEPOLIA_ENS_REGISTRY_ADDRESS,
        abi: ENS_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node]
      }) as Address;

      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        return {
          address: null,
          resolver: null,
          isVendorSubname: false
        };
      }

      // Get the address from the resolver
      const address = await sepoliaClient.readContract({
        address: resolverAddress,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: 'addr',
        args: [node]
      }) as Address;

      return {
        address: address && address !== '0x0000000000000000000000000000000000000000' ? address : null,
        resolver: resolverAddress,
        isVendorSubname: false
      };
    } catch (error) {
      console.error('External ENS resolution error:', error);
      return {
        address: null,
        resolver: null,
        isVendorSubname: false
      };
    }
  }

  /**
   * Resolve vendor subnames under tapngo.eth
   * Uses our custom SubnameRegistrar contract on Base Sepolia
   */
  private async resolveVendorSubname(ensName: string): Promise<ENSResolutionResult> {
    try {
      // Extract the subname label (e.g., "ama" from "ama.tapngo.eth")
      const subnameLabel = ensName.replace('.tapngo.eth', '');
      
      // For now, return mock data since tapngo.eth is not yet owned on Sepolia
      // TODO: Replace with real contract call when tapngo.eth is owned
      if (this.isDevelopmentMode()) {
        return this.getMockVendorSubname(subnameLabel);
      }
      
      // Real implementation (when tapngo.eth is owned on Sepolia):
      // const vendorAddress = await sepoliaClient.readContract({
      //   address: SUBNAME_REGISTRAR_ADDRESS,
      //   abi: SUBNAME_REGISTRAR_ABI,
      //   functionName: 'getSubnameOwner',
      //   args: [subnameLabel]
      // }) as Address;
      
      return {
        address: null,
        resolver: null,
        isVendorSubname: true,
        subnameLabel
      };
    } catch (error) {
      console.error('Vendor subname resolution error:', error);
      return {
        address: null,
        resolver: null,
        isVendorSubname: true
      };
    }
  }

  /**
   * Get vendor subname for a given address
   * Returns the ENS subname if the address is a registered vendor
   */
  async getVendorSubname(address: Address): Promise<string | null> {
    try {
      // For now, return mock data
      if (this.isDevelopmentMode()) {
        return this.getMockVendorSubnameForAddress(address);
      }
      
      // Real implementation (when tapandgo.eth is owned):
      // const subname = await mainnetClient.readContract({
      //   address: SUBNAME_REGISTRAR_ADDRESS,
      //   abi: SUBNAME_REGISTRAR_ABI,
      //   functionName: 'getVendorSubname',
      //   args: [address]
      // });
      // return subname || null;
      
      return null;
    } catch (error) {
      console.error('Get vendor subname error:', error);
      return null;
    }
  }

  /**
   * Register a new vendor subname under tapngo.eth
   * Only works for verified vendors
   */
  async registerVendorSubname(
    label: string, 
    vendorAddress: Address, 
    businessName: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Validate the label
      if (!this.isValidSubnameLabel(label)) {
        return { success: false, error: 'Invalid subname label' };
      }

      // For now, return mock success
      if (this.isDevelopmentMode()) {
        console.log(`Mock: Registered ${label}.tapngo.eth for ${vendorAddress}`);
        return { success: true, txHash: '0x' + '0'.repeat(64) };
      }
      
      // Real implementation (when tapngo.eth is owned on Sepolia):
      // const txHash = await sepoliaClient.writeContract({
      //   address: SUBNAME_REGISTRAR_ADDRESS,
      //   abi: SUBNAME_REGISTRAR_ABI,
      //   functionName: 'registerSubname',
      //   args: [label, vendorAddress],
      //   account: vendorAddress // This would need to be a transaction
      // });
      // return { success: true, txHash };
      
      return { success: false, error: 'Subname registration not yet available' };
    } catch (error) {
      console.error('Register vendor subname error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Check if an ENS name is available for registration
   * For external ENS: checks Sepolia ENS registry
   * For vendor subnames: checks our SubnameRegistrar
   */
  async isNameAvailable(ensName: string): Promise<boolean> {
    try {
      const normalizedName = ensName.toLowerCase().trim();
      
      if (normalizedName.endsWith('.tapngo.eth')) {
        // Check vendor subname availability
        const subnameLabel = normalizedName.replace('.tapngo.eth', '');
        
        if (this.isDevelopmentMode()) {
          // Mock availability check
          return !this.isMockVendorSubnameTaken(subnameLabel);
        }
        
        // Real implementation:
        // const owner = await sepoliaClient.readContract({
        //   address: SUBNAME_REGISTRAR_ADDRESS,
        //   abi: SUBNAME_REGISTRAR_ABI,
        //   functionName: 'getSubnameOwner',
        //   args: [subnameLabel]
        // });
        // return owner === '0x0000000000000000000000000000000000000000';
        
        return true;
      } else {
        // Check external ENS availability
        const result = await this.resolveExternalENS(normalizedName);
        return result.address === null;
      }
    } catch (error) {
      console.error('Name availability check error:', error);
      return false;
    }
  }

  /**
   * Get ENS text record (e.g., avatar, description)
   */
  async getTextRecord(ensName: string, key: string): Promise<string | null> {
    try {
      const node = namehash(ensName);
      
      const resolverAddress = await sepoliaClient.readContract({
        address: SEPOLIA_ENS_REGISTRY_ADDRESS,
        abi: ENS_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node]
      }) as Address;

      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const textValue = await sepoliaClient.readContract({
        address: resolverAddress,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: 'text',
        args: [node, key]
      });

      return textValue || null;
    } catch (error) {
      console.error('Get text record error:', error);
      return null;
    }
  }

  /**
   * Validate subname label format
   */
  private isValidSubnameLabel(label: string): boolean {
    // Must be 3-63 characters, alphanumeric and hyphens only
    const regex = /^[a-z0-9-]{3,63}$/;
    return regex.test(label) && !label.startsWith('-') && !label.endsWith('-');
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_ENS_MOCK === 'true';
  }

  /**
   * Mock vendor subname data for development
   */
  private getMockVendorSubname(label: string): ENSResolutionResult {
    const mockVendors: Record<string, Address> = {
      'ama': '0x1234567890123456789012345678901234567890' as Address,
      'kwame': '0x2345678901234567890123456789012345678901' as Address,
      'akosua': '0x3456789012345678901234567890123456789012' as Address,
      'demo': '0x4567890123456789012345678901234567890123' as Address
    };

    const address = mockVendors[label];
    return {
      address: address || null,
      resolver: SEPOLIA_PUBLIC_RESOLVER_ADDRESS,
      isVendorSubname: true,
      subnameLabel: label
    };
  }

  /**
   * Mock vendor subname lookup by address
   */
  private getMockVendorSubnameForAddress(address: Address): string | null {
    const mockVendors: Record<Address, string> = {
      '0x1234567890123456789012345678901234567890': 'ama.tapngo.eth',
      '0x2345678901234567890123456789012345678901': 'kwame.tapngo.eth',
      '0x3456789012345678901234567890123456789012': 'akosua.tapngo.eth',
      '0x4567890123456789012345678901234567890123': 'demo.tapngo.eth'
    };

    return mockVendors[address] || null;
  }

  /**
   * Check if a mock vendor subname is taken
   */
  private isMockVendorSubnameTaken(label: string): boolean {
    const mockVendors = ['ama', 'kwame', 'akosua', 'demo'];
    return mockVendors.includes(label);
  }


  /**
   * Get avatar URL from ENS
   */
  async getAvatar(ensName: string): Promise<string | null> {
    return await this.getTextRecord(ensName, 'avatar');
  }

  /**
   * Get description from ENS
   */
  async getDescription(ensName: string): Promise<string | null> {
    return await this.getTextRecord(ensName, 'description');
  }

  /**
   * Validate ENS name format
   */
  validateEnsName(ensName: string): { isValid: boolean; error?: string } {
    const normalizedName = ensName.toLowerCase().trim();
    
    // Check if it's a vendor subname under tapngo.eth
    if (normalizedName.endsWith('.tapngo.eth')) {
      const subnameLabel = normalizedName.replace('.tapngo.eth', '');
      if (!this.isValidSubnameLabel(subnameLabel)) {
        return {
          isValid: false,
          error: 'Invalid subname format. Must be 3-63 characters, alphanumeric and hyphens only'
        };
      }
      return { isValid: true };
    }
    
    // Check if it's a regular ENS name
    if (normalizedName.endsWith('.eth')) {
      const label = normalizedName.replace('.eth', '');
      if (!this.isValidSubnameLabel(label)) {
        return {
          isValid: false,
          error: 'Invalid ENS name format. Must be 3-63 characters, alphanumeric and hyphens only'
        };
      }
      return { isValid: true };
    }
    
    // If no extension, assume it's a subname for tapngo.eth
    if (!normalizedName.includes('.')) {
      if (!this.isValidSubnameLabel(normalizedName)) {
        return {
          isValid: false,
          error: 'Invalid subname format. Must be 3-63 characters, alphanumeric and hyphens only'
        };
      }
      return { isValid: true };
    }
    
    return {
      isValid: false,
      error: 'Invalid ENS name format. Must end with .eth or be a valid subname'
    };
  }
}

// Export singleton instance
export const ensService = new ENSService();

// Export types
export type { ENSResolutionResult, VendorSubnameInfo };