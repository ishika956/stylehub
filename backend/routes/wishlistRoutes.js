const express = require("express");
const router = express.Router();
const {
  getWishlist,
  toggleProductInWishlist,
  toggleOutfitInWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getWishlist);
router.post("/products/:productId", protect, toggleProductInWishlist);
router.post("/outfits/:outfitId", protect, toggleOutfitInWishlist);

module.exports = router;
