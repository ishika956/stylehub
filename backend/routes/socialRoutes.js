const express = require("express");
const router = express.Router();
const {
  toggleFollow,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  getStylistProfile,
} = require("../controllers/socialController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/follow/:userId", protect, toggleFollow);
router.post("/outfits/:id/like", protect, toggleLike);
router.post("/outfits/:id/comments", protect, addComment);
router.get("/outfits/:id/comments", getComments);
router.delete("/comments/:id", protect, deleteComment);
router.get("/stylists/:id", optionalAuth, getStylistProfile);

module.exports = router;
