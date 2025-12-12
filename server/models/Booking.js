const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
    required: true,
  },
   time: {  // <-- new field for selected time
    type: String, 
    required: true
  },
  date: {  // <-- new field for selected date
    type: String, 
    required: true
  },
  customer: {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true },
    phone:     { type: String },
  },
  notes: String,
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  source: { type: String, default: "trial" },
  createdAt: { type: Date, default: Date.now },
});

// Update slot bookedCount automatically when booking is saved or removed
bookingSchema.post("save", async function (doc) {
  const Slot = mongoose.model("Slot");
  await Slot.findByIdAndUpdate(doc.slot, { $inc: { bookedCount: 1 } });
});

bookingSchema.post("remove", async function (doc) {
  const Slot = mongoose.model("Slot");
  await Slot.findByIdAndUpdate(doc.slot, { $inc: { bookedCount: -1 } });
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

