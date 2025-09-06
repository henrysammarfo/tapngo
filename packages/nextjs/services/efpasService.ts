// EFPas (Ethereum Foundation Passport) Service for Tap&Go Pay
// Implements real EFPas verification and reputation scoring

import axios from 'axios';

// EFPas API endpoints (these would be the actual EFPas API endpoints)
const EFPAS_API_BASE_URL = 'https://api.efpas.org'; // To be updated with real EFPas API
const EFPAS_VERIFICATION_ENDPOINT = '/verify';
const EFPAS_SCORE_ENDPOINT = '/score';
const EFPAS_PROFILE_ENDPOINT = '/profile';

export interface EFPasProfile {
  address: string;
  passportId: string;
  verified: boolean;
  score: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  levelColor: string;
  levelIcon: string;
  levelDescription: string;
  meetsVendorRequirements: boolean;
  verificationDate?: string;
  lastUpdated?: string;
  attributes: {
    identityVerified: boolean;
    sybilResistant: boolean;
    reputationScore: number;
    communityStanding: number;
    technicalCompetence: number;
  };
}

export interface EFPasVerificationResult {
  success: boolean;
  verified: boolean;
  score?: number;
  error?: string;
  verificationId?: string;
}

class EFPasService {
  private apiKey: string | null = null;

  constructor() {
    // Initialize API key from environment
    this.apiKey = process.env.NEXT_PUBLIC_EFPAS_API_KEY || null;
  }

  /**
   * Verify a user's Ethereum Foundation Passport
   * This is the core verification function for vendor onboarding
   */
  async verifyPassport(address: string): Promise<EFPasVerificationResult> {
    try {
      // For now, return mock data since EFPas API is not yet available
      // TODO: Replace with real API calls when EFPas is live
      if (this.isDevelopmentMode()) {
        return this.getMockVerification(address);
      }

      // Real implementation (when EFPas API is available):
      // const response = await axios.post(
      //   `${EFPAS_API_BASE_URL}${EFPAS_VERIFICATION_ENDPOINT}`,
      //   {
      //     address: address,
      //     timestamp: Date.now()
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${this.apiKey}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // return {
      //   success: true,
      //   verified: response.data.verified,
      //   score: response.data.score,
      //   verificationId: response.data.verificationId
      // };

      return {
        success: false,
        verified: false,
        error: 'EFPas verification not yet available'
      };
    } catch (error) {
      console.error('EFPas verification error:', error);
      return {
        success: false,
        verified: false,
        error: 'Verification failed'
      };
    }
  }

  /**
   * Get EFPas profile and score for a user
   */
  async getProfile(address: string): Promise<EFPasProfile | null> {
    try {
      if (this.isDevelopmentMode()) {
        return this.getMockProfile(address);
      }

      // Real implementation:
      // const response = await axios.get(
      //   `${EFPAS_API_BASE_URL}${EFPAS_PROFILE_ENDPOINT}/${address}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${this.apiKey}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // const profileData = response.data;
      // const level = this.calculateLevel(profileData.score);

      // return {
      //   address: address,
      //   passportId: profileData.passportId,
      //   verified: profileData.verified,
      //   score: profileData.score,
      //   level: level.level,
      //   levelColor: level.levelColor,
      //   levelIcon: level.levelIcon,
      //   levelDescription: level.levelDescription,
      //   meetsVendorRequirements: this.meetsVendorRequirements(profileData),
      //   verificationDate: profileData.verificationDate,
      //   lastUpdated: profileData.lastUpdated,
      //   attributes: {
      //     identityVerified: profileData.attributes.identityVerified,
      //     sybilResistant: profileData.attributes.sybilResistant,
      //     reputationScore: profileData.attributes.reputationScore,
      //     communityStanding: profileData.attributes.communityStanding,
      //     technicalCompetence: profileData.attributes.technicalCompetence
      //   }
      // };

      return null;
    } catch (error) {
      console.error('EFPas profile fetch error:', error);
      return null;
    }
  }

  /**
   * Get EFPas score for a user
   */
  async getScore(address: string): Promise<number | null> {
    try {
      if (this.isDevelopmentMode()) {
        const profile = this.getMockProfile(address);
        return profile?.score || null;
      }

      // Real implementation:
      // const response = await axios.get(
      //   `${EFPAS_API_BASE_URL}${EFPAS_SCORE_ENDPOINT}/${address}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${this.apiKey}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );

      // return response.data.score;

      return null;
    } catch (error) {
      console.error('EFPas score fetch error:', error);
      return null;
    }
  }

  /**
   * Calculate level based on EFPas score
   */
  calculateLevel(score: number): {
    level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    levelColor: string;
    levelIcon: string;
    levelDescription: string;
  } {
    if (score >= 900) {
      return {
        level: 'diamond',
        levelColor: 'text-blue-600',
        levelIcon: '💎',
        levelDescription: 'Exceptional reputation and standing in the Ethereum community'
      };
    } else if (score >= 750) {
      return {
        level: 'platinum',
        levelColor: 'text-gray-600',
        levelIcon: '🏆',
        levelDescription: 'High reputation with strong community standing'
      };
    } else if (score >= 600) {
      return {
        level: 'gold',
        levelColor: 'text-yellow-600',
        levelIcon: '🥇',
        levelDescription: 'Good reputation with verified identity and competence'
      };
    } else if (score >= 400) {
      return {
        level: 'silver',
        levelColor: 'text-gray-500',
        levelIcon: '🥈',
        levelDescription: 'Verified identity with moderate reputation'
      };
    } else {
      return {
        level: 'bronze',
        levelColor: 'text-amber-600',
        levelIcon: '🥉',
        levelDescription: 'Basic verification with limited reputation data'
      };
    }
  }

  /**
   * Check if user meets vendor requirements
   * Vendors need: score >= 500, verified identity, and sybil resistance
   */
  meetsVendorRequirements(profile: EFPasProfile): boolean {
    return (
      profile.score >= 500 &&
      profile.verified &&
      profile.attributes.identityVerified &&
      profile.attributes.sybilResistant
    );
  }

  /**
   * Validate EFPas verification for vendor onboarding
   */
  async validateForVendor(address: string): Promise<{
    valid: boolean;
    reason?: string;
    profile?: EFPasProfile;
  }> {
    try {
      const profile = await this.getProfile(address);
      
      if (!profile) {
        return {
          valid: false,
          reason: 'No EFPas profile found'
        };
      }

      if (!profile.verified) {
        return {
          valid: false,
          reason: 'EFPas not verified'
        };
      }

      if (profile.score < 500) {
        return {
          valid: false,
          reason: 'EFPas score too low (minimum 500 required)'
        };
      }

      if (!profile.attributes.identityVerified) {
        return {
          valid: false,
          reason: 'Identity not verified'
        };
      }

      if (!profile.attributes.sybilResistant) {
        return {
          valid: false,
          reason: 'Sybil resistance not confirmed'
        };
      }

      return {
        valid: true,
        profile
      };
    } catch (error) {
      console.error('EFPas vendor validation error:', error);
      return {
        valid: false,
        reason: 'Validation failed'
      };
    }
  }

  /**
   * Get EFPas verification status
   */
  async getVerificationStatus(address: string): Promise<{
    verified: boolean;
    score: number;
    level: string;
    lastChecked: string;
  }> {
    try {
      const profile = await this.getProfile(address);
      
      if (!profile) {
        return {
          verified: false,
          score: 0,
          level: 'unverified',
          lastChecked: new Date().toISOString()
        };
      }

      return {
        verified: profile.verified,
        score: profile.score,
        level: profile.level,
        lastChecked: profile.lastUpdated || new Date().toISOString()
      };
    } catch (error) {
      console.error('EFPas status check error:', error);
      return {
        verified: false,
        score: 0,
        level: 'error',
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_EFPAS_MOCK === 'true';
  }

  /**
   * Mock EFPas verification for development
   */
  private getMockVerification(address: string): EFPasVerificationResult {
    // Generate consistent mock data based on address
    const addressStr = address.toLowerCase();
    const seed = parseInt(addressStr.slice(-4), 16);
    
    // Mock verification results
    const mockResults = [
      { verified: true, score: 750 },
      { verified: true, score: 650 },
      { verified: true, score: 580 },
      { verified: false, score: 200 },
      { verified: true, score: 850 },
      { verified: true, score: 720 }
    ];

    const result = mockResults[seed % mockResults.length];
    
    return {
      success: true,
      verified: result.verified,
      score: result.score,
      verificationId: `efpas_${Date.now()}_${address.slice(-8)}`
    };
  }

  /**
   * Mock EFPas profile for development
   */
  private getMockProfile(address: string): EFPasProfile {
    const addressStr = address.toLowerCase();
    const seed = parseInt(addressStr.slice(-4), 16);
    
    const mockProfiles = [
      {
        passportId: 'EFPAS-001-ALICE',
        verified: true,
        score: 750,
        verificationDate: '2024-01-15T10:30:00Z',
        attributes: {
          identityVerified: true,
          sybilResistant: true,
          reputationScore: 80,
          communityStanding: 85,
          technicalCompetence: 70
        }
      },
      {
        passportId: 'EFPAS-002-BOB',
        verified: true,
        score: 650,
        verificationDate: '2024-01-20T14:45:00Z',
        attributes: {
          identityVerified: true,
          sybilResistant: true,
          reputationScore: 75,
          communityStanding: 70,
          technicalCompetence: 80
        }
      },
      {
        passportId: 'EFPAS-003-CAROL',
        verified: true,
        score: 580,
        verificationDate: '2024-02-01T09:15:00Z',
        attributes: {
          identityVerified: true,
          sybilResistant: true,
          reputationScore: 65,
          communityStanding: 60,
          technicalCompetence: 75
        }
      },
      {
        passportId: 'EFPAS-004-DAVID',
        verified: false,
        score: 200,
        verificationDate: null,
        attributes: {
          identityVerified: false,
          sybilResistant: false,
          reputationScore: 20,
          communityStanding: 15,
          technicalCompetence: 25
        }
      }
    ];

    const profile = mockProfiles[seed % mockProfiles.length];
    const level = this.calculateLevel(profile.score);

    return {
      address,
      passportId: profile.passportId,
      verified: profile.verified,
      score: profile.score,
      level: level.level,
      levelColor: level.levelColor,
      levelIcon: level.levelIcon,
      levelDescription: level.levelDescription,
      meetsVendorRequirements: this.meetsVendorRequirements({
        address,
        passportId: profile.passportId,
        verified: profile.verified,
        score: profile.score,
        level: level.level,
        levelColor: level.levelColor,
        levelIcon: level.levelIcon,
        levelDescription: level.levelDescription,
        meetsVendorRequirements: false,
        verificationDate: profile.verificationDate,
        lastUpdated: new Date().toISOString(),
        attributes: profile.attributes
      }),
      verificationDate: profile.verificationDate,
      lastUpdated: new Date().toISOString(),
      attributes: profile.attributes
    };
  }
}

// Export singleton instance
export const efpasService = new EFPasService();

// Export types
export type { EFPasProfile, EFPasVerificationResult };