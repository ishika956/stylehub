const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Outfit = require("../models/Outfit");

const recomputeRating = async (Model, targetId, targetField) => {
  const stats = await Review.aggregate([
    { $match: { [targetField]: targetId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
  ]);

  const { avgRating = 0, numReviews = 0 } = stats[0] || {};
  await Model.findByIdAndUpdate(targetId, {
    avgRating: +avgRating.toFixed(1),
    numReviews,
  });
};

// @route POST /api/reviews/products/:productId  { rating, text }
const reviewProduct = asyncHandler(async (req, res) => {
  const { rating, text } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: product._id },
    { rating, text, targetType: "product" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recomputeRating(Product, product._id, "product");
  res.status(201).json({ success: true, review });
});

// @route POST /api/reviews/outfits/:outfitId  { rating, text }
const reviewOutfit = asyncHandler(async (req, res) => {
  const { rating, text } = req.body;
  const outfit = await Outfit.findById(req.params.outfitId);
  if (!outfit) {
    res.status(404);
    throw new Error("Outfit not found");
  }

  const review = await Review.findOneAndUpdate(
    { user: req.user._id, outfit: outfit._id },
    { rating, text, targetType: "outfit" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recomputeRating(Outfit, outfit._id, "outfit");
  res.status(201).json({ success: true, review });
});

// @route GET /api/reviews/products/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

// @route GET /api/reviews/outfits/:outfitId
const getOutfitReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ outfit: req.params.outfitId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

module.exports = { reviewProduct, reviewOutfit, getProductReviews, getOutfitReviews };
