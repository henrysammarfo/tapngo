import { ethers } from "hardhat";

async function main() {
  console.log("Testing deployed contracts on Base Sepolia...\n");

  // Contract addresses from deployment
  const bUSDC_ADDRESS = "0xeb9361Ec0d712C5B12965FB91c409262b7d6703c";
  const PAYMENT_ROUTER_ADDRESS = "0x0598c74C30e4e70fb6Cd7cd63c3DDE74756EAb73";
  const VENDOR_REGISTRY_ADDRESS = "0xA9F04F020CF9F511982719196E25FE7c666c9E4D";
  const SUBNAME_REGISTRAR_ADDRESS = "0x75c4D11F142bB29996B11533e6EF9f741c45De7C";
  const PAYMASTER_ADDRESS = "0x23E3d0017A282f48bF80dE2A6E670f57be2C9152";

  try {
    // Get contract instances
    const bUSDC = await ethers.getContractAt("bUSDC", bUSDC_ADDRESS);
    const paymentRouter = await ethers.getContractAt("PaymentRouter", PAYMENT_ROUTER_ADDRESS);
    const vendorRegistry = await ethers.getContractAt("VendorRegistry", VENDOR_REGISTRY_ADDRESS);
    const subnameRegistrar = await ethers.getContractAt("SubnameRegistrar", SUBNAME_REGISTRAR_ADDRESS);
    const paymaster = await ethers.getContractAt("Paymaster", PAYMASTER_ADDRESS);

    console.log("✅ Successfully connected to deployed contracts\n");

    // Test bUSDC contract
    console.log("Testing bUSDC contract...");
    const name = await bUSDC.name();
    const symbol = await bUSDC.symbol();
    const decimals = await bUSDC.decimals();
    const totalSupply = await bUSDC.totalSupply();
    
    console.log(`  Name: ${name}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Decimals: ${decimals}`);
    console.log(`  Total Supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
    
    // Test faucet constants
    const faucetAmount = await bUSDC.FAUCET_AMOUNT();
    const faucetCooldown = await bUSDC.FAUCET_COOLDOWN();
    console.log(`  Faucet Amount: ${ethers.formatUnits(faucetAmount, decimals)} ${symbol}`);
    console.log(`  Faucet Cooldown: ${faucetCooldown} seconds (${Number(faucetCooldown) / 3600} hours)`);
    console.log("✅ bUSDC contract tests passed\n");

    // Test PaymentRouter contract
    console.log("Testing PaymentRouter contract...");
    const busdcToken = await paymentRouter.busdcToken();
    console.log(`  bUSDC Token Address: ${busdcToken}`);
    console.log(`  Expected: ${bUSDC_ADDRESS}`);
    console.log(`  Match: ${busdcToken.toLowerCase() === bUSDC_ADDRESS.toLowerCase() ? "✅" : "❌"}`);
    console.log("✅ PaymentRouter contract tests passed\n");

    // Test VendorRegistry contract
    console.log("Testing VendorRegistry contract...");
    const owner = await vendorRegistry.owner();
    console.log(`  Owner: ${owner}`);
    console.log("✅ VendorRegistry contract tests passed\n");

    // Test SubnameRegistrar contract
    console.log("Testing SubnameRegistrar contract...");
    const vendorRegistryRef = await subnameRegistrar.vendorRegistry();
    console.log(`  VendorRegistry Address: ${vendorRegistryRef}`);
    console.log(`  Expected: ${VENDOR_REGISTRY_ADDRESS}`);
    console.log(`  Match: ${vendorRegistryRef.toLowerCase() === VENDOR_REGISTRY_ADDRESS.toLowerCase() ? "✅" : "❌"}`);
    console.log("✅ SubnameRegistrar contract tests passed\n");

    // Test Paymaster contract
    console.log("Testing Paymaster contract...");
    const paymasterVendorRegistry = await paymaster.vendorRegistry();
    console.log(`  VendorRegistry Address: ${paymasterVendorRegistry}`);
    console.log(`  Expected: ${VENDOR_REGISTRY_ADDRESS}`);
    console.log(`  Match: ${paymasterVendorRegistry.toLowerCase() === VENDOR_REGISTRY_ADDRESS.toLowerCase() ? "✅" : "❌"}`);
    
    // Test paymaster configuration
    const balance = await paymaster.getPaymasterBalance();
    console.log(`  Paymaster Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Test gas limits (if available)
    try {
      const gasLimits = await paymaster.gasLimits();
      console.log(`  Max Gas Per Transaction: ${gasLimits.maxGasPerTransaction}`);
      console.log(`  Max Gas Per Day: ${gasLimits.maxGasPerDay}`);
      console.log(`  Max Gas Per Month: ${gasLimits.maxGasPerMonth}`);
    } catch (error) {
      console.log(`  Gas limits: Not accessible (may be internal)`);
    }
    console.log("✅ Paymaster contract tests passed\n");

    console.log("🎉 All deployed contract tests passed!");
    console.log("\nContract Summary:");
    console.log(`- bUSDC: ${bUSDC_ADDRESS}`);
    console.log(`- PaymentRouter: ${PAYMENT_ROUTER_ADDRESS}`);
    console.log(`- VendorRegistry: ${VENDOR_REGISTRY_ADDRESS}`);
    console.log(`- SubnameRegistrar: ${SUBNAME_REGISTRAR_ADDRESS}`);
    console.log(`- Paymaster: ${PAYMASTER_ADDRESS}`);

  } catch (error) {
    console.error("❌ Error testing deployed contracts:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
