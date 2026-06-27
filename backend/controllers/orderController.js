const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Outfit = require("../models/Outfit");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

const PLATFORM_COMMISSION_RATE = 0.05; // 5%
const STYLIST_COMMISSION_RATE = 0.1; // 10%

/**
 * Accepts a cart-like payload and builds order items, validating stock.
 * cartItems: [{ itemType: "product"|"outfit", productId, outfitId, size, quantity }]
 */
const buildOrderItems = async (cartItems) => {
  const items = [];
  const commissionBreakdown = [];
  let itemsTotal = 0;

  for (const cartItem of cartItems) {
    if (cartItem.itemType === "product") {
      const product = await Product.findById(cartItem.productId);
      if (!product || !product.isActive) throw new Error("A product in your cart is unavailable");
      const qty = cartItem.quantity || 1;
      if (product.stock < qty) throw new Error(`Insufficient stock for ${product.name}`);

      const price = product.discountPrice || product.price;
      items.push({
        itemType: "product",
        product: product._id,
        seller: product.seller,
        name: product.name,
        image: product.images?.[0],
        size: cartItem.size,
        price,
        quantity: qty,
      });
      itemsTotal += price * qty;
      product.stock -= qty;
      await product.save();
    } else if (cartItem.itemType === "outfit") {
      // "Buy Complete Outfit": expand into all underlying products
      const outfit = await Outfit.findById(cartItem.outfitId).populate("products.product");
      if (!outfit || !outfit.isPublished) throw new Error("Outfit unavailable");

      let outfitTotal = 0;
      for (const entry of outfit.products) {
        const product = entry.product;
        if (!product || !product.isActive || product.stock < 1) {
          throw new Error(`"${product?.name || "An item"}" in this outfit is out of stock`);
        }
        const price = product.discountPrice || product.price;
        items.push({
          itemType: "outfit",
          product: product._id,
          outfit: outfit._id,
          seller: product.seller,
          name: product.name,
          image: product.images?.[0],
          size: entry.size,
          price,
          quantity: 1,
        });
        outfitTotal += price;
        product.stock -= 1;
        await product.save();
      }

      itemsTotal += outfitTotal;

      const stylistCommission = +(outfitTotal * STYLIST_COMMISSION_RATE).toFixed(2);
      const platformCommission = +(outfitTotal * PLATFORM_COMMISSION_RATE).toFixed(2);
      commissionBreakdown.push({
        stylist: outfit.stylist,
        outfit: outfit._id,
        stylistCommission,
        platformCommission,
      });

      outfit.salesCount += 1;
      await outfit.save();
    } else {
      throw new Error("Invalid cart item type");
    }
  }

  return { items, itemsTotal, commissionBreakdown };
};

// @route POST /api/orders  -> creates a pending order (paymentStatus: pending) before Razorpay checkout
const createOrder = asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress } = req.body;
  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const { items, itemsTotal, commissionBreakdown } = await buildOrderItems(cartItems);

  const shippingFee = itemsTotal > 999 ? 0 : 79;
  const totalAmount = itemsTotal + shippingFee;

  const order = await Order.create({
    customer: req.user._id,
    items,
    itemsTotal,
    shippingFee,
    totalAmount,
    shippingAddress,
    commissionBreakdown,
  });

  res.status(201).json({ success: true, order });
});

// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("customer", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const isOwner = String(order.customer._id) === String(req.user._id);
  const isSellerOnOrder = order.items.some((i) => String(i.seller) === String(req.user._id));
  if (!isOwner && !isSellerOnOrder && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json({ success: true, order });
});

// @route GET /api/orders/seller/mine (seller dashboard: orders containing their products)
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ "items.seller": req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @route PUT /api/orders/:id/status (seller/admin updates shipping status)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isSellerOnOrder = order.items.some((i) => String(i.seller) === String(req.user._id));
  if (!isSellerOnOrder && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this order");
  }

  order.orderStatus = orderStatus;
  await order.save();

  if (orderStatus === "shipped" || orderStatus === "delivered") {
    await Notification.create({
      user: order.customer,
      type: orderStatus === "shipped" ? "order_shipped" : "order_delivered",
      message: `Your order #${order._id.toString().slice(-6)} has been ${orderStatus}`,
      relatedOrder: order._id,
    });
  }

  res.json({ success: true, order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus,
};
