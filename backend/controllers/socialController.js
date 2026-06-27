const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Outfit = require("../models/Outfit");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

// @route POST /api/social/follow/:userId
const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.userId;
  if (String(targetId) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const target = await User.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error("User not found");
  }

  const me = await User.findById(req.user._id);
  const alreadyFollowing = me.following.some((id) => String(id) === String(targetId));

  if (alreadyFollowing) {
    me.following = me.following.filter((id) => String(id) !== String(targetId));
    target.followers = target.followers.filter((id) => String(id) !== String(req.user._id));
  } else {
    me.following.push(targetId);
    target.followers.push(req.user._id);
    await Notification.create({
      user: target._id,
      type: "new_follower",
      message: `${me.name} started following you`,
      relatedUser: me._id,
    });
  }

  await me.save();
  await target.save();

  res.json({ success: true, following: !alreadyFollowing });
});

// @route POST /api/social/outfits/:id/like
const toggleLike = asyncHandler(async (req, res) => {
  const outfit = await Outfit.findById(req.params.id);
  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }

  const existing = await Like.findOne({ user: req.user._id, outfit: outfit._id });

  if (existing) {
    await existing.deleteOne();
    outfit.likesCount = Math.max(0, outfit.likesCount - 1);
    await outfit.save();
    return res.json({ success: true, liked: false, likesCount: outfit.likesCount });
  }

  await Like.create({ user: req.user._id, outfit: outfit._id });
  outfit.likesCount += 1;
  await outfit.save();

  if (String(outfit.stylist) !== String(req.user._id)) {
    await Notification.create({
      user: outfit.stylist,
      type: "outfit_liked",
      message: `${req.user.name} liked your outfit "${outfit.title}"`,
      relatedUser: req.user._id,
      relatedOutfit: outfit._id,
    });
  }

  res.json({ success: true, liked: true, likesCount: outfit.likesCount });
});

// @route POST /api/social/outfits/:id/comments  { text }
const addComment = asyncHandler(async (req, res) => {
  const outfit = await Outfit.findById(req.params.id);
  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }
  if (!req.body.text || !req.body.text.trim()) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const comment = await Comment.create({
    user: req.user._id,
    outfit: outfit._id,
    text: req.body.text.trim(),
  });
  await comment.populate("user", "name avatar");

  if (String(outfit.stylist) !== String(req.user._id)) {
    await Notification.create({
      user: outfit.stylist,
      type: "outfit_commented",
      message: `${req.user.name} commented on "${outfit.title}"`,
      relatedUser: req.user._id,
      relatedOutfit: outfit._id,
    });
  }

  res.status(201).json({ success: true, comment });
});

// @route GET /api/social/outfits/:id/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ outfit: req.params.id, isHidden: false })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, comments });
});

// @route DELETE /api/social/comments/:id (owner or admin moderation)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  if (String(comment.user) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized");
  }
  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted" });
});

// @route GET /api/social/stylists/:id (public stylist profile)
const getStylistProfile = asyncHandler(async (req, res) => {
  const stylist = await User.findOne({ _id: req.params.id, role: "stylist" }).select(
    "name avatar stylistProfile followers following createdAt"
  );
  if (!stylist) {
    res.status(404);
    throw new Error("Stylist not found");
  }

  const outfits = await Outfit.find({ stylist: stylist._id, isPublished: true }).sort({
    createdAt: -1,
  });

  const isFollowing = req.user
    ? stylist.followers.some((id) => String(id) === String(req.user._id))
    : false;

  res.json({
    success: true,
    stylist: {
      id: stylist._id,
      name: stylist.name,
      avatar: stylist.avatar,
      bio: stylist.stylistProfile?.bio,
      specialties: stylist.stylistProfile?.specialties,
      followersCount: stylist.followers.length,
      outfitsCount: outfits.length,
      memberSince: stylist.createdAt,
      isFollowing,
    },
    outfits,
  });
});

module.exports = {
  toggleFollow,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  getStylistProfile,
};
