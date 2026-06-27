const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @route GET /api/products
// Supports: ?keyword=&category=&minPrice=&maxPrice=&gender=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, gender, brand, sort } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const filter = { isActive: true };
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { avgRating: -1 };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("seller", "name sellerProfile.brandName")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @route GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "name sellerProfile.brandName avatar"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ success: true, product });
});

// @route POST /api/products  (seller, admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, brand, price, discountPrice, color, sizes, stock, images, gender } =
    req.body;

  if (!name || !category || price === undefined || stock === undefined) {
    res.status(400);
    throw new Error("name, category, price and stock are required");
  }

  const product = await Product.create({
    seller: req.user._id,
    name,
    description,
    category,
    brand,
    price,
    discountPrice,
    color,
    sizes,
    stock,
    images,
    gender,
  });

  res.status(201).json({ success: true, product });
});

// @route PUT /api/products/:id (owning seller or admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (String(product.seller) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to edit this product");
  }

  const fields = [
    "name",
    "description",
    "category",
    "brand",
    "price",
    "discountPrice",
    "color",
    "sizes",
    "stock",
    "images",
    "gender",
    "isActive",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  await product.save();
  res.json({ success: true, product });
});

// @route DELETE /api/products/:id (owning seller or admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (String(product.seller) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this product");
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product deleted" });
});

// @route GET /api/products/seller/mine (seller dashboard)
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, products });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
