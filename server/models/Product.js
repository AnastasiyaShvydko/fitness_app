
// models/Product.js
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  sku: { type: String, },
  size: { type: String, required: true },       // "38","39","40"...
  color: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [String], // если картинки отличаются у варианта
}, { _id: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug:  { type: String, required: true, unique: true },
  description: String,
  category: String,
  baseImages: [String],   // общие фото
  rating: { type: Number, default: 0 },
  variants: [variantSchema]
}, { timestamps: true });

// Уникальный slug
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { sparse: true });              // индекс по полю продукта
productSchema.index({ "variants.sku": 1 }, { sparse: true });   // индекс по SKU внутри variants[]



module.exports = mongoose.model("Product", productSchema);

