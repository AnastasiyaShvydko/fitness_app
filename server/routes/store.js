const express = require("express");
const router = express.Router();
const Product = require('../models/Product'); // your MongoDB Product model


// Тестовые данные
// const products = [
//   {
//     id: "1",
//     slug: "shoes-classic",
//     title: "Shoes Classic",
//     price: 100,
//     category: "shoes",
//     baseImages: ["/LoginPic.png", "/LoginPic.png"],
//     rating: 4,
//     variants: [
//       { sku: "SHCL-38", size: "38", stock: 5, images: ["/SignUpPic.png"] },
//       { sku: "SHCL-39", size: "39", stock: 2 },
//       { sku: "SHCL-40", size: "40", stock: 0 }
//     ]
//   },
//   {
//     id: "2",
//     slug: "earphone-pro",
//     title: "Earphone Pro",
//     price: 40,
//     category: "earphone",
//     images: ["/img/ear-1.png", "/img/ear-2.png", "/img/ear-3.png"],
//     variants: [{ sku: "EARPRO-STD", size: "STD", stock: 12 }]
//   }
// ];

// GET /api/store/products?search=
router.get("/products", async  (req, res) => {
    try {
    const products = await Product.find();
    console.log("products.count", products.length);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
//   const { search = "" } = req.query;
//   const q = search.trim().toLowerCase();
//   const items = q
//     ? products.filter(p => p.title.toLowerCase().includes(q))
//     : products;
//   res.json({ items, total: items.length });
});

// GET /api/store/products/:slug
router.get("/products/:slug", async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// GET /api/store/categories
router.get("/categories", (_req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

router.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
