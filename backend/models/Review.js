const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["product", "outfit"], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    outfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, outfit: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);
