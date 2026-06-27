const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["product", "outfit"], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  outfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit" }, // present if bought as part of an outfit
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  image: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],

    itemsTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },

    // For commission split bookkeeping, computed at order time
    commissionBreakdown: [
      {
        stylist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        outfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit" },
        stylistCommission: Number, // 10% of outfit sale
        platformCommission: Number, // 5% of outfit sale
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
