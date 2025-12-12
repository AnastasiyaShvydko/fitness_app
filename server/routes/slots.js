
const Slot = require("../models/Slot");

const express = require("express");
const router = express.Router();


// GET /api/slots/available?date=YYYY-MM-DD
router.get("/available", async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) return res.status(400).json({ message: "Date required" });
   console.log("date", date);
    const slots = await Slot.find({date});
    console.log("slots.count", slots.length);
    const available = slots.filter(s => s.bookedCount < s.capacity);
    res.json(available);
  } catch (err) {
    console.error("Error fetching available slots:", err);
    res.status(500).json({ message: "Failed to load slots" });
  }
});

// GET /api/slots (admin)
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Failed to load slots" });
  }
});

// POST /api/slots (admin)
router.post("/", async (req, res) => {
  try {
    const slot = new Slot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/slots/:id (admin)
router.patch("/:id", async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
