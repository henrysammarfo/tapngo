import { createPublicClient, http, parseAbi, keccak256, toHex, encodeFunctionData } from 'viem';
import { baseSepolia, sepolia } from 'viem/chains';
import { useWriteContract, useReadContract } from 'wagmi';

// ENS Registry and Resolver addresses on Sepolia
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_RESOLVER = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';

// Use Sepolia for ENS lookups since ENS is on Ethereum, not Base
const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// Base Sepolia client for our contracts
const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export interface ENSProfile {
  name: string;
  bio: string;
  avatar: string;
  website: string;
  twitter: string;
  github: string;
  address: string;
  ensName: string;
}

export class ENSProfileService {
  /**
   * Generate namehash for ENS domain
   */
  static namehash(name: string): string {
    if (!name) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    const parts = name.split('.');
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const label = keccak256(toHex(parts[i]));
      // Properly concatenate the node and label hash
      const combined = node.slice(2) + label.slice(2);
      node = keccak256('0x' + combined);
    }
    
    return node;
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
        args: [namehash as `0x${string}`]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get text record
      const textRecord = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function text(bytes32 node, string key) view returns (string)']),
        functionName: 'text',
        args: [namehash as `0x${string}`, key]
      });

      return textRecord || null;
    } catch (error) {
      console.error('Error getting ENS text record:', error);
      return null;
    }
  }

  /**
   * Set ENS text record (requires transaction)
   */
  static async setTextRecord(ensName: string, key: string, value: string): Promise<string> {
    try {
      const namehash = this.namehash(ensName);
      
      // Get resolver
      const resolver = await sepoliaClient.readContract({
        address: ENS_REGISTRY as `0x${string}`,
        abi: parseAbi(['function resolver(bytes32 node) view returns (address)']),
        functionName: 'resolver',
        args: [namehash as `0x${string}`]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        throw new Error('No resolver found for this ENS name');
      }

      // Encode the setText function call
      const setTextData = encodeFunctionData({
        abi: parseAbi(['function setText(bytes32 node, string key, string value)']),
        functionName: 'setText',
        args: [namehash as `0x${string}`, key, value]
      });

      return setTextData;
    } catch (error) {
      console.error('Error setting ENS text record:', error);
      throw error;
    }
  }

  /**
   * Get complete ENS profile
   */
  static async getENSProfile(ensName: string): Promise<ENSProfile | null> {
    try {
      // Resolve ENS name to address
      const address = await this.resolveName(ensName);
      if (!address) return null;

      // Get all text records
      const [name, bio, avatar, website, twitter, github] = await Promise.all([
        this.getTextRecord(ensName, 'name'),
        this.getTextRecord(ensName, 'description'),
        this.getTextRecord(ensName, 'avatar'),
        this.getTextRecord(ensName, 'url'),
        this.getTextRecord(ensName, 'com.twitter'),
        this.getTextRecord(ensName, 'com.github')
      ]);

      return {
        name: name || ensName.split('.')[0],
        bio: bio || '',
        avatar: avatar || '',
        website: website || '',
        twitter: twitter || '',
        github: github || '',
        address,
        ensName
      };
    } catch (error) {
      console.error('Error getting ENS profile:', error);
      return null;
    }
  }

  /**
   * Create ENS profile by setting text records
   */
  static async createENSProfile(
    ensName: string,
    profile: {
      name: string;
      bio: string;
      avatar: string;
      website: string;
      twitter: string;
      github: string;
    }
  ): Promise<string[]> {
    const textRecords = [
      { key: 'name', value: profile.name },
      { key: 'description', value: profile.bio },
      { key: 'avatar', value: profile.avatar },
      { key: 'url', value: profile.website },
      { key: 'com.twitter', value: profile.twitter },
      { key: 'com.github', value: profile.github }
    ];

    const transactions: string[] = [];
    
    for (const record of textRecords) {
      if (record.value) {
        const txData = await this.setTextRecord(ensName, record.key, record.value);
        transactions.push(txData);
      }
    }

    return transactions;
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
        args: [namehash as `0x${string}`]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get address
      const address = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function addr(bytes32 node) view returns (address)']),
        functionName: 'addr',
        args: [namehash as `0x${string}`]
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
        args: [namehash as `0x${string}`]
      });

      if (!resolver || resolver === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get name
      const name = await sepoliaClient.readContract({
        address: resolver as `0x${string}`,
        abi: parseAbi(['function name(bytes32 node) view returns (string)']),
        functionName: 'name',
        args: [namehash as `0x${string}`]
      });

      return name || null;
    } catch (error) {
      console.error('Error reverse resolving address:', error);
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
        args: [namehash as `0x${string}`]
      });

      return owner === '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('Error checking name availability:', error);
      return false;
    }
  }
}
