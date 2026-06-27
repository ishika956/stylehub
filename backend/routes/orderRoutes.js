const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/seller/mine", protect, authorize("seller", "admin"), getSellerOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, authorize("seller", "admin"), updateOrderStatus);

module.exports = router;
