const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Outfit = require("../models/Outfit");
const Order = require("../models/Order");
const User = require("../models/User");
const Membership = require("../models/Membership");

// @route GET /api/dashboard/seller
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const products = await Product.find({ seller: sellerId });
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  const orders = await Order.find({ "items.seller": sellerId });
  let revenue = 0;
  let unitsSold = 0;
  orders.forEach((order) => {
    order.items
      .filter((i) => String(i.seller) === String(sellerId))
      .forEach((i) => {
        if (order.paymentStatus === "paid") {
          revenue += i.price * i.quantity;
          unitsSold += i.quantity;
        }
      });
  });

  res.json({
    success: true,
    stats: {
      totalProducts,
      lowStock,
      totalOrders: orders.length,
      revenue,
      unitsSold,
    },
    recentOrders: orders.slice(-10).reverse(),
  });
});

// @route GET /api/dashboard/stylist
const getStylistDashboard = asyncHandler(async (req, res) => {
  const stylistId = req.user._id;

  const outfits = await Outfit.find({ stylist: stylistId });
  const totalOutfits = outfits.length;
  const totalViews = outfits.reduce((s, o) => s + o.viewsCount, 0);
  const totalLikes = outfits.reduce((s, o) => s + o.likesCount, 0);
  const totalSales = outfits.reduce((s, o) => s + o.salesCount, 0);

  const user = await User.findById(stylistId);

  res.json({
    success: true,
    stats: {
      totalOutfits,
      totalViews,
      totalLikes,
      totalSales,
      followers: user.followers.length,
      earnings: user.stylistProfile?.earnings || 0,
      membership: user.membership,
    },
    topOutfits: [...outfits].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5),
  });
});

// @route GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: "customer" });
  const totalSellers = await User.countDocuments({ role: "seller" });
  const totalStylists = await User.countDocuments({ role: "stylist" });

  const totalProducts = await Product.countDocuments();
  const totalOutfits = await Outfit.countDocuments();

  const paidOrders = await Order.find({ paymentStatus: "paid" });
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);

  const activeMemberships = await Membership.find({ status: "active", expiresAt: { $gt: new Date() } });
  const membershipRevenue = activeMemberships.reduce((s, m) => s + m.amount, 0);

  const topStylists = await User.find({ role: "stylist" })
    .sort({ "stylistProfile.earnings": -1 })
    .limit(5)
    .select("name avatar stylistProfile.earnings followers");

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCustomers,
      totalSellers,
      totalStylists,
      totalProducts,
      totalOutfits,
      totalOrders: paidOrders.length,
      totalRevenue,
      membershipRevenue,
    },
    topStylists,
  });
});

module.exports = { getSellerDashboard, getStylistDashboard, getAdminDashboard };
