const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      enum: [
        "T-Shirts",
        "Shirts",
        "Hoodies",
        "Jeans",
        "Trousers",
        "Jackets",
        "Shoes",
        "Accessories",
        "Top",
        "Dress"
      ],
    },
    brand: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    color: { type: String },
    sizes: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }],
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
    isActive: { type: Boolean, default: true },

    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
