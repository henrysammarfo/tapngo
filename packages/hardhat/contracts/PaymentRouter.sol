//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./bUSDC.sol";
import "./VendorRegistry.sol";

/**
 * @title PaymentRouter
 * @dev Handles bUSDC payments between buyers and vendors
 * Supports Quick Pay (amount only) and Invoice Pay (with metadata)
 * Emits Receipt events for transaction tracking
 */
contract PaymentRouter is Ownable, Pausable, ReentrancyGuard {
    // Payment types
    enum PaymentType {
        QuickPay,    // 0 - Simple amount-only payment
        InvoicePay   // 1 - Payment with invoice metadata
    }
    
    // Payment status
    enum PaymentStatus {
        Pending,     // 0 - Payment initiated but not completed
        Completed,   // 1 - Payment successfully completed
        Failed,      // 2 - Payment failed
        Refunded     // 3 - Payment was refunded
    }
    
    // Receipt structure for on-chain payment records
    struct Receipt {
        bytes32 orderId;           // Unique order identifier
        string vendorENS;          // Vendor's ENS name
        address buyer;             // Buyer's address
        address vendor;            // Vendor's address
        uint256 amountGHS;         // Amount in GHS (for display)
        uint256 amountUSDC;        // Amount in bUSDC (actual payment)
        uint256 fxRate;            // Exchange rate used (GHS to USDC)
        uint256 timestamp;         // Payment timestamp
        PaymentType paymentType;   // Type of payment
        PaymentStatus status;      // Payment status
        string metadata;           // Additional metadata (JSON string)
    }
    
    // State variables
    bUSDC public busdcToken;
    VendorRegistry public vendorRegistry;
    
    // Exchange rate management
    uint256 public currentFxRate = 1e6; // 1 GHS = 1 USDC (6 decimals) - default rate
    address public fxRateUpdater; // Address allowed to update exchange rates
    
    // Fee structure
    uint256 public platformFeeBps = 25; // 0.25% platform fee (25 basis points)
    address public feeRecipient; // Address to receive platform fees
    
    // Payment tracking
    mapping(bytes32 => Receipt) public receipts; // orderId -> Receipt
    mapping(address => bytes32[]) public userReceipts; // user -> array of orderIds
    mapping(address => uint256) public vendorEarnings; // vendor -> total earnings
    
    // Order ID generation
    uint256 private orderCounter = 0;
    
    // Events
    event PaymentInitiated(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed vendor,
        uint256 amountUSDC,
        PaymentType paymentType
    );
    
    event PaymentCompleted(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed vendor,
        uint256 amountUSDC,
        uint256 platformFee,
        uint256 vendorAmount
    );
    
    event PaymentFailed(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed vendor,
        string reason
    );
    
    event PaymentRefunded(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed vendor,
        uint256 amountUSDC
    );
    
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    
    // Modifiers
    modifier onlyActiveVendor(address vendor) {
        require(vendorRegistry.isActiveVendor(vendor), "PaymentRouter: Vendor not active");
        _;
    }
    
    modifier onlyFxRateUpdater() {
        require(msg.sender == fxRateUpdater || msg.sender == owner(), "PaymentRouter: Not authorized to update exchange rate");
        _;
    }
    
    modifier validOrderId(bytes32 orderId) {
        require(receipts[orderId].orderId != bytes32(0), "PaymentRouter: Invalid order ID");
        _;
    }
    
    constructor(
        address _busdcToken,
        address _vendorRegistry,
        address _feeRecipient
    ) Ownable(msg.sender) {
        busdcToken = bUSDC(_busdcToken);
        vendorRegistry = VendorRegistry(_vendorRegistry);
        feeRecipient = _feeRecipient;
        fxRateUpdater = msg.sender;
    }
    
    /**
     * @dev Initiate a Quick Pay transaction
     * @param vendor Vendor's address
     * @param amountGHS Amount in GHS
     * @return orderId Generated order ID
     */
    function initiateQuickPay(
        address vendor,
        uint256 amountGHS
    ) external onlyActiveVendor(vendor) whenNotPaused returns (bytes32 orderId) {
        uint256 amountUSDC = (amountGHS * currentFxRate) / 1e6;
        require(amountUSDC > 0, "PaymentRouter: Amount too small");
        
        orderId = _generateOrderId();
        
        // Create receipt
        receipts[orderId] = Receipt({
            orderId: orderId,
            vendorENS: _getVendorENS(vendor),
            buyer: msg.sender,
            vendor: vendor,
            amountGHS: amountGHS,
            amountUSDC: amountUSDC,
            fxRate: currentFxRate,
            timestamp: block.timestamp,
            paymentType: PaymentType.QuickPay,
            status: PaymentStatus.Pending,
            metadata: ""
        });
        
        userReceipts[msg.sender].push(orderId);
        userReceipts[vendor].push(orderId);
        
        emit PaymentInitiated(orderId, msg.sender, vendor, amountUSDC, PaymentType.QuickPay);
        
        return orderId;
    }
    
    /**
     * @dev Initiate an Invoice Pay transaction with metadata
     * @param vendor Vendor's address
     * @param amountGHS Amount in GHS
     * @param metadata JSON string with invoice details
     * @return orderId Generated order ID
     */
    function initiateInvoicePay(
        address vendor,
        uint256 amountGHS,
        string memory metadata
    ) external onlyActiveVendor(vendor) whenNotPaused returns (bytes32 orderId) {
        uint256 amountUSDC = (amountGHS * currentFxRate) / 1e6;
        require(amountUSDC > 0, "PaymentRouter: Amount too small");
        require(bytes(metadata).length > 0, "PaymentRouter: Metadata cannot be empty");
        
        orderId = _generateOrderId();
        
        // Create receipt
        receipts[orderId] = Receipt({
            orderId: orderId,
            vendorENS: _getVendorENS(vendor),
            buyer: msg.sender,
            vendor: vendor,
            amountGHS: amountGHS,
            amountUSDC: amountUSDC,
            fxRate: currentFxRate,
            timestamp: block.timestamp,
            paymentType: PaymentType.InvoicePay,
            status: PaymentStatus.Pending,
            metadata: metadata
        });
        
        userReceipts[msg.sender].push(orderId);
        userReceipts[vendor].push(orderId);
        
        emit PaymentInitiated(orderId, msg.sender, vendor, amountUSDC, PaymentType.InvoicePay);
        
        return orderId;
    }
    
    /**
     * @dev Complete a payment by transferring bUSDC tokens
     * @param orderId Order ID to complete
     */
    function completePayment(bytes32 orderId) external nonReentrant validOrderId(orderId) {
        Receipt storage receipt = receipts[orderId];
        require(receipt.status == PaymentStatus.Pending, "PaymentRouter: Payment not pending");
        require(receipt.buyer == msg.sender, "PaymentRouter: Only buyer can complete payment");
        
        // Check buyer has sufficient balance
        require(
            busdcToken.balanceOf(msg.sender) >= receipt.amountUSDC,
            "PaymentRouter: Insufficient bUSDC balance"
        );
        
        // Calculate fees
        uint256 platformFee = (receipt.amountUSDC * platformFeeBps) / 10000;
        uint256 vendorAmount = receipt.amountUSDC - platformFee;
        
        // Transfer tokens
        require(
            busdcToken.transferFrom(msg.sender, address(this), receipt.amountUSDC),
            "PaymentRouter: Transfer failed"
        );
        
        // Distribute payment
        if (platformFee > 0) {
            require(
                busdcToken.transfer(feeRecipient, platformFee),
                "PaymentRouter: Fee transfer failed"
            );
        }
        
        require(
            busdcToken.transfer(receipt.vendor, vendorAmount),
            "PaymentRouter: Vendor transfer failed"
        );
        
        // Update receipt and vendor earnings
        receipt.status = PaymentStatus.Completed;
        vendorEarnings[receipt.vendor] += vendorAmount;
        
        emit PaymentCompleted(orderId, receipt.buyer, receipt.vendor, receipt.amountUSDC, platformFee, vendorAmount);
    }
    
    /**
     * @dev Mark a payment as failed (admin or vendor only)
     * @param orderId Order ID to mark as failed
     * @param reason Reason for failure
     */
    function markPaymentFailed(bytes32 orderId, string memory reason) external validOrderId(orderId) {
        Receipt storage receipt = receipts[orderId];
        require(receipt.status == PaymentStatus.Pending, "PaymentRouter: Payment not pending");
        require(
            msg.sender == receipt.vendor || msg.sender == owner(),
            "PaymentRouter: Only vendor or admin can mark as failed"
        );
        
        receipt.status = PaymentStatus.Failed;
        
        emit PaymentFailed(orderId, receipt.buyer, receipt.vendor, reason);
    }
    
    /**
     * @dev Refund a completed payment (admin only)
     * @param orderId Order ID to refund
     */
    function refundPayment(bytes32 orderId) external onlyOwner validOrderId(orderId) nonReentrant {
        Receipt storage receipt = receipts[orderId];
        require(receipt.status == PaymentStatus.Completed, "PaymentRouter: Payment not completed");
        
        // Calculate refund amount (full amount, fees are not refunded)
        uint256 refundAmount = receipt.amountUSDC;
        
        // Transfer refund to buyer
        require(
            busdcToken.transfer(receipt.buyer, refundAmount),
            "PaymentRouter: Refund transfer failed"
        );
        
        // Update receipt and vendor earnings
        receipt.status = PaymentStatus.Refunded;
        vendorEarnings[receipt.vendor] -= refundAmount;
        
        emit PaymentRefunded(orderId, receipt.buyer, receipt.vendor, refundAmount);
    }
    
    /**
     * @dev Update exchange rate (GHS to USDC)
     * @param newRate New exchange rate (6 decimals)
     */
    function updateExchangeRate(uint256 newRate) external onlyFxRateUpdater {
        require(newRate > 0, "PaymentRouter: Exchange rate must be positive");
        
        uint256 oldRate = currentFxRate;
        currentFxRate = newRate;
        
        emit ExchangeRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Update platform fee
     * @param newFeeBps New fee in basis points (100 = 1%)
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "PaymentRouter: Fee cannot exceed 10%");
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }
    
    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "PaymentRouter: Fee recipient cannot be zero address");
        
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }
    
    /**
     * @dev Update FX rate updater address
     * @param newUpdater New FX rate updater address
     */
    function updateFxRateUpdater(address newUpdater) external onlyOwner {
        require(newUpdater != address(0), "PaymentRouter: FX rate updater cannot be zero address");
        fxRateUpdater = newUpdater;
    }
    
    /**
     * @dev Get receipt by order ID
     * @param orderId Order ID to query
     * @return receipt Receipt struct
     */
    function getReceipt(bytes32 orderId) external view validOrderId(orderId) returns (Receipt memory receipt) {
        return receipts[orderId];
    }
    
    /**
     * @dev Get user's receipt IDs
     * @param user User address
     * @param offset Starting index
     * @param limit Maximum number of receipts to return
     * @return orderIds Array of order IDs
     */
    function getUserReceipts(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory orderIds) {
        bytes32[] storage userReceiptList = userReceipts[user];
        require(offset < userReceiptList.length, "PaymentRouter: Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > userReceiptList.length) {
            end = userReceiptList.length;
        }
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = userReceiptList[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get vendor's total earnings
     * @param vendor Vendor address
     * @return earnings Total earnings in bUSDC
     */
    function getVendorEarnings(address vendor) external view returns (uint256 earnings) {
        return vendorEarnings[vendor];
    }
    
    /**
     * @dev Calculate amount in USDC from GHS
     * @param amountGHS Amount in GHS
     * @return amountUSDC Amount in bUSDC
     */
    function calculateUSDCAmount(uint256 amountGHS) external view returns (uint256 amountUSDC) {
        return (amountGHS * currentFxRate) / 1e6;
    }
    
    /**
     * @dev Generate unique order ID
     * @return orderId Generated order ID
     */
    function _generateOrderId() internal returns (bytes32 orderId) {
        orderCounter++;
        return keccak256(abi.encodePacked(
            block.timestamp,
            block.number,
            msg.sender,
            orderCounter
        ));
    }
    
    /**
     * @dev Get vendor's ENS name
     * @param vendor Vendor address
     * @return ensName Vendor's ENS name
     */
    function _getVendorENS(address vendor) internal view returns (string memory ensName) {
        VendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(vendor);
        return profile.ensName;
    }
    
    /**
     * @dev Pause the contract (admin only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (admin only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (admin only)
     * @param token Token address to withdraw (0 for ETH)
     * @param amount Amount to withdraw (0 for all)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            // Withdraw ETH
            uint256 ethAmount = amount == 0 ? address(this).balance : amount;
            require(ethAmount > 0, "PaymentRouter: No ETH to withdraw");
            
            (bool success, ) = payable(owner()).call{value: ethAmount}("");
            require(success, "PaymentRouter: ETH withdrawal failed");
        } else {
            // Withdraw ERC20 tokens
            require(token == address(busdcToken), "PaymentRouter: Can only withdraw bUSDC");
            
            uint256 tokenAmount = amount == 0 ? busdcToken.balanceOf(address(this)) : amount;
            require(tokenAmount > 0, "PaymentRouter: No tokens to withdraw");
            
            require(busdcToken.transfer(owner(), tokenAmount), "PaymentRouter: Token withdrawal failed");
        }
    }
}
