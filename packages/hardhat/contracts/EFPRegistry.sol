//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EFPRegistry
 * @dev Ethereum Follow Protocol implementation for on-chain social graph
 * Enables users to follow/unfollow other addresses
 */
contract EFPRegistry is Ownable, Pausable {
    
    // Follow relationship structure
    struct FollowRecord {
        address follower;     // Address doing the following
        address following;    // Address being followed
        uint256 timestamp;    // When the follow happened
        bool active;          // Whether the follow is active
    }
    
    // State variables
    mapping(address => address[]) public following; // user => array of addresses they follow
    mapping(address => address[]) public followers; // user => array of addresses that follow them
    mapping(address => mapping(address => bool)) public isFollowing; // follower => following => bool
    mapping(address => mapping(address => uint256)) public followTimestamp; // follower => following => timestamp
    
    // Follow records for history
    FollowRecord[] public followRecords;
    
    // Statistics
    mapping(address => uint256) public followingCount; // user => number of people they follow
    mapping(address => uint256) public followersCount; // user => number of followers
    
    // Events
    event Followed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    event Unfollowed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    // Modifiers
    modifier notSelf(address target) {
        require(msg.sender != target, "EFPRegistry: Cannot follow yourself");
        _;
    }
    
    modifier notFollowing(address target) {
        require(!isFollowing[msg.sender][target], "EFPRegistry: Already following this address");
        _;
    }
    
    modifier isCurrentlyFollowing(address target) {
        require(isFollowing[msg.sender][target], "EFPRegistry: Not following this address");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Follow another address
     * @param target Address to follow
     */
    function follow(address target) external whenNotPaused notSelf(target) notFollowing(target) {
        // Add to following list
        following[msg.sender].push(target);
        followingCount[msg.sender]++;
        
        // Add to target's followers list
        followers[target].push(msg.sender);
        followersCount[target]++;
        
        // Set follow relationship
        isFollowing[msg.sender][target] = true;
        followTimestamp[msg.sender][target] = block.timestamp;
        
        // Add to follow records
        followRecords.push(FollowRecord({
            follower: msg.sender,
            following: target,
            timestamp: block.timestamp,
            active: true
        }));
        
        emit Followed(msg.sender, target, block.timestamp);
    }
    
    /**
     * @dev Unfollow an address
     * @param target Address to unfollow
     */
    function unfollow(address target) external whenNotPaused isCurrentlyFollowing(target) {
        // Remove from following list
        _removeFromArray(following[msg.sender], target);
        followingCount[msg.sender]--;
        
        // Remove from target's followers list
        _removeFromArray(followers[target], msg.sender);
        followersCount[target]--;
        
        // Remove follow relationship
        isFollowing[msg.sender][target] = false;
        followTimestamp[msg.sender][target] = 0;
        
        // Mark as inactive in follow records
        for (uint256 i = 0; i < followRecords.length; i++) {
            if (followRecords[i].follower == msg.sender && 
                followRecords[i].following == target && 
                followRecords[i].active) {
                followRecords[i].active = false;
                break;
            }
        }
        
        emit Unfollowed(msg.sender, target, block.timestamp);
    }
    
    /**
     * @dev Get list of addresses that a user follows
     * @param user User address
     * @return Array of addresses being followed
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return following[user];
    }
    
    /**
     * @dev Get list of addresses that follow a user
     * @param user User address
     * @return Array of follower addresses
     */
    function getFollowers(address user) external view returns (address[] memory) {
        return followers[user];
    }
    
    /**
     * @dev Check if one address follows another
     * @param follower Address that might be following
     * @param following Address that might be followed
     * @return Whether the follow relationship exists
     */
    function checkFollow(address follower, address following) external view returns (bool) {
        return isFollowing[follower][following];
    }
    
    /**
     * @dev Get follow statistics for a user
     * @param user User address
     * @return followingCount Number of people they follow
     * @return followersCount Number of followers
     */
    function getFollowStats(address user) external view returns (uint256, uint256) {
        return (followingCount[user], followersCount[user]);
    }
    
    /**
     * @dev Get all follow records (for history/analytics)
     * @return Array of all follow records
     */
    function getAllFollowRecords() external view returns (FollowRecord[] memory) {
        return followRecords;
    }
    
    /**
     * @dev Get follow records for a specific user
     * @param user User address
     * @param isFollower Whether to get records where user is follower (true) or following (false)
     * @return Array of relevant follow records
     */
    function getFollowRecordsForUser(address user, bool isFollower) external view returns (FollowRecord[] memory) {
        uint256 count = 0;
        
        // Count relevant records
        for (uint256 i = 0; i < followRecords.length; i++) {
            if (isFollower && followRecords[i].follower == user) {
                count++;
            } else if (!isFollower && followRecords[i].following == user) {
                count++;
            }
        }
        
        // Create result array
        FollowRecord[] memory result = new FollowRecord[](count);
        uint256 index = 0;
        
        // Populate result array
        for (uint256 i = 0; i < followRecords.length; i++) {
            if (isFollower && followRecords[i].follower == user) {
                result[index] = followRecords[i];
                index++;
            } else if (!isFollower && followRecords[i].following == user) {
                result[index] = followRecords[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Internal function to remove an address from an array
     * @param array Array to remove from
     * @param target Address to remove
     */
    function _removeFromArray(address[] storage array, address target) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == target) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
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
