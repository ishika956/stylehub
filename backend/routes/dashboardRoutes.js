const express = require("express");
const router = express.Router();
const {
  getSellerDashboard,
  getStylistDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.get("/seller", protect, authorize("seller", "admin"), getSellerDashboard);
router.get("/stylist", protect, authorize("stylist", "admin"), getStylistDashboard);
router.get("/admin", protect, authorize("admin"), getAdminDashboard);

module.exports = router;
