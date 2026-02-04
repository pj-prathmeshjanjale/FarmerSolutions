import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";

// Initialize Razorpay only if keys exist
let razorpay = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// ===============================
// ONBOARD SELLER (CREATE LINKED ACCOUNT)
// ===============================
// ===============================
// ONBOARD SELLER (CREATE LINKED ACCOUNT)
// ===============================
export const createConnectedAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name, email, phone } = req.body;

    if (!razorpay) {
      return res.status(500).json({ message: "Payment service unavailable" });
    }

    // 1. Create Account on Razorpay
    // Note: In Test Mode, creating linked accounts usually works with minimal fields
    // But we should try to match the API requirements.
    const account = await razorpay.accounts.create({
      email: email,
      phone: phone,
      legal_business_name: name,
      contact_name: name,
      business_type: "individual", // Required field
      type: "standard",
      profile: {
        category: "agriculture",
        subcategory: "farming"
      }
    });

    // 2. Save acc_id to User
    const user = await User.findByIdAndUpdate(
      userId,
      { razorpayAccountId: account.id },
      { new: true }
    );

    res.json({
      success: true,
      message: "Seller account verified",
      accountId: account.id,
      user
    });

  } catch (error) {
    console.error("Onboarding Error Full:", error);

    // FALLBACK FOR DEV/TESTING (If Route is not enabled)
    // If we get "Access Denied" or any other error in development, 
    // we mock the success so the user can continue testing the UI flow.
    // Check if we are in development (assuming local dev is not production)
    // Or loosely check key prefix if ENV var isn't reliable
    if (process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test")) {
      console.warn("⚠️ FALLBACK: Razorpay Route failed. Using MOCK Account ID for testing.");

      const mockAccountId = `acc_mock_${Date.now()}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { razorpayAccountId: mockAccountId },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Seller account verified (Dev Mode Bypass)",
        accountId: mockAccountId,
        user
      });
    }

    // Razorpay error description often lies in error.error.description
    if (error.error) {
      console.error("Razorpay API Error:", error.error);
    }

    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Onboarding failed"
    });
  }
};

// ===============================
// CREATE PAYMENT ORDER (SPLIT)
// ===============================
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment service not configured"
      });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required"
      });
    }

    // Populate seller to get razorpayAccountId
    const order = await Order.findById(orderId).populate("seller");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Prepare Razorpay Options
    const amountInPaise = Math.round(order.amount * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${order._id}`,
      transfers: []
    };

    // SPLIT PAYMENT LOGIC
    // If seller has a linked account, transfer 95% to them
    if (
      order.seller &&
      order.seller.razorpayAccountId &&
      !order.seller.razorpayAccountId.startsWith("acc_mock_")
    ) {
      const sellerShare = Math.round(amountInPaise * 0.95); // 95% to Seller

      options.transfers.push({
        account: order.seller.razorpayAccountId,
        amount: sellerShare,
        currency: "INR",
        notes: {
          branch: "GreatSolutions Commission: 5%"
        },
        linked_account_notes: ["branch"],
        on_hold: 0 // Settlement happens immediately (or as per schedule)
      });
    }

    const razorpayOrder = await razorpay.orders.create(options);

    const payment = await Payment.create({
      order: order._id,
      farmer: req.user.id, // payer
      amount: order.amount,
      razorpayOrderId: razorpayOrder.id
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      paymentId: payment._id
    });

  } catch (error) {
    console.error("Create Payment Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment order creation failed"
    });
  }
};

// ===============================
// VERIFY PAYMENT
// ===============================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment details"
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // Update payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    payment.status = "PAID";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Update order status
    const order = await Order.findByIdAndUpdate(
      payment.order,
      { status: "CONFIRMED" },
      { new: true }
    );

    // If RENT order → mark equipment unavailable
    if (order.orderType === "RENT") {
      await Equipment.findByIdAndUpdate(order.equipment, {
        availability: false
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.error("Verify Payment Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};
