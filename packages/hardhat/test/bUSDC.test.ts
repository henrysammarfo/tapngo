/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { ethers } from "hardhat";
import { bUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("bUSDC", function () {
  let busdc: bUSDC;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // const INITIAL_SUPPLY = ethers.parseUnits("100000", 6); // 100k tokens with 6 decimals
  const FAUCET_AMOUNT = ethers.parseUnits("1000", 6); // 1000 tokens with 6 decimals
  const FAUCET_COOLDOWN = 24 * 60 * 60; // 24 hours in seconds

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const bUSDCFactory = await ethers.getContractFactory("bUSDC");
    busdc = await bUSDCFactory.deploy();
    await busdc.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await busdc.name()).to.equal("Base USDC Test");
      expect(await busdc.symbol()).to.equal("bUSDC");
      expect(await busdc.decimals()).to.equal(6);
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await busdc.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseUnits("100000", 6)); // 100k tokens with 6 decimals
    });

    it("Should set the correct owner", async function () {
      expect(await busdc.owner()).to.equal(owner.address);
    });

    it("Should have correct max supply", async function () {
      expect(await busdc.MAX_SUPPLY()).to.equal(ethers.parseUnits("1000000000", 6)); // 1B tokens
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await busdc.mint(user1.address, mintAmount);

      expect(await busdc.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(busdc.connect(user1).mint(user2.address, mintAmount)).to.be.revertedWithCustomError(
        busdc,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await busdc.MAX_SUPPLY();
      const currentSupply = await busdc.totalSupply();
      const excessAmount = maxSupply - currentSupply + ethers.parseUnits("1", 6);

      await expect(busdc.mint(user1.address, excessAmount)).to.be.revertedWith("bUSDC: Exceeds max supply");
    });

    it("Should emit TokensMinted event", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(busdc.mint(user1.address, mintAmount))
        .to.emit(busdc, "TokensMinted")
        .withArgs(user1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint some tokens to user1 first
      await busdc.mint(user1.address, ethers.parseUnits("1000", 6));
    });

    it("Should allow owner to burn tokens", async function () {
      const burnAmount = ethers.parseUnits("500", 6);
      await busdc.burn(user1.address, burnAmount);

      expect(await busdc.balanceOf(user1.address)).to.equal(ethers.parseUnits("500", 6));
    });

    it("Should not allow non-owner to burn", async function () {
      const burnAmount = ethers.parseUnits("500", 6);
      await expect(busdc.connect(user1).burn(user1.address, burnAmount)).to.be.revertedWithCustomError(
        busdc,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should emit TokensBurned event", async function () {
      const burnAmount = ethers.parseUnits("500", 6);
      await expect(busdc.burn(user1.address, burnAmount))
        .to.emit(busdc, "TokensBurned")
        .withArgs(user1.address, burnAmount);
    });
  });

  describe("Faucet", function () {
    it("Should allow users to claim from faucet", async function () {
      await busdc.connect(user1).claimFaucet();

      expect(await busdc.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should emit FaucetClaimed event", async function () {
      await expect(busdc.connect(user1).claimFaucet())
        .to.emit(busdc, "FaucetClaimed")
        .withArgs(user1.address, FAUCET_AMOUNT);
    });

    it("Should not allow claiming before cooldown expires", async function () {
      await busdc.connect(user1).claimFaucet();

      await expect(busdc.connect(user1).claimFaucet()).to.be.revertedWith("bUSDC: Faucet cooldown not expired");
    });

    it("Should allow claiming after cooldown expires", async function () {
      await busdc.connect(user1).claimFaucet();

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [FAUCET_COOLDOWN + 1]);
      await ethers.provider.send("evm_mine", []);

      await busdc.connect(user1).claimFaucet();

      expect(await busdc.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT * 2n);
    });

    it("Should track last faucet claim time", async function () {
      const tx = await busdc.connect(user1).claimFaucet();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      expect(await busdc.lastFaucetClaim(user1.address)).to.equal(block!.timestamp);
    });

    it("Should return correct canClaimFaucet status", async function () {
      // Before claiming
      const [canClaim1, timeUntilClaim1] = await busdc.canClaimFaucet(user1.address);
      expect(canClaim1).to.be.true;
      expect(timeUntilClaim1).to.equal(0);

      // After claiming
      await busdc.connect(user1).claimFaucet();
      const [canClaim2, timeUntilClaim2] = await busdc.canClaimFaucet(user1.address);
      expect(canClaim2).to.be.false;
      expect(timeUntilClaim2).to.be.greaterThan(0);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await busdc.pause();
      expect(await busdc.paused()).to.be.true;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(busdc.connect(user1).pause()).to.be.revertedWithCustomError(busdc, "OwnableUnauthorizedAccount");
    });

    it("Should not allow transfers when paused", async function () {
      await busdc.mint(user1.address, ethers.parseUnits("1000", 6));
      await busdc.pause();

      await expect(
        busdc.connect(user1).transfer(user2.address, ethers.parseUnits("100", 6)),
      ).to.be.revertedWithCustomError(busdc, "EnforcedPause");
    });

    it("Should not allow faucet claims when paused", async function () {
      await busdc.pause();

      await expect(busdc.connect(user1).claimFaucet()).to.be.revertedWithCustomError(busdc, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await busdc.pause();
      await busdc.unpause();
      expect(await busdc.paused()).to.be.false;
    });
  });

  describe("ERC20 Functionality", function () {
    beforeEach(async function () {
      await busdc.mint(user1.address, ethers.parseUnits("1000", 6));
    });

    it("Should allow transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      await busdc.connect(user1).transfer(user2.address, transferAmount);

      expect(await busdc.balanceOf(user1.address)).to.equal(ethers.parseUnits("900", 6));
      expect(await busdc.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should allow approvals and transfers from", async function () {
      const approveAmount = ethers.parseUnits("100", 6);
      const transferAmount = ethers.parseUnits("50", 6);

      await busdc.connect(user1).approve(user2.address, approveAmount);
      await busdc.connect(user2).transferFrom(user1.address, user2.address, transferAmount);

      expect(await busdc.balanceOf(user1.address)).to.equal(ethers.parseUnits("950", 6));
      expect(await busdc.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await busdc.allowance(user1.address, user2.address)).to.equal(ethers.parseUnits("50", 6));
    });
  });
});
