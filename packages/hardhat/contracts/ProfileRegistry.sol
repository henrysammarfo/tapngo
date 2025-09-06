//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProfileRegistry
 * @dev On-chain storage for user profiles, replacing localStorage
 * Stores user profile data including name, bio, avatar, social links
 */
contract ProfileRegistry is Ownable, Pausable {
    
    // Profile structure
    struct UserProfile {
        string name;           // Display name
        string bio;           // User bio/description
        string avatar;        // Avatar URL or IPFS hash
        string website;       // Website URL
        string twitter;       // Twitter handle
        string github;        // GitHub username
        uint256 createdAt;    // Profile creation timestamp
        uint256 updatedAt;    // Last update timestamp
        bool exists;          // Whether profile exists
    }
    
    // State variables
    mapping(address => UserProfile) public profiles;
    mapping(string => address) public nameToAddress; // name -> address mapping
    address[] public profileAddresses; // Array of all profile addresses
    
    // Events
    event ProfileCreated(
        address indexed user,
        string name,
        uint256 timestamp
    );
    
    event ProfileUpdated(
        address indexed user,
        string name,
        uint256 timestamp
    );
    
    event ProfileDeleted(
        address indexed user,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyProfileOwner(address user) {
        require(msg.sender == user, "ProfileRegistry: Only profile owner can modify");
        _;
    }
    
    modifier profileExists(address user) {
        require(profiles[user].exists, "ProfileRegistry: Profile does not exist");
        _;
    }
    
    modifier profileNotExists(address user) {
        require(!profiles[user].exists, "ProfileRegistry: Profile already exists");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new user profile
     * @param name Display name for the user
     * @param bio User bio/description
     * @param avatar Avatar URL or IPFS hash
     * @param website Website URL
     * @param twitter Twitter handle
     * @param github GitHub username
     */
    function createProfile(
        string memory name,
        string memory bio,
        string memory avatar,
        string memory website,
        string memory twitter,
        string memory github
    ) external whenNotPaused profileNotExists(msg.sender) {
        require(bytes(name).length > 0, "ProfileRegistry: Name cannot be empty");
        require(bytes(name).length <= 50, "ProfileRegistry: Name too long");
        require(nameToAddress[name] == address(0), "ProfileRegistry: Name already taken");
        
        UserProfile memory newProfile = UserProfile({
            name: name,
            bio: bio,
            avatar: avatar,
            website: website,
            twitter: twitter,
            github: github,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });
        
        profiles[msg.sender] = newProfile;
        nameToAddress[name] = msg.sender;
        profileAddresses.push(msg.sender);
        
        emit ProfileCreated(msg.sender, name, block.timestamp);
    }
    
    /**
     * @dev Update an existing user profile
     * @param name New display name
     * @param bio New bio/description
     * @param avatar New avatar URL or IPFS hash
     * @param website New website URL
     * @param twitter New Twitter handle
     * @param github New GitHub username
     */
    function updateProfile(
        string memory name,
        string memory bio,
        string memory avatar,
        string memory website,
        string memory twitter,
        string memory github
    ) external whenNotPaused profileExists(msg.sender) {
        require(bytes(name).length > 0, "ProfileRegistry: Name cannot be empty");
        require(bytes(name).length <= 50, "ProfileRegistry: Name too long");
        
        // Check if name is being changed and if new name is available
        if (keccak256(bytes(profiles[msg.sender].name)) != keccak256(bytes(name))) {
            require(nameToAddress[name] == address(0), "ProfileRegistry: Name already taken");
            
            // Free up the old name
            nameToAddress[profiles[msg.sender].name] = address(0);
            nameToAddress[name] = msg.sender;
        }
        
        profiles[msg.sender].name = name;
        profiles[msg.sender].bio = bio;
        profiles[msg.sender].avatar = avatar;
        profiles[msg.sender].website = website;
        profiles[msg.sender].twitter = twitter;
        profiles[msg.sender].github = github;
        profiles[msg.sender].updatedAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, name, block.timestamp);
    }
    
    /**
     * @dev Get user profile by address
     * @param user User address
     * @return Profile data
     */
    function getProfile(address user) external view returns (UserProfile memory) {
        require(profiles[user].exists, "ProfileRegistry: Profile does not exist");
        return profiles[user];
    }
    
    /**
     * @dev Get user profile by name
     * @param name User display name
     * @return Profile data
     */
    function getProfileByName(string memory name) external view returns (UserProfile memory) {
        address user = nameToAddress[name];
        require(user != address(0), "ProfileRegistry: Name not found");
        require(profiles[user].exists, "ProfileRegistry: Profile does not exist");
        return profiles[user];
    }
    
    /**
     * @dev Check if a profile exists for an address
     * @param user User address
     * @return Whether profile exists
     */
    function hasProfile(address user) external view returns (bool) {
        return profiles[user].exists;
    }
    
    /**
     * @dev Check if a name is available
     * @param name Name to check
     * @return Whether name is available
     */
    function isNameAvailable(string memory name) external view returns (bool) {
        return nameToAddress[name] == address(0);
    }
    
    /**
     * @dev Get all profile addresses
     * @return Array of addresses with profiles
     */
    function getAllProfileAddresses() external view returns (address[] memory) {
        return profileAddresses;
    }
    
    /**
     * @dev Get total number of profiles
     * @return Number of profiles
     */
    function getProfileCount() external view returns (uint256) {
        return profileAddresses.length;
    }
    
    /**
     * @dev Delete a profile (only by owner)
     * @param user User address
     */
    function deleteProfile(address user) external onlyProfileOwner(user) profileExists(user) {
        // Free up the name
        nameToAddress[profiles[user].name] = address(0);
        
        // Remove from addresses array
        for (uint256 i = 0; i < profileAddresses.length; i++) {
            if (profileAddresses[i] == user) {
                profileAddresses[i] = profileAddresses[profileAddresses.length - 1];
                profileAddresses.pop();
                break;
            }
        }
        
        // Delete profile
        delete profiles[user];
        
        emit ProfileDeleted(user, block.timestamp);
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
}
