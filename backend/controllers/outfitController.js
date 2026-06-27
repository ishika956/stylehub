const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Outfit = require("../models/Outfit");
const Product = require("../models/Product");
const Like = require("../models/Like");

// Recalculates totalPrice from the linked products
const computeTotalPrice = async (productEntries) => {
  const ids = productEntries.map((p) => p.product);
  const products = await Product.find({ _id: { $in: ids } });
  const priceMap = new Map(products.map((p) => [String(p._id), p.discountPrice || p.price]));
  return productEntries.reduce((sum, entry) => sum + (priceMap.get(String(entry.product)) || 0), 0);
};

// @route GET /api/outfits
// Discovery filters: ?occasion=&style=&season=&gender=&maxBudget=&keyword=&page=&limit=&sort=
const getOutfits = asyncHandler(async (req, res) => {
  const { occasion, style, season, gender, maxBudget, keyword, sort } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const filter = { isPublished: true };
  if (occasion) filter.occasion = occasion;
  if (style) filter.style = style;
  if (season) filter.season = season;
  if (gender) filter.gender = gender;
  if (maxBudget) filter.totalPrice = { $lte: Number(maxBudget) };
  if (keyword) filter.$text = { $search: keyword };

  let sortOption = { createdAt: -1 };
  if (sort === "popular") sortOption = { likesCount: -1 };
  if (sort === "price_asc") sortOption = { totalPrice: 1 };
  if (sort === "price_desc") sortOption = { totalPrice: -1 };
  if (sort === "bestselling") sortOption = { salesCount: -1 };

  const total = await Outfit.countDocuments(filter);
  const outfits = await Outfit.find(filter)
    .populate("stylist", "name avatar stylistProfile.specialties")
    .populate("products.product", "name price discountPrice images stock")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  let likedSet = new Set();
  if (req.user) {
    const likes = await Like.find({ user: req.user._id, outfit: { $in: outfits.map((o) => o._id) } });
    likedSet = new Set(likes.map((l) => String(l.outfit)));
  }
  const outfitsWithLikeState = outfits.map((o) => ({
    ...o.toObject(),
    isLiked: likedSet.has(String(o._id)),
  }));

  res.json({ success: true, outfits: outfitsWithLikeState, page, pages: Math.ceil(total / limit), total });
});

// @route GET /api/outfits/:id
const getOutfitById = asyncHandler(async (req, res) => {
  const outfit = await Outfit.findById(req.params.id)
    .populate("stylist", "name avatar stylistProfile followers")
    .populate("products.product");

  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }

  outfit.viewsCount += 1;
  await outfit.save();

  let isLiked = false;
  if (req.user) {
    isLiked = Boolean(await Like.findOne({ user: req.user._id, outfit: outfit._id }));
  }

  res.json({ success: true, outfit: { ...outfit.toObject(), isLiked } });
});

// @route POST /api/outfits (stylist with active membership)
const createOutfit = asyncHandler(async (req, res) => {
  const { title, description, coverImage, products, occasion, style, season, gender, budget, stylistNote } =
    req.body;

  if (!title || !products || products.length === 0) {
    res.status(400);
    throw new Error("title and at least one product are required");
  }

  // Validate referenced products exist
  for (const entry of products) {
    if (!mongoose.Types.ObjectId.isValid(entry.product)) {
      res.status(400);
      throw new Error("Invalid product id in outfit");
    }
  }

  const totalPrice = await computeTotalPrice(products);

  const outfit = await Outfit.create({
    stylist: req.user._id,
    title,
    description,
    coverImage,
    products,
    occasion,
    style,
    season,
    gender,
    budget,
    stylistNote,
    totalPrice,
  });

  res.status(201).json({ success: true, outfit });
});

// @route PUT /api/outfits/:id (owning stylist or admin)
const updateOutfit = asyncHandler(async (req, res) => {
  const outfit = await Outfit.findById(req.params.id);
  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }
  if (String(outfit.stylist) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to edit this outfit");
  }

  const fields = [
    "title",
    "description",
    "coverImage",
    "products",
    "occasion",
    "style",
    "season",
    "gender",
    "budget",
    "stylistNote",
    "isPublished",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) outfit[f] = req.body[f];
  });

  if (req.body.products) {
    outfit.totalPrice = await computeTotalPrice(req.body.products);
  }

  await outfit.save();
  res.json({ success: true, outfit });
});

// @route DELETE /api/outfits/:id (owning stylist or admin)
const deleteOutfit = asyncHandler(async (req, res) => {
  const outfit = await Outfit.findById(req.params.id);
  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }
  if (String(outfit.stylist) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this outfit");
  }
  await outfit.deleteOne();
  res.json({ success: true, message: "Outfit deleted" });
});

// @route GET /api/outfits/stylist/mine
const getMyOutfits = asyncHandler(async (req, res) => {
  const outfits = await Outfit.find({ stylist: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, outfits });
});

module.exports = {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  getMyOutfits,
};
