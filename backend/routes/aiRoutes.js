const express = require("express");
const router = express.Router();
const { productDescription, outfitDescription } = require("../controllers/aiController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.post("/product-description", protect, authorize("seller", "admin"), productDescription);
router.post("/outfit-description", protect, authorize("stylist", "admin"), outfitDescription);

module.exports = router;