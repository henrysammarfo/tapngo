//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VendorRegistry
 * @dev Registry for managing vendor profiles and verification status
 * Stores vendor information including ENS names, phone verification, EFP verification, and EFPas scores
 */
contract VendorRegistry is Ownable, Pausable {
    // Vendor status enum
    enum VendorStatus {
        Pending,    // 0 - Vendor registered but not approved
        Active,     // 1 - Vendor approved and active
        Suspended,  // 2 - Vendor suspended by admin
        Rejected    // 3 - Vendor registration rejected
    }
    
    // Vendor profile structure
    struct VendorProfile {
        address wallet;           // Vendor's wallet address
        string ensName;          // ENS subname (e.g., "business.tapngo.eth")
        string businessName;     // Business display name
        string phoneHash;        // Hashed phone number for verification
        bool phoneVerified;      // Phone verification status
        bool efpVerified;        // Ethereum Follow Protocol verification
        uint256 efpasScore;      // EFPas reputation score (0 if not available)
        VendorStatus status;     // Current vendor status
        uint256 registrationTime; // Timestamp of registration
        uint256 lastUpdated;     // Timestamp of last profile update
    }
    
    // State variables
    mapping(address => VendorProfile) public vendors;
    mapping(string => address) public ensToVendor; // ENS name -> vendor address
    mapping(string => bool) public usedPhoneHashes; // Track used phone hashes
    address[] public vendorAddresses; // Array of all vendor addresses
    
    // Verification requirements
    bool public requirePhoneVerification = true;
    bool public requireEFPVerification = true;
    uint256 public minEFPasScore = 0; // Minimum EFPas score required (0 = not required)
    
    // Events
    event VendorRegistered(
        address indexed vendor,
        string ensName,
        string businessName,
        string phoneHash
    );
    
    event VendorApproved(address indexed vendor, string ensName);
    event VendorSuspended(address indexed vendor, string reason);
    event VendorRejected(address indexed vendor, string reason);
    event VendorUpdated(address indexed vendor, string field);
    event PhoneVerified(address indexed vendor, string phoneHash);
    event EFPVerified(address indexed vendor, bool verified);
    event EFPasScoreUpdated(address indexed vendor, uint256 score);
    
    // Modifiers
    modifier onlyVendor() {
        require(vendors[msg.sender].wallet != address(0), "VendorRegistry: Not a registered vendor");
        _;
    }
    
    modifier onlyActiveVendor() {
        require(
            vendors[msg.sender].wallet != address(0) && 
            vendors[msg.sender].status == VendorStatus.Active,
            "VendorRegistry: Not an active vendor"
        );
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == owner(), "VendorRegistry: Only admin can call this function");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new vendor
     * @param ensName ENS subname for the vendor (e.g., "business.tapngo.eth")
     * @param businessName Display name of the business
     * @param phoneHash Hashed phone number
     */
    function registerVendor(
        string memory ensName,
        string memory businessName,
        string memory phoneHash
    ) external whenNotPaused {
        require(vendors[msg.sender].wallet == address(0), "VendorRegistry: Vendor already registered");
        require(bytes(ensName).length > 0, "VendorRegistry: ENS name cannot be empty");
        require(bytes(businessName).length > 0, "VendorRegistry: Business name cannot be empty");
        require(bytes(phoneHash).length > 0, "VendorRegistry: Phone hash cannot be empty");
        require(ensToVendor[ensName] == address(0), "VendorRegistry: ENS name already taken");
        require(!usedPhoneHashes[phoneHash], "VendorRegistry: Phone number already used");
        
        // Create vendor profile
        VendorProfile memory newVendor = VendorProfile({
            wallet: msg.sender,
            ensName: ensName,
            businessName: businessName,
            phoneHash: phoneHash,
            phoneVerified: false,
            efpVerified: false,
            efpasScore: 0,
            status: VendorStatus.Pending,
            registrationTime: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        vendors[msg.sender] = newVendor;
        ensToVendor[ensName] = msg.sender;
        usedPhoneHashes[phoneHash] = true;
        vendorAddresses.push(msg.sender);
        
        emit VendorRegistered(msg.sender, ensName, businessName, phoneHash);
    }
    
    /**
     * @dev Approve a vendor (admin only)
     * @param vendorAddress Address of the vendor to approve
     */
    function approveVendor(address vendorAddress) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        require(vendors[vendorAddress].status == VendorStatus.Pending, "VendorRegistry: Vendor not pending");
        
        // Check verification requirements
        if (requirePhoneVerification) {
            require(vendors[vendorAddress].phoneVerified, "VendorRegistry: Phone verification required");
        }
        if (requireEFPVerification) {
            require(vendors[vendorAddress].efpVerified, "VendorRegistry: EFP verification required");
        }
        if (minEFPasScore > 0) {
            require(vendors[vendorAddress].efpasScore >= minEFPasScore, "VendorRegistry: EFPas score too low");
        }
        
        vendors[vendorAddress].status = VendorStatus.Active;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit VendorApproved(vendorAddress, vendors[vendorAddress].ensName);
    }
    
    /**
     * @dev Suspend a vendor (admin only)
     * @param vendorAddress Address of the vendor to suspend
     * @param reason Reason for suspension
     */
    function suspendVendor(address vendorAddress, string memory reason) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        require(vendors[vendorAddress].status == VendorStatus.Active, "VendorRegistry: Vendor not active");
        
        vendors[vendorAddress].status = VendorStatus.Suspended;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit VendorSuspended(vendorAddress, reason);
    }
    
    /**
     * @dev Reject a vendor registration (admin only)
     * @param vendorAddress Address of the vendor to reject
     * @param reason Reason for rejection
     */
    function rejectVendor(address vendorAddress, string memory reason) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        require(vendors[vendorAddress].status == VendorStatus.Pending, "VendorRegistry: Vendor not pending");
        
        vendors[vendorAddress].status = VendorStatus.Rejected;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit VendorRejected(vendorAddress, reason);
    }
    
    /**
     * @dev Update vendor's phone verification status (admin only)
     * @param vendorAddress Address of the vendor
     * @param verified Verification status
     */
    function updatePhoneVerification(address vendorAddress, bool verified) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        
        vendors[vendorAddress].phoneVerified = verified;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit PhoneVerified(vendorAddress, vendors[vendorAddress].phoneHash);
    }
    
    /**
     * @dev Update vendor's EFP verification status (admin only)
     * @param vendorAddress Address of the vendor
     * @param verified Verification status
     */
    function updateEFPVerification(address vendorAddress, bool verified) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        
        vendors[vendorAddress].efpVerified = verified;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit EFPVerified(vendorAddress, verified);
    }
    
    /**
     * @dev Update vendor's EFPas score (admin only)
     * @param vendorAddress Address of the vendor
     * @param score EFPas reputation score
     */
    function updateEFPasScore(address vendorAddress, uint256 score) external onlyAdmin {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        
        vendors[vendorAddress].efpasScore = score;
        vendors[vendorAddress].lastUpdated = block.timestamp;
        
        emit EFPasScoreUpdated(vendorAddress, score);
    }
    
    /**
     * @dev Update business name (vendor only)
     * @param newBusinessName New business name
     */
    function updateBusinessName(string memory newBusinessName) external onlyVendor {
        require(bytes(newBusinessName).length > 0, "VendorRegistry: Business name cannot be empty");
        
        vendors[msg.sender].businessName = newBusinessName;
        vendors[msg.sender].lastUpdated = block.timestamp;
        
        emit VendorUpdated(msg.sender, "businessName");
    }
    
    /**
     * @dev Get vendor profile by address
     * @param vendorAddress Address of the vendor
     * @return profile Vendor profile struct
     */
    function getVendorProfile(address vendorAddress) external view returns (VendorProfile memory profile) {
        require(vendors[vendorAddress].wallet != address(0), "VendorRegistry: Vendor not found");
        return vendors[vendorAddress];
    }
    
    /**
     * @dev Get vendor address by ENS name
     * @param ensName ENS name to look up
     * @return vendorAddress Address of the vendor
     */
    function getVendorByENS(string memory ensName) external view returns (address vendorAddress) {
        return ensToVendor[ensName];
    }
    
    /**
     * @dev Check if an address is a registered vendor
     * @param vendorAddress Address to check
     * @return isRegistered True if address is a registered vendor
     */
    function isVendor(address vendorAddress) external view returns (bool isRegistered) {
        return vendors[vendorAddress].wallet != address(0);
    }
    
    /**
     * @dev Check if a vendor is active
     * @param vendorAddress Address to check
     * @return isActive True if vendor is active
     */
    function isActiveVendor(address vendorAddress) external view returns (bool isActive) {
        return vendors[vendorAddress].wallet != address(0) && 
               vendors[vendorAddress].status == VendorStatus.Active;
    }
    
    /**
     * @dev Get total number of registered vendors
     * @return count Total number of vendors
     */
    function getVendorCount() external view returns (uint256 count) {
        return vendorAddresses.length;
    }
    
    /**
     * @dev Get all vendor addresses (for pagination)
     * @param offset Starting index
     * @param limit Maximum number of addresses to return
     * @return addresses Array of vendor addresses
     */
    function getVendorAddresses(uint256 offset, uint256 limit) external view returns (address[] memory addresses) {
        require(offset < vendorAddresses.length, "VendorRegistry: Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > vendorAddresses.length) {
            end = vendorAddresses.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = vendorAddresses[i];
        }
        
        return result;
    }
    
    /**
     * @dev Update verification requirements (admin only)
     * @param phoneRequired Whether phone verification is required
     * @param efpRequired Whether EFP verification is required
     * @param minScore Minimum EFPas score required
     */
    function updateVerificationRequirements(
        bool phoneRequired,
        bool efpRequired,
        uint256 minScore
    ) external onlyAdmin {
        requirePhoneVerification = phoneRequired;
        requireEFPVerification = efpRequired;
        minEFPasScore = minScore;
    }
    
    /**
     * @dev Pause the contract (admin only)
     */
    function pause() external onlyAdmin {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (admin only)
     */
    function unpause() external onlyAdmin {
        _unpause();
    }
}
