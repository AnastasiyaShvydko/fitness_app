// server/routes/upload.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/image", upload.single("file"), async (req, res) => {
  try {
    const b64 = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "products",       // папка в Cloudinary
      overwrite: false,
      resource_type: "image",
    });

    // сохраняй result.secure_url в Mongo (baseImages[] или variants[i].images[])
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

module.exports = router;
