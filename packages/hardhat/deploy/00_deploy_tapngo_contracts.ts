import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys all Tap&Go Pay contracts in the correct order
 * This is the main deployment script for the Tap&Go Pay system
 */
const deployTapNGoContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🌍 Starting Tap&Go Pay deployment...");
  console.log("👤 Deployer:", deployer);
  console.log("🌐 Network:", hre.network.name);
  console.log("");

  // 1. Deploy bUSDC Token
  console.log("1️⃣ Deploying bUSDC Test Token...");
  await deploy("bUSDC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const busdc = await hre.ethers.getContract<Contract>("bUSDC", deployer);
  console.log("✅ bUSDC deployed at:", await busdc.getAddress());
  console.log("");

  // 2. Deploy VendorRegistry
  console.log("2️⃣ Deploying VendorRegistry...");
  await deploy("VendorRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const vendorRegistry = await hre.ethers.getContract<Contract>("VendorRegistry", deployer);
  console.log("✅ VendorRegistry deployed at:", await vendorRegistry.getAddress());
  console.log("");

  // 3. Deploy SubnameRegistrar
  console.log("3️⃣ Deploying SubnameRegistrar...");

  await deploy("SubnameRegistrar", {
    from: deployer,
    args: [await vendorRegistry.getAddress()],
    log: true,
    autoMine: true,
  });

  const subnameRegistrar = await hre.ethers.getContract<Contract>("SubnameRegistrar", deployer);
  console.log("✅ SubnameRegistrar deployed at:", await subnameRegistrar.getAddress());
  console.log("");

  // 4. Deploy PaymentRouter
  console.log("4️⃣ Deploying PaymentRouter...");
  await deploy("PaymentRouter", {
    from: deployer,
    args: [
      await busdc.getAddress(),
      await vendorRegistry.getAddress(),
      await subnameRegistrar.getAddress(),
      deployer, // Fee recipient (deployer for now)
    ],
    log: true,
    autoMine: true,
  });

  const paymentRouter = await hre.ethers.getContract<Contract>("PaymentRouter", deployer);
  console.log("✅ PaymentRouter deployed at:", await paymentRouter.getAddress());
  console.log("");

  // 5. Deploy Paymaster
  console.log("5️⃣ Deploying Paymaster...");

  // For Base Sepolia, we'll use a placeholder for EntryPoint
  // In production, this would be the actual ERC-4337 EntryPoint address
  const ENTRY_POINT_PLACEHOLDER = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // Mainnet EntryPoint

  await deploy("Paymaster", {
    from: deployer,
    args: [await vendorRegistry.getAddress(), ENTRY_POINT_PLACEHOLDER],
    log: true,
    autoMine: true,
  });

  const paymaster = await hre.ethers.getContract<Contract>("Paymaster", deployer);
  console.log("✅ Paymaster deployed at:", await paymaster.getAddress());
  console.log("");

  // Summary
  console.log("🎉 Tap&Go Pay deployment completed successfully!");
  console.log("");
  console.log("📋 Contract Summary:");
  console.log("┌─────────────────────┬──────────────────────────────────────────────┐");
  console.log("│ Contract            │ Address                                      │");
  console.log("├─────────────────────┼──────────────────────────────────────────────┤");
  console.log(`│ bUSDC               │ ${await busdc.getAddress()} │`);
  console.log(`│ VendorRegistry      │ ${await vendorRegistry.getAddress()} │`);
  console.log(`│ SubnameRegistrar    │ ${await subnameRegistrar.getAddress()} │`);
  console.log(`│ PaymentRouter       │ ${await paymentRouter.getAddress()} │`);
  console.log(`│ Paymaster           │ ${await paymaster.getAddress()} │`);
  console.log("└─────────────────────┴──────────────────────────────────────────────┘");
  console.log("");

  // Contract interactions
  console.log("🔧 Contract Interactions:");
  console.log(`- VendorRegistry → SubnameRegistrar: ${await subnameRegistrar.vendorRegistry()}`);
  console.log(`- PaymentRouter → bUSDC: ${await paymentRouter.busdcToken()}`);
  console.log(`- PaymentRouter → VendorRegistry: ${await paymentRouter.vendorRegistry()}`);
  console.log(`- PaymentRouter → SubnameRegistrar: ${await paymentRouter.subnameRegistrar()}`);
  console.log(`- Paymaster → VendorRegistry: ${await paymaster.vendorRegistry()}`);
  console.log("");

  // Token info
  console.log("🪙 bUSDC Token Info:");
  console.log(`- Name: ${await busdc.name()}`);
  console.log(`- Symbol: ${await busdc.symbol()}`);
  console.log(`- Decimals: ${await busdc.decimals()}`);
  console.log(`- Total Supply: ${await busdc.totalSupply()}`);
  console.log("");

  // Payment info
  console.log("💳 Payment Info:");
  console.log(`- Exchange Rate: ${await paymentRouter.currentFxRate()}`);
  console.log(`- Platform Fee: ${await paymentRouter.platformFeeBps()} bps`);
  console.log(`- Fee Recipient: ${await paymentRouter.feeRecipient()}`);
  console.log("");

  // Gas info
  const gasLimits = await paymaster.gasLimits();
  console.log("⛽ Gas Limits:");
  console.log(`- Max gas per transaction: ${gasLimits.maxGasPerTransaction}`);
  console.log(`- Max gas per day: ${gasLimits.maxGasPerDay}`);
  console.log(`- Max gas per month: ${gasLimits.maxGasPerMonth}`);
  console.log("");

  console.log("🚀 Ready for Tap&Go Pay on Base Sepolia!");
};

export default deployTapNGoContracts;
deployTapNGoContracts.tags = ["TapNGo", "all"];
