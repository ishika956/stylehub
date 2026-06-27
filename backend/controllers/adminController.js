const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Product = require("../models/Product");
const Outfit = require("../models/Outfit");

// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, users: users.map((u) => u.toPublicJSON()) });
});

// @route PUT /api/admin/users/:id/role  { role }
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["customer", "seller", "stylist", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, user: user.toPublicJSON() });
});

// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, message: "User removed" });
});

// @route GET /api/admin/comments (moderation queue)
const getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate("user", "name avatar")
    .populate("outfit", "title")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, comments });
});

// @route PUT /api/admin/comments/:id/hide
const toggleHideComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  comment.isHidden = !comment.isHidden;
  await comment.save();
  res.json({ success: true, comment });
});

// @route DELETE /api/admin/products/:id
const adminDeleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Product removed by admin" });
});

// @route DELETE /api/admin/outfits/:id
const adminDeleteOutfit = asyncHandler(async (req, res) => {
  await Outfit.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Outfit removed by admin" });
});

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllComments,
  toggleHideComment,
  adminDeleteProduct,
  adminDeleteOutfit,
};
