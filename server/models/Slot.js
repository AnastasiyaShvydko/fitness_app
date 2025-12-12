const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ["trial", "personal", "group", "rehab", "other"],
    default: "trial",
    required: true
  },
  date: {
    type: String, // easier to query, e.g. "2025-10-21"
    required: true,
  },
  time: {
    type: String, // "09:00"
    required: true,
  },
  capacity: {
    type: Number,
    default: 1,
    min: 1
  },
  bookedCount: {
    type: Number,
    default: 0,
  },
  available: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Virtual field — slot is full if bookedCount >= capacity
slotSchema.virtual("isFull").get(function() {
  return this.bookedCount >= this.capacity;
});

// Auto-toggle availability before saving
slotSchema.pre("save", function(next) {
  this.available = this.bookedCount < this.capacity;
  next();
});

module.exports = mongoose.model("Slot", slotSchema);
