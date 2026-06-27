const express = require("express");
const router = express.Router();
const {
  reviewProduct,
  reviewOutfit,
  getProductReviews,
  getOutfitReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/products/:productId", protect, reviewProduct);
router.get("/products/:productId", getProductReviews);
router.post("/outfits/:outfitId", protect, reviewOutfit);
router.get("/outfits/:outfitId", getOutfitReviews);

module.exports = router;
