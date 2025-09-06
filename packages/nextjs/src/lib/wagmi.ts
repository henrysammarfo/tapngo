import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Tap&Go Pay',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [baseSepolia],
  ssr: true,
});

// Contract addresses on Base Sepolia (from deployments)
export const CONTRACTS = {
  bUSDC: '0xeb9361Ec0d712C5B12965FB91c409262b7d6703c',
  PaymentRouter: '0xd4C84453E1640BDD8a9EB0Dd645c0C4208dD66eF',
  VendorRegistry: '0xA9F04F020CF9F511982719196E25FE7c666c9E4D',
  SubnameRegistrar: '0xC3b022250C359c9A9793d018503c20495FcD1B4F',
  Paymaster: '0x23E3d0017A282f48bF80dE2A6E670f57be2C9152',
  // New contracts (to be deployed)
  ProfileRegistry: '0x0000000000000000000000000000000000000000', // Placeholder
  EFPRegistry: '0x0000000000000000000000000000000000000000', // Placeholder
} as const;
