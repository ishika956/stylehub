const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [], outfits: [] });
  return wishlist;
};

// @route GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate("products")
    .populate({ path: "outfits", populate: { path: "stylist", select: "name avatar" } });
  res.json({ success: true, wishlist: wishlist || { products: [], outfits: [] } });
});

// @route POST /api/wishlist/products/:productId
const toggleProductInWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  const id = req.params.productId;
  const exists = wishlist.products.some((p) => String(p) === id);
  wishlist.products = exists
    ? wishlist.products.filter((p) => String(p) !== id)
    : [...wishlist.products, id];
  await wishlist.save();
  res.json({ success: true, inWishlist: !exists });
});

// @route POST /api/wishlist/outfits/:outfitId
const toggleOutfitInWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  const id = req.params.outfitId;
  const exists = wishlist.outfits.some((o) => String(o) === id);
  wishlist.outfits = exists
    ? wishlist.outfits.filter((o) => String(o) !== id)
    : [...wishlist.outfits, id];
  await wishlist.save();
  res.json({ success: true, inWishlist: !exists });
});

module.exports = { getWishlist, toggleProductInWishlist, toggleOutfitInWishlist };
