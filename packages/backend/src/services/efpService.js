import axios from 'axios';

export class EFPService {
  static async verifyEFP(walletAddress) {
    try {
      // EFP verification endpoint (this would be the actual EFP API)
      const response = await axios.get(
        `${process.env.EFP_API_URL}/verify/${walletAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EFP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.verified) {
        return {
          success: true,
          verified: true,
          data: {
            ens_name: response.data.ens_name,
            avatar: response.data.avatar,
            followers: response.data.followers,
            following: response.data.following,
            verified_at: new Date()
          }
        };
      }

      return {
        success: true,
        verified: false,
        data: null
      };
    } catch (error) {
      console.error('❌ EFP verification error:', error.message);
      
      // Return false for verification errors (don't block registration)
      return {
        success: false,
        verified: false,
        data: null,
        error: error.message
      };
    }
  }

  static async getEFPProfile(walletAddress) {
    try {
      const response = await axios.get(
        `${process.env.EFP_API_URL}/profile/${walletAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EFP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ EFP profile fetch error:', error.message);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
}
