import { createPublicClient, http, parseAbi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/wagmi';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export class PaymasterService {
  /**
   * Get paymaster balance
   */
  static async getBalance(): Promise<bigint> {
    try {
      const balance = await client.getBalance({
        address: CONTRACTS.Paymaster as `0x${string}`
      });
      return balance;
    } catch (error) {
      console.error('Paymaster balance error:', error);
      return 0n;
    }
  }

  /**
   * Check if paymaster is active (not paused)
   */
  static async isActive(): Promise<boolean> {
    try {
      const result = await client.readContract({
        address: CONTRACTS.Paymaster as `0x${string}`,
        abi: parseAbi([
          'function paused() view returns (bool)'
        ]),
        functionName: 'paused'
      });
      return !result; // Active when not paused
    } catch (error) {
      console.error('Paymaster active check error:', error);
      return false;
    }
  }

  /**
   * Get paymaster configuration
   */
  static async getConfig(): Promise<{
    gasLimits: { maxGasPerDay: bigint; maxGasPerMonth: bigint };
    balance: bigint;
    isActive: boolean;
  }> {
    try {
      const [gasLimits, balance, isActive] = await Promise.all([
        client.readContract({
          address: CONTRACTS.Paymaster as `0x${string}`,
          abi: parseAbi(['function gasLimits() view returns (uint256 maxGasPerDay, uint256 maxGasPerMonth)']),
          functionName: 'gasLimits'
        }),
        client.readContract({
          address: CONTRACTS.Paymaster as `0x${string}`,
          abi: parseAbi(['function getPaymasterBalance() view returns (uint256)']),
          functionName: 'getPaymasterBalance'
        }),
        this.isActive()
      ]);

      return {
        gasLimits,
        balance,
        isActive
      };
    } catch (error) {
      console.error('Paymaster config error:', error);
      return {
        gasLimits: { maxGasPerDay: 0n, maxGasPerMonth: 0n },
        balance: 0n,
        isActive: false
      };
    }
  }

  /**
   * Get paymaster statistics
   */
  static async getStats(): Promise<{
    balance: bigint;
    isActive: boolean;
    owner: string;
  }> {
    try {
      const [balance, isActive, owner] = await Promise.all([
        client.readContract({
          address: CONTRACTS.Paymaster as `0x${string}`,
          abi: parseAbi(['function getPaymasterBalance() view returns (uint256)']),
          functionName: 'getPaymasterBalance'
        }),
        this.isActive(),
        client.readContract({
          address: CONTRACTS.Paymaster as `0x${string}`,
          abi: parseAbi(['function owner() view returns (address)']),
          functionName: 'owner'
        })
      ]);

      return {
        balance,
        isActive,
        owner
      };
    } catch (error) {
      console.error('Paymaster stats error:', error);
      return {
        balance: 0n,
        isActive: false,
        owner: '0x0000000000000000000000000000000000000000'
      };
    }
  }

  /**
   * Check if a transaction can be sponsored
   */
  static async canSponsor(
    gasPrice: bigint,
    gasLimit: bigint,
    value: bigint
  ): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return (
        gasLimit <= config.gasLimits.maxGasPerDay &&
        config.isActive
      );
    } catch (error) {
      console.error('Paymaster sponsor check error:', error);
      return false;
    }
  }
}
