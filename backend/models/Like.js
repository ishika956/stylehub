const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    outfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit", required: true },
  },
  { timestamps: true }
);

// a user can only like a given outfit once
likeSchema.index({ user: 1, outfit: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);
