import { createPublicClient, http, parseAbi, keccak256, toHex } from 'viem';
import { sepolia } from 'viem/chains';

// Official ENS Registry and Resolver addresses on Sepolia
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_PUBLIC_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

// Create Sepolia client for ENS lookups
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface ENSProfile {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  url?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  telegram?: string;
}

export class RealENSService {
  /**
   * Generate namehash for ENS domain (official ENS algorithm)
   */
  static namehash(name: string): `0x${string}` {
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

  /**
   * Resolve ENS name to address
   */
  static async resolveName(ensName: string): Promise<string | null> {
    try {
      const namehash = this.namehash(ensName);
      
      // Get resolver
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function resolver(bytes32 node) view returns (address)']),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get address
      const address = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function addr(bytes32 node) view returns (address)']),
        functionName: 'addr',
        args: [namehash]
      });

      return address || null;
    } catch (error) {
      console.error('Error resolving ENS name:', error);
      return null;
    }
  }

  /**
   * Reverse resolve address to ENS name
   */
  static async reverseResolve(address: string): Promise<string | null> {
    try {
      const reverseName = `${address.slice(2).toLowerCase()}.addr.reverse`;
      const namehash = this.namehash(reverseName);
      
      // Get resolver
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function resolver(bytes32 node) view returns (address)']),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get name
      const name = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function name(bytes32 node) view returns (string)']),
        functionName: 'name',
        args: [namehash]
      });

      return name || null;
    } catch (error) {
      console.error('Error reverse resolving address:', error);
      return null;
    }
  }

  /**
   * Get ENS text record
   */
  static async getTextRecord(ensName: string, key: string): Promise<string | null> {
    try {
      const namehash = this.namehash(ensName);
      
      // Get resolver
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function resolver(bytes32 node) view returns (address)']),
        functionName: 'resolver',
        args: [namehash]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get text record
      const textRecord = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function text(bytes32 node, string key) view returns (string)']),
        functionName: 'text',
        args: [namehash, key]
      });

      return textRecord || null;
    } catch (error) {
      console.error('Error getting ENS text record:', error);
      return null;
    }
  }

  /**
   * Get complete ENS profile with all text records
   */
  static async getENSProfile(ensName: string): Promise<ENSProfile | null> {
    try {
      // Resolve ENS name to address
      const address = await this.resolveName(ensName);
      if (!address) return null;

      // Get all text records in parallel
      const [avatar, description, url, twitter, github, discord, telegram] = await Promise.all([
        this.getTextRecord(ensName, 'avatar'),
        this.getTextRecord(ensName, 'description'),
        this.getTextRecord(ensName, 'url'),
        this.getTextRecord(ensName, 'com.twitter'),
        this.getTextRecord(ensName, 'com.github'),
        this.getTextRecord(ensName, 'com.discord'),
        this.getTextRecord(ensName, 'org.telegram')
      ]);

      return {
        name: ensName,
        address,
        avatar: avatar || undefined,
        description: description || undefined,
        url: url || undefined,
        twitter: twitter || undefined,
        github: github || undefined,
        discord: discord || undefined,
        telegram: telegram || undefined
      };
    } catch (error) {
      console.error('Error getting ENS profile:', error);
      return null;
    }
  }

  /**
   * Check if ENS name is available for registration
   */
  static async isNameAvailable(ensName: string): Promise<boolean> {
    try {
      const namehash = this.namehash(ensName);
      
      // Check if name is registered
      const owner = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function owner(bytes32 node) view returns (address)']),
        functionName: 'owner',
        args: [namehash]
      });

      return owner === '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('Error checking name availability:', error);
      return false;
    }
  }

  /**
   * Get owner of ENS name
   */
  static async getOwner(ensName: string): Promise<string | null> {
    try {
      const namehash = this.namehash(ensName);
      
      const owner = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function owner(bytes32 node) view returns (address)']),
        functionName: 'owner',
        args: [namehash]
      });

      return owner || null;
    } catch (error) {
      console.error('Error getting ENS owner:', error);
      return null;
    }
  }

  /**
   * Search for ENS names (limited functionality without indexing)
   */
  static async searchENS(query: string): Promise<string[]> {
    // This is a simplified search - in production you'd use an ENS indexer
    const commonNames = [
      'vitalik.eth',
      'ens.eth',
      'alice.eth',
      'bob.eth',
      'charlie.eth',
      'dave.eth',
      'eve.eth'
    ];

    return commonNames.filter(name => 
      name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
