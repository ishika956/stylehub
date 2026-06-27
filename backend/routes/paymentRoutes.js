const express = require("express");
const router = express.Router();
const {
  createOrderPayment,
  createMembershipPayment,
  verifyOrderPayment,
  verifyMembershipPayment,
  razorpayWebhook,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/order/:orderId/create", protect, createOrderPayment);
router.post("/order/verify", protect, verifyOrderPayment);
router.post("/membership/create", protect, createMembershipPayment);
router.post("/membership/verify", protect, verifyMembershipPayment);
router.post("/webhook", razorpayWebhook); // raw Razorpay server callback, no auth

module.exports = router;
