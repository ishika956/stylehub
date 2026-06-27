const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["customer", "seller", "stylist", "admin"],
      default: "customer",
    },

    // Stylist membership info
    membership: {
      isActive: { type: Boolean, default: false },
      plan: { type: String, enum: ["monthly", "yearly", null], default: null },
      startedAt: { type: Date },
      expiresAt: { type: Date },
    },

    // Seller profile info
    sellerProfile: {
      brandName: { type: String },
      description: { type: String },
      gstNumber: { type: String },
    },

    // Stylist profile info
    stylistProfile: {
      bio: { type: String },
      specialties: [{ type: String }], // e.g. ["streetwear", "formal"]
      earnings: { type: Number, default: 0 },
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    membership: this.membership,
    sellerProfile: this.sellerProfile,
    stylistProfile: this.stylistProfile,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
