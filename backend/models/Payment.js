const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    purpose: {
      type: String,
      enum: ["order", "membership"],
      required: true,
    },

    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    membership: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },

    amount: { type: Number, required: true }, // in rupees
    currency: { type: String, default: "INR" },

    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
