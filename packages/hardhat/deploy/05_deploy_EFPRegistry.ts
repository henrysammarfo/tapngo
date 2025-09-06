import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployEFPRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying EFPRegistry...");

  const efpRegistry = await deploy("EFPRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("EFPRegistry deployed to:", efpRegistry.address);

  // Verify the contract on BaseScan
  if (hre.network.name === "baseSepolia") {
    console.log("Waiting for block confirmations...");
    await efpRegistry.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: efpRegistry.address,
        constructorArguments: [],
      });
      console.log("EFPRegistry verified on BaseScan");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
};

export default deployEFPRegistry;
deployEFPRegistry.tags = ["EFPRegistry"];
