import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the VendorRegistry contract
 * Manages vendor profiles and verification status
 */
const deployVendorRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying VendorRegistry...");

  await deploy("VendorRegistry", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const vendorRegistry = await hre.ethers.getContract<Contract>("VendorRegistry", deployer);

  console.log("✅ VendorRegistry deployed at:", await vendorRegistry.getAddress());
  console.log("👤 Owner:", await vendorRegistry.owner());
  console.log("📊 Vendor count:", await vendorRegistry.getVendorCount());

  // Log verification requirements
  console.log("📋 Verification requirements:");
  console.log("  - Phone verification required:", await vendorRegistry.requirePhoneVerification());
  console.log("  - EFP verification required:", await vendorRegistry.requireEFPVerification());
  console.log("  - Minimum EFPas score:", await vendorRegistry.minEFPasScore());
};

export default deployVendorRegistry;
deployVendorRegistry.tags = ["VendorRegistry", "core"];
