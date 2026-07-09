const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetOtp,   // <-- add
  resetPassword,
  verifyEmail,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOtp);      // <-- new
router.post("/reset-password", resetPassword);   // <-- was "/reset-password/:token"
router.get("/verify-email/:token", verifyEmail);
router.get("/me", protect, getMe);

module.exports = router;
