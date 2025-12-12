// models/Slide.js
const mongoose = require("mongoose");

const CtaSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 64 },
  href:  { type: String, required: true, trim: true, maxlength: 512 },
  variant: { type: String, enum: ["light","outline","dark","primary"], default: "light" }
}, { _id: false });

const SlideSchema = new mongoose.Schema({
  image:    { type: String, required: true, trim: true },            // URL
  title:    { type: String, trim: true, maxlength: 120 },
  subtitle: { type: String, trim: true, maxlength: 500 },
  badge:    { type: String, trim: true, maxlength: 32 },
  cta:      { type: [CtaSchema], default: [] },

  order:    { type: Number, default: 0, index: true },               // сортировка
  isActive: { type: Boolean, default: true, index: true },           // выключить/включить
  startAt:  { type: Date, default: null, index: true },              // расписание (начало)
  endAt:    { type: Date, default: null, index: true },              // расписание (конец)

  tags:     { type: [String], default: [] },
  createdBy:{ type: String },                                        // id/почта админа
  updatedBy:{ type: String },
}, { timestamps: true, versionKey: false });

// валидация диапазона дат
SlideSchema.pre("save", function(next){
  if (this.endAt && this.startAt && this.endAt < this.startAt) {
    return next(new Error("endAt must be >= startAt"));
  }
  next();
});

// опубликованные (жилье) слайды на текущий момент
SlideSchema.statics.findPublished = function(now = new Date()){
  return this.find({
    isActive: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null },   { endAt: { $gte: now } }] },
    ]
  }).sort({ order: 1, createdAt: -1 });
};

SlideSchema.index({ isActive: 1, startAt: 1, endAt: 1, order: 1 });

module.exports = mongoose.model("Slide", SlideSchema);
