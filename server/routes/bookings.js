const express = require("express");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const router = express.Router();
const {sendBookingEmail} = require("../utils/bookingemail");

// GET /api/bookings (admin)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slot")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load bookings" });
  }
});

// POST /api/bookings (from booking page)
router.post("/", async (req, res) => {
  try {
    const { slotId,date,time, customer, notes, source } = req.body;
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.bookedCount >= slot.capacity)
      return res.status(400).json({ message: "Slot is full" });

    const booking = new Booking({
      slot: slot._id,
      date,
      time,
      customer,
      notes,
      source,
    });
    await booking.save();

    try {
      await sendBookingEmail({
        to: customer.email,
        subject: "Your Trial Class Booking Confirmation",
        booking,
      });
    } catch (e) {
      console.error("Failed to send email:", e.message);
    }
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await booking.remove();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
