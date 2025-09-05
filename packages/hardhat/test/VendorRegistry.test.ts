/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { ethers } from "hardhat";
import { VendorRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VendorRegistry", function () {
  let vendorRegistry: VendorRegistry;
  let owner: SignerWithAddress;
  let vendor1: SignerWithAddress;
  let vendor2: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, vendor1, vendor2, user1] = await ethers.getSigners();

    const VendorRegistryFactory = await ethers.getContractFactory("VendorRegistry");
    vendorRegistry = await VendorRegistryFactory.deploy();
    await vendorRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await vendorRegistry.owner()).to.equal(owner.address);
    });

    it("Should have correct initial verification requirements", async function () {
      expect(await vendorRegistry.requirePhoneVerification()).to.be.true;
      expect(await vendorRegistry.requireEFPVerification()).to.be.true;
      expect(await vendorRegistry.minEFPasScore()).to.equal(0);
    });

    it("Should start with zero vendors", async function () {
      expect(await vendorRegistry.getVendorCount()).to.equal(0);
    });
  });

  describe("Vendor Registration", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    it("Should allow vendor registration", async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);

      expect(await vendorRegistry.isVendor(vendor1.address)).to.be.true;
      expect(await vendorRegistry.getVendorCount()).to.equal(1);
    });

    it("Should emit VendorRegistered event", async function () {
      await expect(vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash))
        .to.emit(vendorRegistry, "VendorRegistered")
        .withArgs(vendor1.address, ensName, businessName, phoneHash);
    });

    it("Should not allow duplicate vendor registration", async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);

      await expect(vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash)).to.be.revertedWith(
        "VendorRegistry: Vendor already registered",
      );
    });

    it("Should not allow empty ENS name", async function () {
      await expect(vendorRegistry.connect(vendor1).registerVendor("", businessName, phoneHash)).to.be.revertedWith(
        "VendorRegistry: ENS name cannot be empty",
      );
    });

    it("Should not allow empty business name", async function () {
      await expect(vendorRegistry.connect(vendor1).registerVendor(ensName, "", phoneHash)).to.be.revertedWith(
        "VendorRegistry: Business name cannot be empty",
      );
    });

    it("Should not allow empty phone hash", async function () {
      await expect(vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, "")).to.be.revertedWith(
        "VendorRegistry: Phone hash cannot be empty",
      );
    });

    it("Should not allow duplicate ENS names", async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);

      const phoneHash2 = "0xabcdef1234567890abcdef1234567890abcdef12";
      await expect(
        vendorRegistry.connect(vendor2).registerVendor(ensName, "Another Business", phoneHash2),
      ).to.be.revertedWith("VendorRegistry: ENS name already taken");
    });

    it("Should not allow duplicate phone hashes", async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);

      await expect(
        vendorRegistry.connect(vendor2).registerVendor("another.tapngo.eth", "Another Business", phoneHash),
      ).to.be.revertedWith("VendorRegistry: Phone number already used");
    });
  });

  describe("Vendor Approval", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
    });

    it("Should allow admin to approve vendor", async function () {
      // First verify phone and EFP
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);

      await vendorRegistry.approveVendor(vendor1.address);

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.status).to.equal(1); // Active status
    });

    it("Should emit VendorApproved event", async function () {
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);

      await expect(vendorRegistry.approveVendor(vendor1.address))
        .to.emit(vendorRegistry, "VendorApproved")
        .withArgs(vendor1.address, ensName);
    });

    it("Should not allow non-admin to approve vendor", async function () {
      await expect(vendorRegistry.connect(vendor1).approveVendor(vendor1.address)).to.be.revertedWith(
        "VendorRegistry: Only admin can call this function",
      );
    });

    it("Should not approve vendor without phone verification when required", async function () {
      await vendorRegistry.updateEFPVerification(vendor1.address, true);

      await expect(vendorRegistry.approveVendor(vendor1.address)).to.be.revertedWith(
        "VendorRegistry: Phone verification required",
      );
    });

    it("Should not approve vendor without EFP verification when required", async function () {
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);

      await expect(vendorRegistry.approveVendor(vendor1.address)).to.be.revertedWith(
        "VendorRegistry: EFP verification required",
      );
    });

    it("Should not approve vendor with low EFPas score when required", async function () {
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);
      await vendorRegistry.updateEFPasScore(vendor1.address, 50);

      // Set minimum EFPas score requirement
      await vendorRegistry.updateVerificationRequirements(true, true, 100);

      await expect(vendorRegistry.approveVendor(vendor1.address)).to.be.revertedWith(
        "VendorRegistry: EFPas score too low",
      );
    });
  });

  describe("Vendor Suspension", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);
      await vendorRegistry.approveVendor(vendor1.address);
    });

    it("Should allow admin to suspend vendor", async function () {
      await vendorRegistry.suspendVendor(vendor1.address, "Violation of terms");

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.status).to.equal(2); // Suspended status
    });

    it("Should emit VendorSuspended event", async function () {
      await expect(vendorRegistry.suspendVendor(vendor1.address, "Violation of terms"))
        .to.emit(vendorRegistry, "VendorSuspended")
        .withArgs(vendor1.address, "Violation of terms");
    });

    it("Should not allow non-admin to suspend vendor", async function () {
      await expect(vendorRegistry.connect(vendor1).suspendVendor(vendor1.address, "Reason")).to.be.revertedWith(
        "VendorRegistry: Only admin can call this function",
      );
    });

    it("Should not suspend non-active vendor", async function () {
      // Register another vendor but don't approve
      await vendorRegistry
        .connect(vendor2)
        .registerVendor("another.tapngo.eth", "Another Business", "0xabcdef1234567890abcdef1234567890abcdef12");

      await expect(vendorRegistry.suspendVendor(vendor2.address, "Reason")).to.be.revertedWith(
        "VendorRegistry: Vendor not active",
      );
    });
  });

  describe("Vendor Rejection", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
    });

    it("Should allow admin to reject vendor", async function () {
      await vendorRegistry.rejectVendor(vendor1.address, "Incomplete documentation");

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.status).to.equal(3); // Rejected status
    });

    it("Should emit VendorRejected event", async function () {
      await expect(vendorRegistry.rejectVendor(vendor1.address, "Incomplete documentation"))
        .to.emit(vendorRegistry, "VendorRejected")
        .withArgs(vendor1.address, "Incomplete documentation");
    });

    it("Should not allow non-admin to reject vendor", async function () {
      await expect(vendorRegistry.connect(vendor1).rejectVendor(vendor1.address, "Reason")).to.be.revertedWith(
        "VendorRegistry: Only admin can call this function",
      );
    });

    it("Should not reject non-pending vendor", async function () {
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);
      await vendorRegistry.approveVendor(vendor1.address);

      await expect(vendorRegistry.rejectVendor(vendor1.address, "Reason")).to.be.revertedWith(
        "VendorRegistry: Vendor not pending",
      );
    });
  });

  describe("Verification Updates", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
    });

    it("Should allow admin to update phone verification", async function () {
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.phoneVerified).to.be.true;
    });

    it("Should emit PhoneVerified event", async function () {
      await expect(vendorRegistry.updatePhoneVerification(vendor1.address, true))
        .to.emit(vendorRegistry, "PhoneVerified")
        .withArgs(vendor1.address, phoneHash);
    });

    it("Should allow admin to update EFP verification", async function () {
      await vendorRegistry.updateEFPVerification(vendor1.address, true);

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.efpVerified).to.be.true;
    });

    it("Should emit EFPVerified event", async function () {
      await expect(vendorRegistry.updateEFPVerification(vendor1.address, true))
        .to.emit(vendorRegistry, "EFPVerified")
        .withArgs(vendor1.address, true);
    });

    it("Should allow admin to update EFPas score", async function () {
      const score = 150;
      await vendorRegistry.updateEFPasScore(vendor1.address, score);

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.efpasScore).to.equal(score);
    });

    it("Should emit EFPasScoreUpdated event", async function () {
      const score = 150;
      await expect(vendorRegistry.updateEFPasScore(vendor1.address, score))
        .to.emit(vendorRegistry, "EFPasScoreUpdated")
        .withArgs(vendor1.address, score);
    });

    it("Should not allow non-admin to update verifications", async function () {
      await expect(vendorRegistry.connect(vendor1).updatePhoneVerification(vendor1.address, true)).to.be.revertedWith(
        "VendorRegistry: Only admin can call this function",
      );
    });
  });

  describe("Business Name Updates", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
    });

    it("Should allow vendor to update business name", async function () {
      const newName = "Updated Business Name";
      await vendorRegistry.connect(vendor1).updateBusinessName(newName);

      const profile = await vendorRegistry.getVendorProfile(vendor1.address);
      expect(profile.businessName).to.equal(newName);
    });

    it("Should emit VendorUpdated event", async function () {
      const newName = "Updated Business Name";
      await expect(vendorRegistry.connect(vendor1).updateBusinessName(newName))
        .to.emit(vendorRegistry, "VendorUpdated")
        .withArgs(vendor1.address, "businessName");
    });

    it("Should not allow empty business name", async function () {
      await expect(vendorRegistry.connect(vendor1).updateBusinessName("")).to.be.revertedWith(
        "VendorRegistry: Business name cannot be empty",
      );
    });

    it("Should not allow non-vendor to update business name", async function () {
      await expect(vendorRegistry.connect(user1).updateBusinessName("New Name")).to.be.revertedWith(
        "VendorRegistry: Not a registered vendor",
      );
    });
  });

  describe("Query Functions", function () {
    const ensName = "business.tapngo.eth";
    const businessName = "Test Business";
    const phoneHash = "0x1234567890abcdef1234567890abcdef12345678";

    beforeEach(async function () {
      await vendorRegistry.connect(vendor1).registerVendor(ensName, businessName, phoneHash);
    });

    it("Should return correct vendor profile", async function () {
      const profile = await vendorRegistry.getVendorProfile(vendor1.address);

      expect(profile.wallet).to.equal(vendor1.address);
      expect(profile.ensName).to.equal(ensName);
      expect(profile.businessName).to.equal(businessName);
      expect(profile.phoneHash).to.equal(phoneHash);
      expect(profile.status).to.equal(0); // Pending status
    });

    it("Should return vendor by ENS name", async function () {
      const vendorAddress = await vendorRegistry.getVendorByENS(ensName);
      expect(vendorAddress).to.equal(vendor1.address);
    });

    it("Should return correct vendor status", async function () {
      expect(await vendorRegistry.isVendor(vendor1.address)).to.be.true;
      expect(await vendorRegistry.isActiveVendor(vendor1.address)).to.be.false;

      // Approve vendor
      await vendorRegistry.updatePhoneVerification(vendor1.address, true);
      await vendorRegistry.updateEFPVerification(vendor1.address, true);
      await vendorRegistry.approveVendor(vendor1.address);

      expect(await vendorRegistry.isActiveVendor(vendor1.address)).to.be.true;
    });

    it("Should return vendor addresses with pagination", async function () {
      // Register another vendor
      await vendorRegistry
        .connect(vendor2)
        .registerVendor("another.tapngo.eth", "Another Business", "0xabcdef1234567890abcdef1234567890abcdef12");

      const addresses = await vendorRegistry.getVendorAddresses(0, 10);
      expect(addresses.length).to.equal(2);
      expect(addresses[0]).to.equal(vendor1.address);
      expect(addresses[1]).to.equal(vendor2.address);
    });
  });

  describe("Verification Requirements", function () {
    it("Should allow admin to update verification requirements", async function () {
      await vendorRegistry.updateVerificationRequirements(false, false, 100);

      expect(await vendorRegistry.requirePhoneVerification()).to.be.false;
      expect(await vendorRegistry.requireEFPVerification()).to.be.false;
      expect(await vendorRegistry.minEFPasScore()).to.equal(100);
    });

    it("Should not allow non-admin to update verification requirements", async function () {
      await expect(
        vendorRegistry.connect(vendor1).updateVerificationRequirements(false, false, 100),
      ).to.be.revertedWith("VendorRegistry: Only admin can call this function");
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await vendorRegistry.pause();
      expect(await vendorRegistry.paused()).to.be.true;
    });

    it("Should not allow vendor registration when paused", async function () {
      await vendorRegistry.pause();

      await expect(
        vendorRegistry
          .connect(vendor1)
          .registerVendor("business.tapngo.eth", "Test Business", "0x1234567890abcdef1234567890abcdef12345678"),
      ).to.be.revertedWithCustomError(vendorRegistry, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await vendorRegistry.pause();
      await vendorRegistry.unpause();
      expect(await vendorRegistry.paused()).to.be.false;
    });
  });
});
