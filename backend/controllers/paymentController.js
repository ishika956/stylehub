const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const razorpay = require("../utils/razorpayClient");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Membership = require("../models/Membership");
const User = require("../models/User");
const Notification = require("../models/Notification");

const MEMBERSHIP_PLANS = {
  monthly: { amount: 499, days: 30 },
  yearly: { amount: 1999, days: 365 },
};

// @route POST /api/payments/order/:orderId/create
// Creates a Razorpay order for an existing pending Order document
const createOrderPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (String(order.customer) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized");
  }
  if (order.paymentStatus === "paid") {
    res.status(400);
    throw new Error("Order is already paid");
  }

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100), // paise
    currency: "INR",
    receipt: `order_${order._id}`,
    notes: { orderId: String(order._id), userId: String(req.user._id) },
  });

  const payment = await Payment.create({
    user: req.user._id,
    purpose: "order",
    order: order._id,
    amount: order.totalAmount,
    razorpayOrderId: rzpOrder.id,
    status: "created",
  });

  order.payment = payment._id;
  await order.save();

  res.json({
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @route POST /api/payments/membership/create  { plan: "monthly" | "yearly" }
const createMembershipPayment = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const planConfig = MEMBERSHIP_PLANS[plan];
  if (!planConfig) {
    res.status(400);
    throw new Error("plan must be 'monthly' or 'yearly'");
  }

  const rzpOrder = await razorpay.orders.create({
    amount: planConfig.amount * 100,
    currency: "INR",
    receipt: `mem_${Date.now()}`,
    notes: {
      userId: String(req.user._id),
      plan,
    },
  });

  const payment = await Payment.create({
    user: req.user._id,
    purpose: "membership",
    amount: planConfig.amount,
    razorpayOrderId: rzpOrder.id,
    status: "created",
  });

  res.json({
    success: true,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
    paymentRecordId: payment._id,
    plan,
  });
});

// Shared signature verification helper (standard Razorpay checkout flow)
const verifySignature = (orderId, paymentId, signature) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
};

// @route POST /api/payments/order/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyOrderPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    res.status(404);
    throw new Error("Payment record not found");
  }

  if (!isValid) {
    payment.status = "failed";
    await payment.save();
    res.status(400);
    throw new Error("Payment verification failed");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";
  await payment.save();

  const order = await Order.findById(payment.order);
  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  await order.save();

  // Notify stylists whose outfits were purchased
  for (const c of order.commissionBreakdown) {
    await User.findByIdAndUpdate(c.stylist, {
      $inc: { "stylistProfile.earnings": c.stylistCommission },
    });
    await Notification.create({
      user: c.stylist,
      type: "outfit_purchased",
      message: `One of your outfits was just purchased! You earned \u20b9${c.stylistCommission}`,
      relatedOutfit: c.outfit,
      relatedOrder: order._id,
    });
  }

  res.json({ success: true, message: "Payment verified", order });
});

// @route POST /api/payments/membership/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
const verifyMembershipPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    res.status(404);
    throw new Error("Payment record not found");
  }
  if (!isValid) {
    payment.status = "failed";
    await payment.save();
    res.status(400);
    throw new Error("Payment verification failed");
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";
  await payment.save();

  const planConfig = MEMBERSHIP_PLANS[plan];
  const expiresAt = new Date(Date.now() + planConfig.days * 24 * 60 * 60 * 1000);

  const membership = await Membership.create({
    user: req.user._id,
    plan,
    amount: planConfig.amount,
    expiresAt,
    payment: payment._id,
  });

  payment.membership = membership._id;
  await payment.save();

  // Upgrade role: Customer -> Stylist
  const user = await User.findById(req.user._id);
  user.role = "stylist";
  user.membership = { isActive: true, plan, startedAt: new Date(), expiresAt };
  await user.save();

  res.json({ success: true, message: "Membership activated", user: user.toPublicJSON() });
});

// @route POST /api/payments/webhook (Razorpay server-to-server webhook, optional but recommended)
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  // Acknowledge receipt; extend with event-specific handling (e.g. payment.failed) as needed
  res.json({ success: true });
});

module.exports = {
  createOrderPayment,
  createMembershipPayment,
  verifyOrderPayment,
  verifyMembershipPayment,
  razorpayWebhook,
};
