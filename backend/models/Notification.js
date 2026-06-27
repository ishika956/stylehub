const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // recipient
    type: {
      type: String,
      enum: [
        "new_follower",
        "outfit_liked",
        "outfit_commented",
        "outfit_purchased",
        "order_shipped",
        "order_delivered",
        "membership_expiring",
        "membership_expired",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered it
    relatedOutfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit" },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
