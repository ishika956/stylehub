const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    outfit: { type: mongoose.Schema.Types.ObjectId, ref: "Outfit", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    isHidden: { type: Boolean, default: false }, // for admin moderation
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
