const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/", getProducts);
router.get("/seller/mine", protect, authorize("seller", "admin"), getMyProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorize("seller", "admin"), createProduct);
router.put("/:id", protect, authorize("seller", "admin"), updateProduct);
router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
