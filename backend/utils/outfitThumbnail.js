const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

const CANVAS = 900;
const PAD = 12;
const BG = { r: 245, g: 240, b: 233 }; // warm bone

const fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", format: "jpg" },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// Up to 4 product image URLs -> collage -> Cloudinary URL (or null if none usable)
const generateOutfitThumbnail = async (imageUrls, title = "") => {
  const urls = (imageUrls || []).filter(Boolean).slice(0, 4);
  if (urls.length === 0) return null;

  const cell = Math.floor((CANVAS - PAD * 3) / 2);
  const positions = [
    { left: PAD, top: PAD },
    { left: PAD * 2 + cell, top: PAD },
    { left: PAD, top: PAD * 2 + cell },
    { left: PAD * 2 + cell, top: PAD * 2 + cell },
  ];

  const tiles = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const buf = await fetchBuffer(urls[i]);
      const resized = await sharp(buf)
        .resize(cell, cell, { fit: "cover", position: "attention" })
        .toBuffer();
      tiles.push({ input: resized, ...positions[i] });
    } catch (_) { /* skip broken image */ }
  }
  if (tiles.length === 0) return null;

  const overlays = [...tiles];
  if (title) {
    const safe = String(title).slice(0, 40).replace(/[<&>]/g, "");
    overlays.push({
      input: Buffer.from(
        `<svg width="${CANVAS}" height="${CANVAS}">
           <rect x="0" y="${CANVAS - 88}" width="${CANVAS}" height="88" fill="rgba(30,25,20,0.72)"/>
           <text x="${CANVAS / 2}" y="${CANVAS - 32}" font-family="Georgia, serif"
                 font-size="40" fill="#fff" text-anchor="middle">${safe}</text>
         </svg>`
      ),
      top: 0,
      left: 0,
    });
  }

  const composite = await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 3, background: BG },
  }).composite(overlays).jpeg({ quality: 82 }).toBuffer();

  return uploadBuffer(composite, "stylehub/outfit-thumbnails");
};

module.exports = { generateOutfitThumbnail };