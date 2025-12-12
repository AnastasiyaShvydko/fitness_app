// models/Class.js
const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  slug:        { type: String, unique: true, index: true, trim: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  tags:        { type: [String], default: [] },          // любые строки (в т.ч. с пробелами)
  level:       { type: String, enum: ["beginner","intermediate","advanced","all"], default: "all" },
  durationMin: { type: Number, default: 60 },
  price:       { type: Number, default: 0 },
  image:       { type: String, default: "" },
  embedding:   { type: [Number], default: [] },          // для векторного поиска
  active:      { type: Boolean, default: true },
}, { timestamps: true });

ClassSchema.index({ title: "text", description: "text"});
ClassSchema.index({ tags: 1 }); 
module.exports = mongoose.model("Class", ClassSchema);

