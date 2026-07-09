const asyncHandler = require("express-async-handler");
const { generateText } = require("../utils/ai");

const productDescription = asyncHandler(async (req, res) => {
  const { name, category, brand, color } = req.body;
  if (!name) { res.status(400); throw new Error("Product name is required"); }

  const text = await generateText(
    "You are a fashion copywriter for an Indian online marketplace. Write a vivid, honest product description in 2-3 sentences. No emojis, no markdown, no surrounding quotes.",
    `Product: ${name}. Category: ${category || "n/a"}. Brand: ${brand || "n/a"}. Color: ${color || "n/a"}.`
  );
  if (!text) { res.status(503); throw new Error("AI is unavailable right now"); }
  res.json({ success: true, description: text });
});

const outfitDescription = asyncHandler(async (req, res) => {
  const { title, productNames, occasion, style, season } = req.body;
  if (!title) { res.status(400); throw new Error("Outfit title is required"); }

  const text = await generateText(
    "You are a professional fashion stylist writing for an Indian marketplace. Describe the vibe of a curated outfit in 2-3 sentences. No emojis, no markdown, no surrounding quotes.",
    `Outfit: ${title}. Pieces: ${(productNames || []).join(", ") || "n/a"}. Occasion: ${occasion || "n/a"}. Style: ${style || "n/a"}. Season: ${season || "n/a"}.`
  );
  if (!text) { res.status(503); throw new Error("AI is unavailable right now"); }
  res.json({ success: true, description: text });
});

module.exports = { productDescription, outfitDescription };