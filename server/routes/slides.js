// routes/slides.js
const express = require("express");
const Slide = require("../models/Slide");
const router = express.Router();

// GET /api/slides?all=1 – все (для админки) | по умолчанию только опубликованные
router.get("/", async (req, res) => {
  try {
    if (req.query.all) {
      const rows = await Slide.find().sort({ order: 1, createdAt: -1 });
      return res.json(rows);
    }
    const rows = await Slide.findPublished();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/slides – создать
router.post("/", async (req, res) => {
  try {
    const doc = await Slide.create({
      image: req.body.image,
      title: req.body.title,
      subtitle: req.body.subtitle,
      badge: req.body.badge,
      cta: Array.isArray(req.body.cta) ? req.body.cta : [],
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive ?? true,
      startAt: req.body.startAt || null,
      endAt: req.body.endAt || null,
      tags: req.body.tags || [],
      createdBy: req.user?.id || req.body.createdBy,
      updatedBy: req.user?.id || req.body.updatedBy,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PUT /api/slides/:id – обновить
router.put("/:id", async (req, res) => {
  try {
    const doc = await Slide.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id || req.body.updatedBy },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PATCH /api/slides/:id/order – изменить порядок
router.patch("/:id/order", async (req, res) => {
  try {
    const doc = await Slide.findByIdAndUpdate(
      req.params.id,
      { order: Number(req.body.order) || 0 },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).end();
    res.json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE /api/slides/:id
router.delete("/:id", async (req, res) => {
  try {
    const r = await Slide.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).end();
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
