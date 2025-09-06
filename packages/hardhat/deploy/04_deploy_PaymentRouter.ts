import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the PaymentRouter contract
 * Handles bUSDC payments between buyers and vendors
 */
const deployPaymentRouter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying PaymentRouter...");

  // Get the required contract addresses
  const busdc = await hre.deployments.get("bUSDC");
  const vendorRegistry = await hre.deployments.get("VendorRegistry");
  const subnameRegistrar = await hre.deployments.get("SubnameRegistrar");

  await deploy("PaymentRouter", {
    from: deployer,
    args: [
      busdc.address,
      vendorRegistry.address,
      subnameRegistrar.address,
      deployer, // Fee recipient (deployer for now)
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const paymentRouter = await hre.ethers.getContract<Contract>("PaymentRouter", deployer);

  console.log("✅ PaymentRouter deployed at:", await paymentRouter.getAddress());
  console.log("🪙 bUSDC Token:", await paymentRouter.busdcToken());
  console.log("🏪 VendorRegistry:", await paymentRouter.vendorRegistry());
  console.log("📝 SubnameRegistrar:", await paymentRouter.subnameRegistrar());
  console.log("💰 Fee recipient:", await paymentRouter.feeRecipient());
  console.log("💱 Exchange rate:", await paymentRouter.currentFxRate());
  console.log("📊 Platform fee (bps):", await paymentRouter.platformFeeBps());
  console.log("🔧 FX rate updater:", await paymentRouter.fxRateUpdater());
};

export default deployPaymentRouter;
deployPaymentRouter.tags = ["PaymentRouter", "payments"];
deployPaymentRouter.dependencies = ["bUSDC", "VendorRegistry", "SubnameRegistrar"];
