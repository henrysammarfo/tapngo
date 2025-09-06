import { createPublicClient, http, parseAbi, keccak256, toHex } from 'viem';
import { baseSepolia, sepolia } from 'viem/chains';

// ENS Registry and Resolver addresses on Sepolia (ENS is on Ethereum Sepolia, not Base Sepolia)
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

// Use Sepolia for ENS lookups since ENS is on Ethereum, not Base
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// Also create a Base Sepolia client for our contracts
const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export class ENSService {
  /**
   * Resolve ENS name to address
   */
  static async resolveName(ensName: string): Promise<string | null> {
    try {
      const namehash = this.namehash(ensName);
      
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi([
          'function resolver(bytes32 node) view returns (address)'
        ]),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const address = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi([
          'function addr(bytes32 node) view returns (address)'
        ]),
        functionName: 'addr',
        args: [namehash]
      });

      return address && address !== '0x0000000000000000000000000000000000000000' ? address : null;
    } catch (error) {
      console.error('ENS resolution error:', error);
      return null;
    }
  }

  /**
   * Get reverse ENS name for an address
   */
  static async reverseResolve(address: string): Promise<string | null> {
    try {
      const reverseName = `${address.slice(2).toLowerCase()}.addr.reverse`;
      const namehash = this.namehash(reverseName);
      
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi([
          'function resolver(bytes32 node) view returns (address)'
        ]),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const name = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi([
          'function name(bytes32 node) view returns (string)'
        ]),
        functionName: 'name',
        args: [namehash]
      });

      return name || null;
    } catch (error) {
      console.error('Reverse ENS resolution error:', error);
      return null;
    }
  }

  /**
   * Get text record from ENS
   */
  static async getTextRecord(ensName: string, key: string): Promise<string | null> {
    try {
      const namehash = this.namehash(ensName);
      
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi([
          'function resolver(bytes32 node) view returns (address)'
        ]),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      const text = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi([
          'function text(bytes32 node, string key) view returns (string)'
        ]),
        functionName: 'text',
        args: [namehash, key]
      });

      return text || null;
    } catch (error) {
      console.error('ENS text record error:', error);
      return null;
    }
  }

  /**
   * Check if ENS name is a vendor subname
   */
  static isVendorSubname(ensName: string): boolean {
    return ensName.endsWith('.tapngo.eth');
  }

  /**
   * Extract vendor name from subname
   */
  static extractVendorName(ensName: string): string | null {
    if (!this.isVendorSubname(ensName)) {
      return null;
    }
    
    const parts = ensName.split('.');
    if (parts.length >= 2) {
      return parts[0];
    }
    
    return null;
  }

  /**
   * Generate namehash for ENS name
   */
  private static namehash(name: string): `0x${string}` {
    if (!name) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    const labels = name.split('.');
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    for (let i = labels.length - 1; i >= 0; i--) {
      const label = labels[i];
      const labelHash = keccak256(toHex(label));
      // Properly concatenate the node and label hash
      const combined = node.slice(2) + labelHash.slice(2);
      node = keccak256('0x' + combined);
    }
    
    return node as `0x${string}`;
  }
}
