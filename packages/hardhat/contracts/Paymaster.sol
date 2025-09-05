//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VendorRegistry.sol";

// UserOperation structure (ERC-4337)
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

// ERC-4337 interfaces (simplified for Base Sepolia)
interface IEntryPoint {
    function getSenderAddress(bytes memory initCode) external;
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external;
    function depositTo(address account) external payable;
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external;
}

interface IAccount {
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds) external returns (uint256 validationData);
}

/**
 * @title Paymaster
 * @dev ERC-4337 Paymaster for sponsoring gas fees for verified users and vendors
 * Implements gasless transactions for Tap&Go Pay users
 */
contract Paymaster is Ownable, Pausable, ReentrancyGuard {
    
    // Gas sponsorship limits
    struct GasLimits {
        uint256 maxGasPerTransaction;    // Maximum gas per transaction
        uint256 maxGasPerDay;           // Maximum gas per day per user
        uint256 maxGasPerMonth;         // Maximum gas per month per user
    }
    
    // User gas usage tracking
    struct UserGasUsage {
        uint256 dailyUsage;             // Gas used today
        uint256 monthlyUsage;           // Gas used this month
        uint256 lastDailyReset;         // Last daily reset timestamp
        uint256 lastMonthlyReset;       // Last monthly reset timestamp
        bool isWhitelisted;             // Whether user is whitelisted for unlimited gas
    }
    
    // State variables
    VendorRegistry public vendorRegistry;
    IEntryPoint public entryPoint;
    
    // Gas limits
    GasLimits public gasLimits;
    
    // User tracking
    mapping(address => UserGasUsage) public userGasUsage;
    mapping(address => bool) public whitelistedUsers; // Users with unlimited gas
    
    // Daily and monthly limits
    uint256 public constant DAY_IN_SECONDS = 86400;
    uint256 public constant MONTH_IN_SECONDS = 2592000; // 30 days
    
    // Events
    event GasSponsored(
        address indexed user,
        uint256 gasUsed,
        uint256 gasPrice,
        uint256 totalCost
    );
    
    event GasLimitsUpdated(
        uint256 maxGasPerTransaction,
        uint256 maxGasPerDay,
        uint256 maxGasPerMonth
    );
    
    event UserWhitelisted(address indexed user, bool whitelisted);
    event PaymasterDeposited(uint256 amount);
    event PaymasterWithdrawn(uint256 amount);
    
    // Modifiers
    modifier onlyEntryPoint() {
        require(msg.sender == address(entryPoint), "Paymaster: Only EntryPoint can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == owner(), "Paymaster: Only admin can call this function");
        _;
    }
    
    constructor(
        address _vendorRegistry,
        address _entryPoint
    ) Ownable(msg.sender) {
        vendorRegistry = VendorRegistry(_vendorRegistry);
        entryPoint = IEntryPoint(_entryPoint);
        
        // Set default gas limits
        gasLimits = GasLimits({
            maxGasPerTransaction: 500000,  // 500k gas per transaction
            maxGasPerDay: 2000000,         // 2M gas per day
            maxGasPerMonth: 50000000       // 50M gas per month
        });
    }
    
    /**
     * @dev Validate a user operation and sponsor gas if eligible
     * This is called by the EntryPoint during transaction validation
     * @param userOp User operation to validate
     * @param userOpHash Hash of the user operation
     * @param maxCost Maximum cost the paymaster is willing to pay
     * @return context Context data for post-operation
     * @return validationData Validation data (0 = success)
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external onlyEntryPoint whenNotPaused returns (bytes memory context, uint256 validationData) {
        address sender = userOp.sender;
        
        // Check if user is eligible for gas sponsorship
        if (!_isEligibleForGasSponsorship(sender)) {
            return ("", 1); // Reject the operation
        }
        
        // Check gas limits
        if (!_checkGasLimits(sender, userOp.callGasLimit)) {
            return ("", 1); // Reject the operation
        }
        
        // Check if paymaster has sufficient balance
        if (address(this).balance < maxCost) {
            return ("", 1); // Reject the operation
        }
        
        // Return success with context
        context = abi.encode(sender, maxCost);
        validationData = 0; // Success
    }
    
    /**
     * @dev Post-operation callback (called after transaction execution)
     * @param context Context data from validatePaymasterUserOp
     * @param actualGasCost Actual gas cost of the transaction
     */
    function postOp(
        bytes calldata context,
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 actualGasCost
    ) external onlyEntryPoint {
        (address sender, uint256 maxCost) = abi.decode(context, (address, uint256));
        
        // Update user gas usage
        _updateUserGasUsage(sender, actualGasCost);
        
        // Emit event
        emit GasSponsored(sender, actualGasCost, userOp.maxFeePerGas, actualGasCost);
    }
    
    /**
     * @dev Check if a user is eligible for gas sponsorship
     * @param user User address to check
     * @return eligible True if user is eligible
     */
    function _isEligibleForGasSponsorship(address user) internal view returns (bool eligible) {
        // Whitelisted users get unlimited gas
        if (whitelistedUsers[user]) {
            return true;
        }
        
        // Check if user is a registered vendor
        if (vendorRegistry.isVendor(user)) {
            return true;
        }
        
        // For now, allow all users (can be restricted later)
        return true;
    }
    
    /**
     * @dev Check if user's gas usage is within limits
     * @param user User address
     * @param gasToUse Gas that will be used
     * @return withinLimits True if within limits
     */
    function _checkGasLimits(address user, uint256 gasToUse) internal view returns (bool withinLimits) {
        // Whitelisted users have no limits
        if (whitelistedUsers[user]) {
            return true;
        }
        
        // Check transaction gas limit
        if (gasToUse > gasLimits.maxGasPerTransaction) {
            return false;
        }
        
        UserGasUsage memory usage = userGasUsage[user];
        
        // Reset daily usage if needed
        if (block.timestamp >= usage.lastDailyReset + DAY_IN_SECONDS) {
            usage.dailyUsage = 0;
        }
        
        // Reset monthly usage if needed
        if (block.timestamp >= usage.lastMonthlyReset + MONTH_IN_SECONDS) {
            usage.monthlyUsage = 0;
        }
        
        // Check daily limit
        if (usage.dailyUsage + gasToUse > gasLimits.maxGasPerDay) {
            return false;
        }
        
        // Check monthly limit
        if (usage.monthlyUsage + gasToUse > gasLimits.maxGasPerMonth) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Update user's gas usage tracking
     * @param user User address
     * @param gasUsed Gas used in the transaction
     */
    function _updateUserGasUsage(address user, uint256 gasUsed) internal {
        UserGasUsage storage usage = userGasUsage[user];
        
        // Reset daily usage if needed
        if (block.timestamp >= usage.lastDailyReset + DAY_IN_SECONDS) {
            usage.dailyUsage = 0;
            usage.lastDailyReset = block.timestamp;
        }
        
        // Reset monthly usage if needed
        if (block.timestamp >= usage.lastMonthlyReset + MONTH_IN_SECONDS) {
            usage.monthlyUsage = 0;
            usage.lastMonthlyReset = block.timestamp;
        }
        
        // Update usage
        usage.dailyUsage += gasUsed;
        usage.monthlyUsage += gasUsed;
    }
    
    /**
     * @dev Deposit ETH to the paymaster for gas sponsorship
     */
    function deposit() external payable onlyAdmin {
        require(msg.value > 0, "Paymaster: Deposit amount must be positive");
        
        // Deposit to EntryPoint
        entryPoint.depositTo{value: msg.value}(address(this));
        
        emit PaymasterDeposited(msg.value);
    }
    
    /**
     * @dev Withdraw ETH from the paymaster
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyAdmin nonReentrant {
        require(amount > 0, "Paymaster: Withdraw amount must be positive");
        require(amount <= address(this).balance, "Paymaster: Insufficient balance");
        
        // Withdraw from EntryPoint
        entryPoint.withdrawTo(payable(owner()), amount);
        
        emit PaymasterWithdrawn(amount);
    }
    
    /**
     * @dev Update gas limits (admin only)
     * @param maxGasPerTransaction Maximum gas per transaction
     * @param maxGasPerDay Maximum gas per day per user
     * @param maxGasPerMonth Maximum gas per month per user
     */
    function updateGasLimits(
        uint256 maxGasPerTransaction,
        uint256 maxGasPerDay,
        uint256 maxGasPerMonth
    ) external onlyAdmin {
        require(maxGasPerTransaction > 0, "Paymaster: Max gas per transaction must be positive");
        require(maxGasPerDay > 0, "Paymaster: Max gas per day must be positive");
        require(maxGasPerMonth > 0, "Paymaster: Max gas per month must be positive");
        
        gasLimits = GasLimits({
            maxGasPerTransaction: maxGasPerTransaction,
            maxGasPerDay: maxGasPerDay,
            maxGasPerMonth: maxGasPerMonth
        });
        
        emit GasLimitsUpdated(maxGasPerTransaction, maxGasPerDay, maxGasPerMonth);
    }
    
    /**
     * @dev Whitelist/unwhitelist a user for unlimited gas
     * @param user User address
     * @param whitelisted Whether to whitelist the user
     */
    function setWhitelistedUser(address user, bool whitelisted) external onlyAdmin {
        require(user != address(0), "Paymaster: User address cannot be zero");
        
        whitelistedUsers[user] = whitelisted;
        userGasUsage[user].isWhitelisted = whitelisted;
        
        emit UserWhitelisted(user, whitelisted);
    }
    
    /**
     * @dev Get user's current gas usage
     * @param user User address
     * @return dailyUsage Gas used today
     * @return monthlyUsage Gas used this month
     * @return dailyLimit Daily gas limit
     * @return monthlyLimit Monthly gas limit
     */
    function getUserGasUsage(address user) external view returns (
        uint256 dailyUsage,
        uint256 monthlyUsage,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) {
        UserGasUsage memory usage = userGasUsage[user];
        
        // Reset daily usage if needed
        if (block.timestamp >= usage.lastDailyReset + DAY_IN_SECONDS) {
            usage.dailyUsage = 0;
        }
        
        // Reset monthly usage if needed
        if (block.timestamp >= usage.lastMonthlyReset + MONTH_IN_SECONDS) {
            usage.monthlyUsage = 0;
        }
        
        return (
            usage.dailyUsage,
            usage.monthlyUsage,
            gasLimits.maxGasPerDay,
            gasLimits.maxGasPerMonth
        );
    }
    
    /**
     * @dev Check if user can perform a transaction with given gas
     * @param user User address
     * @param gasToUse Gas that will be used
     * @return canPerform True if user can perform the transaction
     */
    function canPerformTransaction(address user, uint256 gasToUse) external view returns (bool canPerform) {
        return _isEligibleForGasSponsorship(user) && _checkGasLimits(user, gasToUse);
    }
    
    /**
     * @dev Get paymaster balance in EntryPoint
     * @return balance Paymaster balance
     */
    function getPaymasterBalance() external view returns (uint256 balance) {
        return address(this).balance;
    }
    
    /**
     * @dev Pause the paymaster (admin only)
     */
    function pause() external onlyAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause the paymaster (admin only)
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw all funds (admin only)
     */
    function emergencyWithdraw() external onlyAdmin nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Paymaster: No funds to withdraw");
        
        entryPoint.withdrawTo(payable(owner()), balance);
        
        emit PaymasterWithdrawn(balance);
    }
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        // Automatically deposit to EntryPoint
        if (msg.value > 0) {
            entryPoint.depositTo{value: msg.value}(address(this));
            emit PaymasterDeposited(msg.value);
        }
    }
}
