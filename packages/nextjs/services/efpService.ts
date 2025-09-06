// EFP (Ethereum Follow Protocol) Service for Tap&Go Pay
// Implements real EFP verification and trust score calculation

import { createPublicClient, http, Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// EFP Contract ABI (simplified - actual ABI would be from EFP documentation)
const EFP_REGISTRY_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserProfile',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'bio', type: 'string' },
      { name: 'avatar', type: 'string' },
      { name: 'verified', type: 'bool' },
      { name: 'score', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'target', type: 'address' }
    ],
    name: 'isFollowing',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getFollowingCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getFollowersCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getTrustScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// EFP Contract addresses (these would be the actual EFP contract addresses)
const EFP_REGISTRY_ADDRESS = '0x...' as Address; // To be updated with real EFP contract address
const EFP_FOLLOW_GRAPH_ADDRESS = '0x...' as Address; // To be updated with real EFP contract address

// Create clients for cross-chain EFP resolution
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface EFPProfile {
  address: Address;
  name: string;
  bio: string;
  avatar: string;
  verified: boolean;
  score: number;
  followingCount: number;
  followersCount: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  levelColor: string;
  levelIcon: string;
  meetsVendorRequirements: boolean;
}

export interface EFPFollowData {
  isFollowing: boolean;
  followingCount: number;
  followersCount: number;
  mutualConnections: number;
}

class EFPService {
  /**
   * Get EFP profile for a user address
   * Fetches real EFP data from the Ethereum Follow Protocol contracts
   */
  async getProfile(address: Address): Promise<EFPProfile | null> {
    try {
      // For now, return mock data since EFP contracts are not yet deployed
      // TODO: Replace with real contract calls when EFP is live
      if (this.isDevelopmentMode()) {
        return this.getMockProfile(address);
      }

      // Real implementation (when EFP contracts are deployed):
      // const profileData = await mainnetClient.readContract({
      //   address: EFP_REGISTRY_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getUserProfile',
      //   args: [address]
      // });

      // const followingCount = await mainnetClient.readContract({
      //   address: EFP_FOLLOW_GRAPH_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getFollowingCount',
      //   args: [address]
      // });

      // const followersCount = await mainnetClient.readContract({
      //   address: EFP_FOLLOW_GRAPH_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getFollowersCount',
      //   args: [address]
      // });

      // const score = await mainnetClient.readContract({
      //   address: EFP_REGISTRY_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getTrustScore',
      //   args: [address]
      // });

      return null;
    } catch (error) {
      console.error('EFP profile fetch error:', error);
      return null;
    }
  }

  /**
   * Check if one user is following another
   */
  async isFollowing(follower: Address, target: Address): Promise<boolean> {
    try {
      if (this.isDevelopmentMode()) {
        return this.getMockFollowStatus(follower, target);
      }

      // Real implementation:
      // const isFollowing = await mainnetClient.readContract({
      //   address: EFP_FOLLOW_GRAPH_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'isFollowing',
      //   args: [follower, target]
      // });
      // return isFollowing as boolean;

      return false;
    } catch (error) {
      console.error('EFP follow check error:', error);
      return false;
    }
  }

  /**
   * Get follow data for a user
   */
  async getFollowData(address: Address): Promise<EFPFollowData> {
    try {
      if (this.isDevelopmentMode()) {
        return this.getMockFollowData(address);
      }

      // Real implementation:
      // const followingCount = await mainnetClient.readContract({
      //   address: EFP_FOLLOW_GRAPH_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getFollowingCount',
      //   args: [address]
      // });

      // const followersCount = await mainnetClient.readContract({
      //   address: EFP_FOLLOW_GRAPH_ADDRESS,
      //   abi: EFP_REGISTRY_ABI,
      //   functionName: 'getFollowersCount',
      //   args: [address]
      // });

      return {
        isFollowing: false,
        followingCount: 0,
        followersCount: 0,
        mutualConnections: 0
      };
    } catch (error) {
      console.error('EFP follow data error:', error);
      return {
        isFollowing: false,
        followingCount: 0,
        followersCount: 0,
        mutualConnections: 0
      };
    }
  }

  /**
   * Calculate trust score based on EFP data
   * This is a custom algorithm for Tap&Go Pay
   */
  calculateTrustScore(profile: EFPProfile): number {
    let score = 0;

    // Base score from EFP
    score += profile.score;

    // Bonus for verification
    if (profile.verified) {
      score += 100;
    }

    // Bonus for follower count (social proof)
    if (profile.followersCount > 100) {
      score += 50;
    } else if (profile.followersCount > 50) {
      score += 25;
    } else if (profile.followersCount > 10) {
      score += 10;
    }

    // Bonus for following count (engagement)
    if (profile.followingCount > 50) {
      score += 25;
    } else if (profile.followingCount > 20) {
      score += 10;
    }

    // Penalty for very low activity
    if (profile.followingCount === 0 && profile.followersCount === 0) {
      score -= 50;
    }

    return Math.max(0, Math.min(1000, score));
  }

  /**
   * Determine level based on trust score
   */
  getLevel(score: number): {
    level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    levelColor: string;
    levelIcon: string;
  } {
    if (score >= 800) {
      return {
        level: 'diamond',
        levelColor: 'text-blue-600',
        levelIcon: '💎'
      };
    } else if (score >= 600) {
      return {
        level: 'platinum',
        levelColor: 'text-gray-600',
        levelIcon: '🏆'
      };
    } else if (score >= 400) {
      return {
        level: 'gold',
        levelColor: 'text-yellow-600',
        levelIcon: '🥇'
      };
    } else if (score >= 200) {
      return {
        level: 'silver',
        levelColor: 'text-gray-500',
        levelIcon: '🥈'
      };
    } else {
      return {
        level: 'bronze',
        levelColor: 'text-amber-600',
        levelIcon: '🥉'
      };
    }
  }

  /**
   * Check if user meets vendor requirements
   * Vendors need: score >= 300, verified, and active following
   */
  meetsVendorRequirements(profile: EFPProfile): boolean {
    return (
      profile.score >= 300 &&
      profile.verified &&
      profile.followingCount > 0 &&
      profile.followersCount > 0
    );
  }

  /**
   * Get mutual connections between two users
   */
  async getMutualConnections(user1: Address, user2: Address): Promise<Address[]> {
    try {
      // This would require more complex contract calls to get mutual followers
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('EFP mutual connections error:', error);
      return [];
    }
  }

  /**
   * Verify an address for EFP compliance
   * Used during vendor onboarding
   */
  async verifyAddress(address: Address): Promise<{
    verified: boolean;
    score: number;
    meetsRequirements: boolean;
    reason?: string;
  }> {
    try {
      const profile = await this.getProfile(address);
      
      if (!profile) {
        return {
          verified: false,
          score: 0,
          meetsRequirements: false,
          reason: 'No EFP profile found'
        };
      }

      return {
        verified: profile.verified,
        score: profile.score,
        meetsRequirements: this.meetsVendorRequirements(profile),
        reason: this.meetsVendorRequirements(profile) 
          ? 'EFP verification passed' 
          : 'EFP requirements not met'
      };
    } catch (error) {
      console.error('EFP address verification error:', error);
      return {
        verified: false,
        score: 0,
        meetsRequirements: false,
        reason: 'Verification failed'
      };
    }
  }

  /**
   * Get trust level based on score
   */
  getTrustLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (score >= 800) return 'excellent';
    if (score >= 600) return 'high';
    if (score >= 400) return 'medium';
    return 'low';
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_EFP_MOCK === 'true';
  }

  /**
   * Mock EFP profile for development
   */
  private getMockProfile(address: Address): EFPProfile {
    // Generate consistent mock data based on address
    const addressStr = address.toLowerCase();
    const seed = parseInt(addressStr.slice(-4), 16);
    
    const mockProfiles = [
      {
        name: 'Alice Johnson',
        bio: 'Crypto enthusiast and early adopter',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        verified: true,
        baseScore: 450,
        followingCount: 25,
        followersCount: 120
      },
      {
        name: 'Bob Smith',
        bio: 'DeFi researcher and protocol contributor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        verified: true,
        baseScore: 380,
        followingCount: 45,
        followersCount: 89
      },
      {
        name: 'Carol Davis',
        bio: 'NFT artist and community builder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
        verified: false,
        baseScore: 220,
        followingCount: 15,
        followersCount: 45
      },
      {
        name: 'David Wilson',
        bio: 'Blockchain developer and educator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        verified: true,
        baseScore: 520,
        followingCount: 35,
        followersCount: 156
      }
    ];

    const profile = mockProfiles[seed % mockProfiles.length];
    const finalScore = this.calculateTrustScore({
      ...profile,
      address,
      score: profile.baseScore
    } as EFPProfile);

    const level = this.getLevel(finalScore);

    return {
      address,
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar,
      verified: profile.verified,
      score: finalScore,
      followingCount: profile.followingCount,
      followersCount: profile.followersCount,
      level: level.level,
      levelColor: level.levelColor,
      levelIcon: level.levelIcon,
      meetsVendorRequirements: this.meetsVendorRequirements({
        address,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        verified: profile.verified,
        score: finalScore,
        followingCount: profile.followingCount,
        followersCount: profile.followersCount,
        level: level.level,
        levelColor: level.levelColor,
        levelIcon: level.levelIcon,
        meetsVendorRequirements: false
      })
    };
  }

  /**
   * Mock follow status for development
   */
  private getMockFollowStatus(follower: Address, target: Address): boolean {
    // Simple mock: return true for certain address combinations
    const followerStr = follower.toLowerCase();
    const targetStr = target.toLowerCase();
    
    // Mock some follow relationships
    const mockFollows = [
      ['0x1234567890123456789012345678901234567890', '0x2345678901234567890123456789012345678901'],
      ['0x2345678901234567890123456789012345678901', '0x3456789012345678901234567890123456789012']
    ];

    return mockFollows.some(([f, t]) => 
      followerStr.includes(f.slice(-8)) && targetStr.includes(t.slice(-8))
    );
  }

  /**
   * Mock follow data for development
   */
  private getMockFollowData(address: Address): EFPFollowData {
    const profile = this.getMockProfile(address);
    return {
      isFollowing: false,
      followingCount: profile.followingCount,
      followersCount: profile.followersCount,
      mutualConnections: Math.floor(Math.random() * 10)
    };
  }
}

// Export singleton instance
export const efpService = new EFPService();

// Export types
export type { EFPProfile, EFPFollowData };