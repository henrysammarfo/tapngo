import axios from 'axios';

export class EFPasService {
  static async getEFPasScore(walletAddress) {
    try {
      // EFPas API endpoint (this would be the actual EFPas API)
      const response = await axios.get(
        `${process.env.EFPAS_API_URL}/score/${walletAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EFPAS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const score = response.data.score || 0;
      const level = this.calculateLevel(score);

      return {
        success: true,
        data: {
          score,
          level,
          rank: response.data.rank || null,
          percentile: response.data.percentile || null,
          badges: response.data.badges || [],
          verified_at: new Date()
        }
      };
    } catch (error) {
      console.error('❌ EFPas score fetch error:', error.message);
      
      // Return default score for API errors
      return {
        success: false,
        data: {
          score: 0,
          level: 'bronze',
          rank: null,
          percentile: null,
          badges: [],
          verified_at: null
        },
        error: error.message
      };
    }
  }

  static calculateLevel(score) {
    if (score >= 800) return 'diamond';
    if (score >= 600) return 'platinum';
    if (score >= 400) return 'gold';
    if (score >= 200) return 'silver';
    return 'bronze';
  }

  static getLevelColor(level) {
    const colors = {
      diamond: '#B9F2FF',
      platinum: '#E5E4E2',
      gold: '#FFD700',
      silver: '#C0C0C0',
      bronze: '#CD7F32'
    };
    return colors[level] || '#C0C0C0';
  }

  static getLevelIcon(level) {
    const icons = {
      diamond: '💎',
      platinum: '🏆',
      gold: '🥇',
      silver: '🥈',
      bronze: '🥉'
    };
    return icons[level] || '🥉';
  }
}
