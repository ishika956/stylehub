const asyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");

// Uploads a single buffer to Cloudinary, resolves with the secure URL
const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// @route POST /api/upload
// @desc  Upload one or more images (multipart/form-data, field name "images")
// @access Private (seller / stylist / admin)
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const urls = await Promise.all(
    req.files.map((file) => uploadBufferToCloudinary(file.buffer, "stylehub/products"))
  );

  res.json({ success: true, urls });
});

module.exports = { uploadImages };
