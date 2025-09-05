import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the SubnameRegistrar contract
 * Manages ENS subnames under .tapngo.eth for verified vendors
 */
const deploySubnameRegistrar: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying SubnameRegistrar...");

  // Get the VendorRegistry address
  const vendorRegistry = await hre.deployments.get("VendorRegistry");

  // For Base Sepolia, we'll use placeholder addresses for ENS contracts
  // In production, these would be the actual ENS contract addresses
  const ENS_REGISTRY_PLACEHOLDER = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"; // Mainnet ENS Registry
  const ENS_RESOLVER_PLACEHOLDER = "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"; // Mainnet Public Resolver

  await deploy("SubnameRegistrar", {
    from: deployer,
    args: [vendorRegistry.address, ENS_REGISTRY_PLACEHOLDER, ENS_RESOLVER_PLACEHOLDER],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const subnameRegistrar = await hre.ethers.getContract<Contract>("SubnameRegistrar", deployer);

  console.log("✅ SubnameRegistrar deployed at:", await subnameRegistrar.getAddress());
  console.log("🔗 VendorRegistry:", await subnameRegistrar.vendorRegistry());
  console.log("🔗 ENS Registry:", await subnameRegistrar.ensRegistry());
  console.log("🔗 ENS Resolver:", await subnameRegistrar.ensResolver());
  console.log("💰 Registration fee:", await subnameRegistrar.registrationFee());
  console.log("🌐 TAPNGO Node:", await subnameRegistrar.TAPNGO_NODE());
};

export default deploySubnameRegistrar;
deploySubnameRegistrar.tags = ["SubnameRegistrar", "ens"];
deploySubnameRegistrar.dependencies = ["VendorRegistry"];
