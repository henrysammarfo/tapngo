/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { ethers } from "hardhat";
import { PaymentRouter, bUSDC, VendorRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PaymentRouter", function () {
  let paymentRouter: PaymentRouter;
  let busdc: bUSDC;
  let vendorRegistry: VendorRegistry;
  let owner: SignerWithAddress;
  let buyer: SignerWithAddress;
  let vendor: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M tokens
  const PAYMENT_AMOUNT_GHS = 100; // 100 GHS
  const EXCHANGE_RATE = ethers.parseUnits("1", 6); // 1 GHS = 1 USDC (6 decimals)

  beforeEach(async function () {
    [owner, buyer, vendor, feeRecipient] = await ethers.getSigners();

    // Deploy bUSDC
    const bUSDCFactory = await ethers.getContractFactory("bUSDC");
    busdc = await bUSDCFactory.deploy();
    await busdc.waitForDeployment();

    // Deploy VendorRegistry
    const VendorRegistryFactory = await ethers.getContractFactory("VendorRegistry");
    vendorRegistry = await VendorRegistryFactory.deploy();
    await vendorRegistry.waitForDeployment();

    // Deploy PaymentRouter
    const PaymentRouterFactory = await ethers.getContractFactory("PaymentRouter");
    paymentRouter = await PaymentRouterFactory.deploy(
      await busdc.getAddress(),
      await vendorRegistry.getAddress(),
      feeRecipient.address,
    );
    await paymentRouter.waitForDeployment();

    // Setup vendor
    await vendorRegistry
      .connect(vendor)
      .registerVendor("business.tapngo.eth", "Test Business", "0x1234567890abcdef1234567890abcdef12345678");
    await vendorRegistry.updatePhoneVerification(vendor.address, true);
    await vendorRegistry.updateEFPVerification(vendor.address, true);
    await vendorRegistry.approveVendor(vendor.address);

    // Mint tokens to buyer
    await busdc.mint(buyer.address, INITIAL_SUPPLY);
  });

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      expect(await paymentRouter.busdcToken()).to.equal(await busdc.getAddress());
      expect(await paymentRouter.vendorRegistry()).to.equal(await vendorRegistry.getAddress());
      expect(await paymentRouter.feeRecipient()).to.equal(feeRecipient.address);
      expect(await paymentRouter.currentFxRate()).to.equal(EXCHANGE_RATE);
      expect(await paymentRouter.platformFeeBps()).to.equal(25); // 0.25%
    });

    it("Should set the correct owner", async function () {
      expect(await paymentRouter.owner()).to.equal(owner.address);
    });
  });

  describe("Quick Pay", function () {
    it("Should initiate quick pay successfully", async function () {
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      // Get the order ID from the event
      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should emit PaymentInitiated event", async function () {
      await expect(paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS)).to.emit(
        paymentRouter,
        "PaymentInitiated",
      );
    });

    it("Should not allow payment to inactive vendor", async function () {
      // Suspend vendor
      await vendorRegistry.suspendVendor(vendor.address, "Test suspension");

      await expect(
        paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS),
      ).to.be.revertedWith("PaymentRouter: Vendor not active");
    });

    it("Should not allow zero amount", async function () {
      await expect(paymentRouter.connect(buyer).initiateQuickPay(vendor.address, 0)).to.be.revertedWith(
        "PaymentRouter: Amount too small",
      );
    });
  });

  describe("Invoice Pay", function () {
    const metadata = '{"items":[{"name":"Coffee","price":5},{"name":"Sandwich","price":10}]}';

    it("Should initiate invoice pay successfully", async function () {
      const tx = await paymentRouter.connect(buyer).initiateInvoicePay(vendor.address, PAYMENT_AMOUNT_GHS, metadata);
      const receipt = await tx.wait();

      // Get the order ID from the event
      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("Should emit PaymentInitiated event", async function () {
      await expect(
        paymentRouter.connect(buyer).initiateInvoicePay(vendor.address, PAYMENT_AMOUNT_GHS, metadata),
      ).to.emit(paymentRouter, "PaymentInitiated");
    });

    it("Should not allow empty metadata", async function () {
      await expect(
        paymentRouter.connect(buyer).initiateInvoicePay(vendor.address, PAYMENT_AMOUNT_GHS, ""),
      ).to.be.revertedWith("PaymentRouter: Metadata cannot be empty");
    });
  });

  describe("Payment Completion", function () {
    let orderId: string;

    beforeEach(async function () {
      // Initiate a payment
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      // Extract order ID from event
      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        orderId = parsed!.args.orderId;
      }
    });

    it("Should complete payment successfully", async function () {
      // Approve payment router to spend buyer's tokens
      const paymentAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      await busdc.connect(buyer).approve(await paymentRouter.getAddress(), paymentAmount);

      await expect(paymentRouter.connect(buyer).completePayment(orderId)).to.emit(paymentRouter, "PaymentCompleted");
    });

    it("Should not allow completion without sufficient balance", async function () {
      // Create a new buyer with no tokens
      const [, , , , newBuyer] = await ethers.getSigners();

      // Initiate payment with new buyer
      const tx = await paymentRouter.connect(newBuyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        const newOrderId = parsed!.args.orderId;

        await expect(paymentRouter.connect(newBuyer).completePayment(newOrderId)).to.be.revertedWith(
          "PaymentRouter: Insufficient bUSDC balance",
        );
      }
    });

    it("Should not allow completion by non-buyer", async function () {
      const paymentAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      await busdc.connect(buyer).approve(await paymentRouter.getAddress(), paymentAmount);

      await expect(paymentRouter.connect(vendor).completePayment(orderId)).to.be.revertedWith(
        "PaymentRouter: Only buyer can complete payment",
      );
    });

    it("Should not allow completion of non-pending payment", async function () {
      const paymentAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      await busdc.connect(buyer).approve(await paymentRouter.getAddress(), paymentAmount);

      // Complete payment once
      await paymentRouter.connect(buyer).completePayment(orderId);

      // Try to complete again
      await expect(paymentRouter.connect(buyer).completePayment(orderId)).to.be.revertedWith(
        "PaymentRouter: Payment not pending",
      );
    });
  });

  describe("Payment Failure", function () {
    let orderId: string;

    beforeEach(async function () {
      // Initiate a payment
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      // Extract order ID from event
      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        orderId = parsed!.args.orderId;
      }
    });

    it("Should allow vendor to mark payment as failed", async function () {
      await expect(paymentRouter.connect(vendor).markPaymentFailed(orderId, "Customer cancelled")).to.emit(
        paymentRouter,
        "PaymentFailed",
      );
    });

    it("Should allow admin to mark payment as failed", async function () {
      await expect(paymentRouter.markPaymentFailed(orderId, "System error")).to.emit(paymentRouter, "PaymentFailed");
    });

    it("Should not allow buyer to mark payment as failed", async function () {
      await expect(paymentRouter.connect(buyer).markPaymentFailed(orderId, "Reason")).to.be.revertedWith(
        "PaymentRouter: Only vendor or admin can mark as failed",
      );
    });
  });

  describe("Payment Refund", function () {
    let orderId: string;

    beforeEach(async function () {
      // Initiate and complete a payment
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        orderId = parsed!.args.orderId;
      }

      const paymentAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      await busdc.connect(buyer).approve(await paymentRouter.getAddress(), paymentAmount);
      await paymentRouter.connect(buyer).completePayment(orderId);
    });

    it("Should allow admin to refund payment", async function () {
      // Mint tokens to the payment router to cover the refund
      const paymentAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      await busdc.mint(await paymentRouter.getAddress(), paymentAmount);

      await expect(paymentRouter.refundPayment(orderId)).to.emit(paymentRouter, "PaymentRefunded");
    });

    it("Should not allow non-admin to refund payment", async function () {
      await expect(paymentRouter.connect(buyer).refundPayment(orderId)).to.be.revertedWithCustomError(
        paymentRouter,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should not allow refund of non-completed payment", async function () {
      // Create a new payment and don't complete it
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        const newOrderId = parsed!.args.orderId;

        await expect(paymentRouter.refundPayment(newOrderId)).to.be.revertedWith(
          "PaymentRouter: Payment not completed",
        );
      }
    });
  });

  describe("Exchange Rate Management", function () {
    it("Should allow FX rate updater to update exchange rate", async function () {
      const newRate = ethers.parseUnits("1.5", 6); // 1.5 GHS = 1 USDC
      await paymentRouter.updateExchangeRate(newRate);

      expect(await paymentRouter.currentFxRate()).to.equal(newRate);
    });

    it("Should emit ExchangeRateUpdated event", async function () {
      const newRate = ethers.parseUnits("1.5", 6);
      await expect(paymentRouter.updateExchangeRate(newRate))
        .to.emit(paymentRouter, "ExchangeRateUpdated")
        .withArgs(EXCHANGE_RATE, newRate);
    });

    it("Should not allow zero exchange rate", async function () {
      await expect(paymentRouter.updateExchangeRate(0)).to.be.revertedWith(
        "PaymentRouter: Exchange rate must be positive",
      );
    });

    it("Should not allow non-FX rate updater to update rate", async function () {
      const newRate = ethers.parseUnits("1.5", 6);
      await expect(paymentRouter.connect(buyer).updateExchangeRate(newRate)).to.be.revertedWith(
        "PaymentRouter: Not authorized to update exchange rate",
      );
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to update platform fee", async function () {
      await paymentRouter.updatePlatformFee(50); // 0.5%
      expect(await paymentRouter.platformFeeBps()).to.equal(50);
    });

    it("Should emit PlatformFeeUpdated event", async function () {
      await expect(paymentRouter.updatePlatformFee(50)).to.emit(paymentRouter, "PlatformFeeUpdated").withArgs(25, 50);
    });

    it("Should not allow fee above 10%", async function () {
      await expect(
        paymentRouter.updatePlatformFee(1001), // 10.01%
      ).to.be.revertedWith("PaymentRouter: Fee cannot exceed 10%");
    });

    it("Should not allow non-owner to update fee", async function () {
      await expect(paymentRouter.connect(buyer).updatePlatformFee(50)).to.be.revertedWithCustomError(
        paymentRouter,
        "OwnableUnauthorizedAccount",
      );
    });

    it("Should allow owner to update fee recipient", async function () {
      const [, , , , newRecipient] = await ethers.getSigners();
      await paymentRouter.updateFeeRecipient(newRecipient.address);

      expect(await paymentRouter.feeRecipient()).to.equal(newRecipient.address);
    });

    it("Should emit FeeRecipientUpdated event", async function () {
      const [, , , , newRecipient] = await ethers.getSigners();
      await expect(paymentRouter.updateFeeRecipient(newRecipient.address))
        .to.emit(paymentRouter, "FeeRecipientUpdated")
        .withArgs(feeRecipient.address, newRecipient.address);
    });
  });

  describe("Query Functions", function () {
    let orderId: string;

    beforeEach(async function () {
      // Initiate a payment
      const tx = await paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS);
      const receipt = await tx.wait();

      const event = receipt!.logs.find(log => {
        try {
          const parsed = paymentRouter.interface.parseLog(log);
          return parsed?.name === "PaymentInitiated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = paymentRouter.interface.parseLog(event);
        orderId = parsed!.args.orderId;
      }
    });

    it("Should return correct receipt", async function () {
      const receipt = await paymentRouter.getReceipt(orderId);

      expect(receipt.buyer).to.equal(buyer.address);
      expect(receipt.vendor).to.equal(vendor.address);
      expect(receipt.amountGHS).to.equal(PAYMENT_AMOUNT_GHS);
      expect(receipt.status).to.equal(0); // Pending status
    });

    it("Should return user receipts with pagination", async function () {
      const receipts = await paymentRouter.getUserReceipts(buyer.address, 0, 10);
      expect(receipts.length).to.equal(1);
      expect(receipts[0]).to.equal(orderId);
    });

    it("Should return vendor earnings", async function () {
      expect(await paymentRouter.getVendorEarnings(vendor.address)).to.equal(0);
    });

    it("Should calculate USDC amount correctly", async function () {
      const usdcAmount = await paymentRouter.calculateUSDCAmount(PAYMENT_AMOUNT_GHS);
      const expectedAmount = (BigInt(PAYMENT_AMOUNT_GHS) * EXCHANGE_RATE) / ethers.parseUnits("1", 6);
      expect(usdcAmount).to.equal(expectedAmount);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await paymentRouter.pause();
      expect(await paymentRouter.paused()).to.be.true;
    });

    it("Should not allow payments when paused", async function () {
      await paymentRouter.pause();

      await expect(
        paymentRouter.connect(buyer).initiateQuickPay(vendor.address, PAYMENT_AMOUNT_GHS),
      ).to.be.revertedWithCustomError(paymentRouter, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await paymentRouter.pause();
      await paymentRouter.unpause();
      expect(await paymentRouter.paused()).to.be.false;
    });
  });
});
