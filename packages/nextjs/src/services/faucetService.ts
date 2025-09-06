import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/wagmi';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export class FaucetService {
  /**
   * Claim tokens from faucet (10 bUSDC every 24 hours)
   */
  static async claimFaucet(): Promise<string> {
    try {
      // This would be called from a write contract hook in the component
      // For now, return a mock transaction hash
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Faucet claim error:', error);
      throw error;
    }
  }

  /**
   * Check if address can claim from faucet
   */
  static async canClaimFaucet(address: string): Promise<{ canClaim: boolean; timeUntilClaim: number }> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: parseAbi([
          'function canClaimFaucet(address user) view returns (bool canClaim, uint256 timeUntilClaim)'
        ]),
        functionName: 'canClaimFaucet',
        args: [address as `0x${string}`]
      });
      return {
        canClaim: result.canClaim,
        timeUntilClaim: Number(result.timeUntilClaim)
      };
    } catch (error) {
      console.error('Can claim faucet check error:', error);
      return { canClaim: false, timeUntilClaim: 0 };
    }
  }

  /**
   * Get last faucet claim time for an address
   */
  static async getLastFaucetClaim(address: string): Promise<number> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: parseAbi([
          'function lastFaucetClaim(address user) view returns (uint256)'
        ]),
        functionName: 'lastFaucetClaim',
        args: [address as `0x${string}`]
      });
      return Number(result);
    } catch (error) {
      console.error('Get last faucet claim error:', error);
      return 0;
    }
  }

  /**
   * Get faucet amount (10 bUSDC)
   */
  static async getFaucetAmount(): Promise<bigint> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: parseAbi([
          'function FAUCET_AMOUNT() view returns (uint256)'
        ]),
        functionName: 'FAUCET_AMOUNT'
      });
      return result;
    } catch (error) {
      console.error('Get faucet amount error:', error);
      return 10n * 10n**6n; // 10 bUSDC with 6 decimals
    }
  }

  /**
   * Get faucet cooldown period (24 hours)
   */
  static async getFaucetCooldown(): Promise<number> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.bUSDC as `0x${string}`,
        abi: parseAbi([
          'function FAUCET_COOLDOWN() view returns (uint256)'
        ]),
        functionName: 'FAUCET_COOLDOWN'
      });
      return Number(result);
    } catch (error) {
      console.error('Get faucet cooldown error:', error);
      return 24 * 60 * 60; // 24 hours in seconds
    }
  }
}
