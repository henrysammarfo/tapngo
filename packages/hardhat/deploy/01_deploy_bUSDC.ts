import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the bUSDC test token contract
 * This is a mintable ERC20 token for testing Tap&Go Pay on Base Sepolia
 */
const deploybUSDC: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying bUSDC Test Token...");

  await deploy("bUSDC", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const busdc = await hre.ethers.getContract<Contract>("bUSDC", deployer);

  console.log("✅ bUSDC deployed at:", await busdc.getAddress());
  console.log("📊 Initial supply:", await busdc.totalSupply());
  console.log("🔢 Decimals:", await busdc.decimals());
  console.log("📝 Symbol:", await busdc.symbol());
  console.log("📝 Name:", await busdc.name());
};

export default deploybUSDC;
deploybUSDC.tags = ["bUSDC", "tokens"];
