//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title bUSDC - Base USDC Test Token
 * @dev A mintable ERC20 token for testing Tap&Go Pay on Base Sepolia
 * This is a test stablecoin that simulates USDC functionality
 */
contract bUSDC is ERC20, Ownable, Pausable {
    // Maximum supply for the test token (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**6; // 6 decimals like real USDC
    
    // Faucet limits
    uint256 public constant FAUCET_AMOUNT = 10 * 10**6; // 10 tokens per faucet
    uint256 public constant FAUCET_COOLDOWN = 24 hours; // 24 hour cooldown between faucet claims
    
    // Mapping to track last faucet claim time per address
    mapping(address => uint256) public lastFaucetClaim;
    
    // Events
    event FaucetClaimed(address indexed user, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor() ERC20("Base USDC Test", "bUSDC") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 100_000 * 10**6); // 100k tokens
    }
    
    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "bUSDC: Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from a specific address (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn (in wei, 6 decimals)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Faucet function - allows users to claim test tokens
     * Users can claim once every 24 hours
     */
    function claimFaucet() external whenNotPaused {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "bUSDC: Faucet cooldown not expired"
        );
        require(
            totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY,
            "bUSDC: Faucet would exceed max supply"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Check if an address can claim from faucet
     * @param user Address to check
     * @return canClaim True if user can claim from faucet
     * @return timeUntilClaim Time until next claim is available (0 if can claim now)
     */
    function canClaimFaucet(address user) external view returns (bool canClaim, uint256 timeUntilClaim) {
        uint256 lastClaim = lastFaucetClaim[user];
        uint256 nextClaimTime = lastClaim + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            canClaim = true;
            timeUntilClaim = 0;
        } else {
            canClaim = false;
            timeUntilClaim = nextClaimTime - block.timestamp;
        }
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to respect pause state
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
    
    /**
     * @dev Get the number of decimals for this token (6, like real USDC)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
