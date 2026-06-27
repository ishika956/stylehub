const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadImages } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// POST /api/upload — multipart/form-data, field name "images", up to 6 files
// Sellers, stylists, and admins can upload product/outfit photos
router.post(
  "/",
  protect,
  authorize("seller", "stylist", "admin"),
  upload.array("images", 6),
  uploadImages
);

module.exports = router;
