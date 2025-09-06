//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./VendorRegistry.sol";

// Real ENS Registry interface (Sepolia)
interface ENSRegistry {
    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external;
    
    function setResolver(bytes32 node, address resolver) external;
    function setOwner(bytes32 node, address owner) external;
    function owner(bytes32 node) external view returns (address);
    function resolver(bytes32 node) external view returns (address);
}

// Real ENS Resolver interface (Sepolia)
interface ENSResolver {
    function setAddr(bytes32 node, address a) external;
    function setText(bytes32 node, string calldata key, string calldata value) external;
    function addr(bytes32 node) external view returns (address);
    function text(bytes32 node, string calldata key) external view returns (string memory);
}

/**
 * @title SubnameRegistrar
 * @dev Manages ENS subnames under .tapngo.eth for verified vendors
 * Integrates with real Sepolia ENS registry for cross-chain resolution
 * This contract issues subnames only to vendors registered in VendorRegistry
 */
contract SubnameRegistrar is Ownable, Pausable {
    
    // State variables
    VendorRegistry public vendorRegistry;
    ENSRegistry public ensRegistry;
    ENSResolver public ensResolver;
    
    // ENS node for .tapngo.eth (real namehash for tapngo.eth on Sepolia)
    // This will be set when tapngo.eth is owned on Sepolia
    bytes32 public tapngoNode;
    
    // Sepolia ENS Registry and Resolver addresses
    address public constant SEPOLIA_ENS_REGISTRY = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
    address public constant SEPOLIA_PUBLIC_RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63;
    
    // Mapping to track registered subnames
    mapping(string => address) public subnameToOwner; // subname -> owner address
    mapping(address => string[]) public ownerToSubnames; // owner -> array of subnames
    mapping(string => bool) public subnameExists; // subname -> exists
    
    // Subname registration fee (in wei)
    uint256 public registrationFee = 0; // Free for now, can be set by admin
    
    // Events
    event SubnameRegistered(
        string indexed subname,
        address indexed owner,
        address indexed vendor,
        uint256 timestamp
    );
    
    event SubnameTransferred(
        string indexed subname,
        address indexed oldOwner,
        address indexed newOwner
    );
    
    event SubnameRevoked(string indexed subname, address indexed owner);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // Modifiers
    modifier onlyVendor() {
        require(vendorRegistry.isVendor(msg.sender), "SubnameRegistrar: Only registered vendors can register subnames");
        _;
    }
    
    modifier onlyActiveVendor() {
        require(vendorRegistry.isActiveVendor(msg.sender), "SubnameRegistrar: Only active vendors can register subnames");
        _;
    }
    
    modifier onlySubnameOwner(string memory subname) {
        require(subnameToOwner[subname] == msg.sender, "SubnameRegistrar: Not the owner of this subname");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == owner(), "SubnameRegistrar: Only admin can call this function");
        _;
    }
    
    constructor(
        address _vendorRegistry
    ) Ownable(msg.sender) {
        vendorRegistry = VendorRegistry(_vendorRegistry);
        ensRegistry = ENSRegistry(SEPOLIA_ENS_REGISTRY);
        ensResolver = ENSResolver(SEPOLIA_PUBLIC_RESOLVER);
        // tapngoNode will be set when tapngo.eth is owned
    }
    
    /**
     * @dev Register a new ENS subname for a vendor
     * @param subname The subname to register (e.g., "business" for business.tapngo.eth)
     */
    function registerSubname(string memory subname) external payable onlyActiveVendor whenNotPaused {
        require(bytes(subname).length > 0, "SubnameRegistrar: Subname cannot be empty");
        require(!subnameExists[subname], "SubnameRegistrar: Subname already exists");
        require(msg.value >= registrationFee, "SubnameRegistrar: Insufficient registration fee");
        require(tapngoNode != bytes32(0), "SubnameRegistrar: tapngo.eth node not set");
        
        // Get vendor profile to verify ENS name matches
        VendorRegistry.VendorProfile memory profile = vendorRegistry.getVendorProfile(msg.sender);
        require(bytes(profile.ensName).length > 0, "SubnameRegistrar: Vendor must have ENS name set");
        
        // Verify the subname matches the vendor's ENS name
        string memory expectedSubname = _extractSubname(profile.ensName);
        require(
            keccak256(bytes(subname)) == keccak256(bytes(expectedSubname)),
            "SubnameRegistrar: Subname must match vendor's registered ENS name"
        );
        
        // Register the subname
        subnameToOwner[subname] = msg.sender;
        subnameExists[subname] = true;
        ownerToSubnames[msg.sender].push(subname);
        
        // Register with real Sepolia ENS
        bytes32 label = keccak256(bytes(subname));
        ensRegistry.setSubnodeRecord(
            tapngoNode,
            label,
            msg.sender,
            address(ensResolver),
            0 // TTL = 0 means use default
        );
        
        // Set the address resolution
        bytes32 node = keccak256(abi.encodePacked(tapngoNode, label));
        ensResolver.setAddr(node, msg.sender);
        
        // Set text records for additional metadata
        ensResolver.setText(node, "description", profile.businessName);
        ensResolver.setText(node, "url", string(abi.encodePacked("https://tapngo.eth/", subname)));
        
        emit SubnameRegistered(subname, msg.sender, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership of a subname to another address
     * @param subname The subname to transfer
     * @param newOwner The new owner address
     */
    function transferSubname(string memory subname, address newOwner) external onlySubnameOwner(subname) {
        require(newOwner != address(0), "SubnameRegistrar: New owner cannot be zero address");
        require(newOwner != msg.sender, "SubnameRegistrar: Cannot transfer to self");
        
        address oldOwner = subnameToOwner[subname];
        subnameToOwner[subname] = newOwner;
        
        // Update owner's subname list
        _removeSubnameFromOwner(oldOwner, subname);
        ownerToSubnames[newOwner].push(subname);
        
        // Update ENS record
        bytes32 label = keccak256(bytes(subname));
        bytes32 node = keccak256(abi.encodePacked(tapngoNode, label));
        ensRegistry.setSubnodeRecord(
            tapngoNode,
            label,
            newOwner,
            address(ensResolver),
            0
        );
        ensResolver.setAddr(node, newOwner);
        
        emit SubnameTransferred(subname, oldOwner, newOwner);
    }
    
    /**
     * @dev Revoke a subname (admin only)
     * @param subname The subname to revoke
     */
    function revokeSubname(string memory subname) external onlyAdmin {
        require(subnameExists[subname], "SubnameRegistrar: Subname does not exist");
        
        address owner = subnameToOwner[subname];
        
        // Remove from mappings
        delete subnameToOwner[subname];
        subnameExists[subname] = false;
        _removeSubnameFromOwner(owner, subname);
        
        // Clear ENS record (set owner to zero address)
        bytes32 label = keccak256(bytes(subname));
        ensRegistry.setSubnodeRecord(
            tapngoNode,
            label,
            address(0),
            address(0),
            0
        );
        
        emit SubnameRevoked(subname, owner);
    }
    
    /**
     * @dev Set the tapngo.eth node (admin only)
     * @param _tapngoNode The namehash of tapngo.eth
     */
    function setTapngoNode(bytes32 _tapngoNode) external onlyAdmin {
        require(_tapngoNode != bytes32(0), "SubnameRegistrar: Invalid node");
        tapngoNode = _tapngoNode;
    }
    
    /**
     * @dev Update ENS resolver address (admin only)
     * @param newResolver New resolver address
     */
    function updateResolver(address newResolver) external onlyAdmin {
        require(newResolver != address(0), "SubnameRegistrar: Resolver cannot be zero address");
        ensResolver = ENSResolver(newResolver);
    }
    
    /**
     * @dev Update registration fee (admin only)
     * @param newFee New registration fee in wei
     */
    function updateRegistrationFee(uint256 newFee) external onlyAdmin {
        uint256 oldFee = registrationFee;
        registrationFee = newFee;
        emit RegistrationFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Get all subnames owned by an address
     * @param owner Address to query
     * @return subnames Array of subnames owned by the address
     */
    function getSubnamesByOwner(address owner) external view returns (string[] memory subnames) {
        return ownerToSubnames[owner];
    }
    
    /**
     * @dev Check if a subname exists
     * @param subname Subname to check
     * @return exists True if subname exists
     */
    function isSubnameRegistered(string memory subname) external view returns (bool exists) {
        return subnameExists[subname];
    }
    
    /**
     * @dev Get owner of a subname
     * @param subname Subname to query
     * @return owner Address of the subname owner
     */
    function getSubnameOwner(string memory subname) external view returns (address owner) {
        return subnameToOwner[subname];
    }
    
    /**
     * @dev Extract subname from full ENS name
     * @param ensName Full ENS name (e.g., "business.tapngo.eth")
     * @return subname Just the subname part (e.g., "business")
     */
    function _extractSubname(string memory ensName) internal pure returns (string memory subname) {
        bytes memory ensBytes = bytes(ensName);
        uint256 dotIndex = 0;
        
        // Find the first dot
        for (uint256 i = 0; i < ensBytes.length; i++) {
            if (ensBytes[i] == '.') {
                dotIndex = i;
                break;
            }
        }
        
        require(dotIndex > 0, "SubnameRegistrar: Invalid ENS name format");
        
        // Extract subname
        bytes memory subnameBytes = new bytes(dotIndex);
        for (uint256 i = 0; i < dotIndex; i++) {
            subnameBytes[i] = ensBytes[i];
        }
        
        return string(subnameBytes);
    }
    
    /**
     * @dev Remove subname from owner's list
     * @param owner Owner address
     * @param subname Subname to remove
     */
    function _removeSubnameFromOwner(address owner, string memory subname) internal {
        string[] storage subnames = ownerToSubnames[owner];
        for (uint256 i = 0; i < subnames.length; i++) {
            if (keccak256(bytes(subnames[i])) == keccak256(bytes(subname))) {
                subnames[i] = subnames[subnames.length - 1];
                subnames.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Withdraw collected fees (admin only)
     */
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "SubnameRegistrar: No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "SubnameRegistrar: Failed to withdraw fees");
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
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
