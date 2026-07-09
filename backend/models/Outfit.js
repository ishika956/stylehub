const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema(
  {
    stylist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" }, // stylist-uploaded "look" photo
    aiThumbnail: { type: String, default: "" }, // auto-generated collage
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String },
      },
    ],

    // Discovery tags
    occasion: {
      type: String,
      enum: ["College", "Office", "Wedding", "Interview", "Party", "Casual", "Date", "Festive"],
    },
    style: {
      type: String,
      enum: ["Streetwear", "Formal", "Casual", "Ethnic", "Athleisure", "Minimal"],
    },
    season: { type: String, enum: ["Summer", "Winter", "Monsoon", "All-Season"] },
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
    budget: { type: Number }, // recommended budget bucket for filtering

    totalPrice: { type: Number, default: 0 }, // computed from product prices
    stylistNote: { type: String, default: "" },

    isPublished: { type: Boolean, default: true },

    likesCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },

    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

outfitSchema.index({ title: "text", stylistNote: "text" });

module.exports = mongoose.model("Outfit", outfitSchema);
