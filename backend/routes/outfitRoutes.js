const express = require("express");
const router = express.Router();
const {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  getMyOutfits,
} = require("../controllers/outfitController");
const { protect, optionalAuth } = require("../middleware/auth");
const { authorize, requireActiveMembership } = require("../middleware/role");

router.get("/", optionalAuth, getOutfits);
router.get("/stylist/mine", protect, authorize("stylist", "admin"), getMyOutfits);
router.get("/:id", optionalAuth, getOutfitById);
router.post("/", protect, authorize("stylist", "admin"), requireActiveMembership, createOutfit);
router.put("/:id", protect, authorize("stylist", "admin"), updateOutfit);
router.delete("/:id", protect, authorize("stylist", "admin"), deleteOutfit);

module.exports = router;
