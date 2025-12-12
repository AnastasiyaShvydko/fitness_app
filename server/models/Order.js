// models/Order.js
const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  sku: String,
  title: String,
  unitPrice: Number, // в валютах, НЕ в центах
  qty: Number,
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  firstName: String, lastName: String,
  address1: String, address2: String,
  city: String, province: String, postal: String, country: String,
}, { _id: false });

const AmountsSchema = new mongoose.Schema({
  subtotal: Number,
  shipping: Number,
  discount: Number,
  total: Number,
  currency: String, // "CAD"
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customer: { email: String, phone: String, name: String },
  shippingMethod: { type: String, enum: ["standard","express","pickup"] },
  shippingAddress: AddressSchema,
  billingAddress: mongoose.Schema.Types.Mixed, // "same" или AddressSchema-подобный объект
  notes: String,

  items: [OrderItemSchema],
  amounts: AmountsSchema,
  paymentMethod: { type: String, enum: ["card","pickup"] },

  status: { type: String, enum: ["pending","paid","canceled"], default: "pending", index: true },

  stripe: {
    sessionId: String,
    paymentIntentId: String,
  },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Order", OrderSchema);
