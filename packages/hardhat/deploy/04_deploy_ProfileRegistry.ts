import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployProfileRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying ProfileRegistry...");

  const profileRegistry = await deploy("ProfileRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("ProfileRegistry deployed to:", profileRegistry.address);

  // Verify the contract on BaseScan
  if (hre.network.name === "baseSepolia") {
    console.log("Waiting for block confirmations...");
    await profileRegistry.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: profileRegistry.address,
        constructorArguments: [],
      });
      console.log("ProfileRegistry verified on BaseScan");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
};

export default deployProfileRegistry;
deployProfileRegistry.tags = ["ProfileRegistry"];
