import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Paymaster contract
 * ERC-4337 Paymaster for sponsoring gas fees for verified users and vendors
 */
const deployPaymaster: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying Paymaster...");

  // Get the VendorRegistry address
  const vendorRegistry = await hre.deployments.get("VendorRegistry");

  // For Base Sepolia, we'll use a placeholder for EntryPoint
  // In production, this would be the actual ERC-4337 EntryPoint address
  const ENTRY_POINT_PLACEHOLDER = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // Mainnet EntryPoint

  await deploy("Paymaster", {
    from: deployer,
    args: [vendorRegistry.address, ENTRY_POINT_PLACEHOLDER],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const paymaster = await hre.ethers.getContract<Contract>("Paymaster", deployer);

  console.log("✅ Paymaster deployed at:", await paymaster.getAddress());
  console.log("🏪 VendorRegistry:", await paymaster.vendorRegistry());
  console.log("🔗 EntryPoint:", await paymaster.entryPoint());
  console.log("💰 Paymaster balance:", await paymaster.getPaymasterBalance());

  // Log gas limits
  const gasLimits = await paymaster.gasLimits();
  console.log("⛽ Gas limits:");
  console.log("  - Max gas per transaction:", gasLimits.maxGasPerTransaction.toString());
  console.log("  - Max gas per day:", gasLimits.maxGasPerDay.toString());
  console.log("  - Max gas per month:", gasLimits.maxGasPerMonth.toString());
};

export default deployPaymaster;
deployPaymaster.tags = ["Paymaster", "gas"];
deployPaymaster.dependencies = ["VendorRegistry"];
