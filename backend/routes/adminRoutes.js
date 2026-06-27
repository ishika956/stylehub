const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllComments,
  toggleHideComment,
  adminDeleteProduct,
  adminDeleteOutfit,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/comments", getAllComments);
router.put("/comments/:id/hide", toggleHideComment);
router.delete("/products/:id", adminDeleteProduct);
router.delete("/outfits/:id", adminDeleteOutfit);

module.exports = router;
