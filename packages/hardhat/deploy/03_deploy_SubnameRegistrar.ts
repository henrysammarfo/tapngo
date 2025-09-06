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

  await deploy("SubnameRegistrar", {
    from: deployer,
    args: [vendorRegistry.address],
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
  console.log("🌐 TAPNGO Node:", await subnameRegistrar.tapngoNode());
};

export default deploySubnameRegistrar;
deploySubnameRegistrar.tags = ["SubnameRegistrar", "ens"];
deploySubnameRegistrar.dependencies = ["VendorRegistry"];
