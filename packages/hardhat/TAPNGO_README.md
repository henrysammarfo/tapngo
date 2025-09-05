# Tap&Go Pay Smart Contracts

This directory contains the smart contracts for Tap&Go Pay, a Web3 fintech application that enables NFC-based payments using ENS subnames, Ethereum Follow Protocol (EFP), and bUSDC stablecoin on Base Sepolia.

## 📋 Contract Overview

### Core Contracts

1. **bUSDC.sol** - Test stablecoin with faucet functionality
2. **VendorRegistry.sol** - Vendor profile management and verification
3. **SubnameRegistrar.sol** - ENS subname registration for vendors
4. **PaymentRouter.sol** - Payment processing and receipt management
5. **Paymaster.sol** - ERC-4337 gas sponsorship for verified users

## 🚀 Quick Start

### Prerequisites

- Node.js and Yarn installed
- Hardhat configured for Base Sepolia
- Sufficient ETH for deployment gas fees

### Deployment

```bash
# Deploy all contracts
yarn deploy --network baseSepolia

# Deploy individual contracts
yarn deploy --tags bUSDC --network baseSepolia
yarn deploy --tags VendorRegistry --network baseSepolia
yarn deploy --tags SubnameRegistrar --network baseSepolia
yarn deploy --tags PaymentRouter --network baseSepolia
yarn deploy --tags Paymaster --network baseSepolia
```

### Testing

```bash
# Run all tests
yarn test

# Run specific contract tests
yarn test bUSDC.test.ts
yarn test VendorRegistry.test.ts
yarn test PaymentRouter.test.ts
```

## 📖 Contract Details

### bUSDC.sol

**Purpose**: Test stablecoin for Tap&Go Pay on Base Sepolia

**Key Features**:
- ERC20 token with 6 decimals (like real USDC)
- Mintable by owner for testing
- Faucet functionality with 24-hour cooldown
- Pausable for emergency situations
- Maximum supply of 1 billion tokens

**Key Functions**:
- `mint(address to, uint256 amount)` - Mint tokens (owner only)
- `claimFaucet()` - Claim 1000 tokens (24h cooldown)
- `canClaimFaucet(address user)` - Check faucet eligibility

### VendorRegistry.sol

**Purpose**: Manages vendor profiles and verification status

**Key Features**:
- Vendor registration with ENS names and business info
- Phone verification tracking
- EFP (Ethereum Follow Protocol) verification
- EFPas reputation score integration
- Admin approval/suspension system

**Vendor Status Flow**:
1. `Pending` - Vendor registered, awaiting approval
2. `Active` - Vendor approved and can accept payments
3. `Suspended` - Vendor temporarily suspended
4. `Rejected` - Vendor registration rejected

**Key Functions**:
- `registerVendor(string ensName, string businessName, string phoneHash)` - Register new vendor
- `approveVendor(address vendor)` - Approve vendor (admin only)
- `updatePhoneVerification(address vendor, bool verified)` - Update phone status
- `updateEFPVerification(address vendor, bool verified)` - Update EFP status

### SubnameRegistrar.sol

**Purpose**: Manages ENS subnames under .tapngo.eth for verified vendors

**Key Features**:
- Issues subnames only to registered vendors
- Integrates with ENS Registry and Resolver
- Tracks subname ownership
- Supports subname transfers

**Key Functions**:
- `registerSubname(string subname)` - Register ENS subname (vendor only)
- `transferSubname(string subname, address newOwner)` - Transfer subname
- `revokeSubname(string subname)` - Revoke subname (admin only)

### PaymentRouter.sol

**Purpose**: Handles bUSDC payments between buyers and vendors

**Key Features**:
- Quick Pay (amount only) and Invoice Pay (with metadata)
- Exchange rate management (GHS to USDC)
- Platform fee collection
- Receipt generation with on-chain events
- Payment status tracking (Pending, Completed, Failed, Refunded)

**Payment Types**:
- `QuickPay` - Simple amount-only payment
- `InvoicePay` - Payment with JSON metadata

**Key Functions**:
- `initiateQuickPay(address vendor, uint256 amountGHS)` - Start quick payment
- `initiateInvoicePay(address vendor, uint256 amountGHS, string metadata)` - Start invoice payment
- `completePayment(bytes32 orderId)` - Complete payment (buyer only)
- `refundPayment(bytes32 orderId)` - Refund payment (admin only)

### Paymaster.sol

**Purpose**: ERC-4337 Paymaster for gasless transactions

**Key Features**:
- Sponsors gas for verified users and vendors
- Daily and monthly gas limits per user
- Whitelist system for unlimited gas
- Integration with ERC-4337 EntryPoint

**Gas Limits**:
- Max gas per transaction: 500,000
- Max gas per day: 2,000,000
- Max gas per month: 50,000,000

**Key Functions**:
- `validatePaymasterUserOp()` - Validate user operations
- `postOp()` - Post-operation callback
- `setWhitelistedUser(address user, bool whitelisted)` - Manage whitelist

## 🔧 Configuration

### Network Configuration

The contracts are configured for Base Sepolia testnet:

```typescript
// hardhat.config.ts
baseSepolia: {
  url: "https://sepolia.base.org",
  accounts: [deployerPrivateKey],
}
```

### Contract Addresses

After deployment, contract addresses will be available in:
- `packages/nextjs/contracts/deployedContracts.ts`
- `packages/hardhat/deployments/baseSepolia/`

### Environment Variables

Required environment variables:
```bash
# .env
ALCHEMY_API_KEY=your_alchemy_api_key
__RUNTIME_DEPLOYER_PRIVATE_KEY=your_private_key
ETHERSCAN_V2_API_KEY=your_etherscan_api_key
```

## 📊 Integration Points

### Frontend Integration

The contracts integrate with the Scaffold-ETH 2 frontend through:

1. **Contract Hooks**:
   - `useScaffoldReadContract` - Read contract data
   - `useScaffoldWriteContract` - Write to contracts
   - `useScaffoldEventHistory` - Listen to events

2. **Contract Data**:
   - `deployedContracts.ts` - Contract addresses and ABIs
   - `externalContracts.ts` - External contract configurations

### Backend Integration

The contracts emit events that can be indexed by the backend:

1. **Vendor Events**:
   - `VendorRegistered`
   - `VendorApproved`
   - `VendorSuspended`

2. **Payment Events**:
   - `PaymentInitiated`
   - `PaymentCompleted`
   - `PaymentFailed`
   - `PaymentRefunded`

3. **Receipt Events**:
   - All payment data stored on-chain for transparency

## 🛡️ Security Considerations

### Access Control
- All admin functions protected by `onlyOwner` modifier
- Vendor-specific functions require vendor verification
- Payment completion restricted to buyers

### Pausable Contracts
- All contracts implement pausable functionality
- Emergency stop mechanism for critical functions

### Reentrancy Protection
- PaymentRouter uses `ReentrancyGuard`
- Safe external calls with proper error handling

### Input Validation
- Comprehensive parameter validation
- Zero address checks
- Amount validation (non-zero, within limits)

## 🧪 Testing

### Test Coverage

Each contract has comprehensive test suites covering:

- **Deployment**: Constructor parameters and initial state
- **Core Functionality**: Main contract features
- **Access Control**: Permission-based functions
- **Edge Cases**: Error conditions and boundary cases
- **Events**: Event emission verification
- **Integration**: Contract interactions

### Running Tests

```bash
# Run all tests with gas reporting
yarn test

# Run specific test file
yarn test VendorRegistry.test.ts

# Run tests with coverage
yarn coverage
```

## 📈 Gas Optimization

### Optimizations Applied

1. **Packed Structs**: Efficient storage layout
2. **Batch Operations**: Multiple operations in single transaction
3. **Event Optimization**: Minimal event data
4. **Function Visibility**: Appropriate visibility levels

### Gas Estimates

Approximate gas costs (Base Sepolia):
- Vendor registration: ~200,000 gas
- Payment initiation: ~150,000 gas
- Payment completion: ~300,000 gas
- ENS subname registration: ~500,000 gas

## 🔄 Upgrade Path

### Current Architecture
- All contracts are non-upgradeable for security
- State management through events and external storage

### Future Considerations
- Proxy patterns for upgradeable contracts
- Modular architecture for feature additions
- Cross-chain compatibility layer

## 📞 Support

For questions or issues:

1. Check the test files for usage examples
2. Review the contract documentation
3. Examine the deployment scripts
4. Consult the Scaffold-ETH 2 documentation

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Scaffold-ETH 2**
