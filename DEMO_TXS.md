# Tap&Go Pay - Base Sepolia Deployment Transactions

## Contract Deployment Summary

The Tap&Go Pay smart contracts have been successfully deployed to Base Sepolia testnet. Below are the deployment transaction details with explorer links.

### Network Information
- **Network**: Base Sepolia
- **Chain ID**: 84532
- **Explorer**: https://sepolia.basescan.org/

### Deployed Contracts

#### 1. bUSDC Token Contract
- **Contract Address**: `0xeb9361Ec0d712C5B12965FB91c409262b7d6703c`
- **Transaction Hash**: `0x37eac141450b979669316af99976193a46b016f8f9de382531a95485b995b8ac`
- **Block Number**: 30637627
- **Explorer Link**: https://sepolia.basescan.org/address/0xeb9361Ec0d712C5B12965FB91c409262b7d6703c
- **Transaction Link**: https://sepolia.basescan.org/tx/0x37eac141450b979669316af99976193a46b016f8f9de382531a95485b995b8ac
- **Description**: Base USDC Test Token - A mintable ERC20 token for testing Tap&Go Pay functionality

#### 2. PaymentRouter Contract
- **Contract Address**: `0x0598c74C30e4e70fb6Cd7cd63c3DDE74756EAb73`
- **Explorer Link**: https://sepolia.basescan.org/address/0x0598c74C30e4e70fb6Cd7cd63c3DDE74756EAb73
- **Description**: Handles bUSDC payments and emits Receipt events. Supports Quick Pay and Invoice Pay functionality.

#### 3. VendorRegistry Contract
- **Contract Address**: `0xA9F04F020CF9F511982719196E25FE7c666c9E4D`
- **Explorer Link**: https://sepolia.basescan.org/address/0xA9F04F020CF9F511982719196E25FE7c666c9E4D
- **Description**: Vendor profile store requiring phone verification and EFP verification. Emits events for vendor onboarding.

#### 4. SubnameRegistrar Contract
- **Contract Address**: `0x75c4D11F142bB29996B11533e6EF9f741c45De7C`
- **Explorer Link**: https://sepolia.basescan.org/address/0x75c4D11F142bB29996B11533e6EF9f741c45De7C
- **Description**: Issues .tapandgo.eth subnames for vendors. Restricted to vendors registered in VendorRegistry.

#### 5. Paymaster Contract
- **Contract Address**: `0x23E3d0017A282f48bF80dE2A6E670f57be2C9152`
- **Explorer Link**: https://sepolia.basescan.org/address/0x23E3d0017A282f48bF80dE2A6E670f57be2C9152
- **Description**: Sponsors gas for verified users/vendors with daily usage limits.
- **Gas Limits**:
  - Max Gas Per Transaction: 500,000
  - Max Gas Per Day: 2,000,000
  - Max Gas Per Month: 50,000,000

### Deployment Artifacts

All deployment artifacts are stored in:
- `packages/hardhat/deployments/baseSepolia/`

### Contract Verification Status

Contracts are deployed but may need verification on BaseScan. To verify:

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Test Transactions

#### Faucet Claim Example
- **Function**: `claimFaucet()`
- **Contract**: bUSDC (0xeb9361Ec0d712C5B12965FB91c409262b7d6703c)
- **Description**: Users can claim 1000 bUSDC tokens every 24 hours

#### Payment Example
- **Function**: `processPayment()`
- **Contract**: PaymentRouter (0x0598c74C30e4e70fb6Cd7cd63c3DDE74756EAb73)
- **Description**: Process payments between users and vendors

### Network Configuration

```javascript
// Base Sepolia Network Config
{
  name: "baseSepolia",
  chainId: 84532,
  rpcUrl: "https://sepolia.base.org",
  explorerUrl: "https://sepolia.basescan.org"
}
```

### Next Steps

1. **Contract Verification**: Verify all contracts on BaseScan
2. **Frontend Integration**: Update frontend to use deployed contract addresses
3. **Testing**: Run comprehensive tests against deployed contracts
4. **Documentation**: Update API documentation with contract addresses

### Security Notes

- These are testnet deployments for development and testing purposes
- All contracts use OpenZeppelin libraries for security
- Faucet has built-in cooldown and supply limits
- Vendor registration requires verification steps

### Support

For issues or questions about the deployment:
- Check the deployment logs in `packages/hardhat/deployments/baseSepolia/`
- Review contract source code in `packages/hardhat/contracts/`
- Test contracts using the provided test files

---

**Deployment Date**: September 6, 2025  
**Deployer**: 0xBab2d51d46042098690a9767339d7603C9F737C1  
**Network**: Base Sepolia (84532)
