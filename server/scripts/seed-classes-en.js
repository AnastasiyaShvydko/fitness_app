// scripts/seed-classes-en.js
require("dotenv").config();
const mongoose = require("mongoose");
const Class = require("../models/Class");
const { embed } = require("../services/embeddings");

const DATA = [
  { title: "Yoga for Back Health", description: "Gentle stretches and core activation to relieve lower-back tension.", tags: ["yoga","back","beginner"] },
  { title: "HIIT 30", description: "High-intensity intervals in 30 minutes. Sweat, power, repeat.", tags: ["cardio","hiit","express"] },
  { title: "Beginner Strength", description: "Foundations of barbell and dumbbell lifts with perfect form.", tags: ["strength","beginner","technique"] },
  { title: "Evening Stretch", description: "Slow mobility flow to unwind and improve flexibility before sleep.", tags: ["stretch","mobility","evening"] },
  { title: "Pilates Core", description: "Mat Pilates focused on posture and deep core stability.", tags: ["pilates","core","posture"] },
  { title: "Spin Express", description: "Fast-paced cycling sprints and climbs to energize your day.", tags: ["spin","cardio","endurance"] },
  { title: "CrossFit Fundamentals", description: "Intro to WODs, scaling options, and safe technique.", tags: ["crossfit","wod","intro"] },
  { title: "Boxing Basics", description: "Stance, jab, cross, and footwork with light bag drills.", tags: ["boxing","technique","conditioning"] },
  { title: "Mobility Flow", description: "Full-body joint prep, PNF stretches, and breath-led movement.", tags: ["mobility","recovery","all levels"] },
  { title: "Power Yoga", description: "Athletic vinyasa to build strength, balance, and heat.", tags: ["yoga","vinyasa","power"] },
  { title: "Zumba Dance", description: "Latin rhythms and fun cardio choreography for everyone.", tags: ["dance","zumba","fun"] },
  { title: "Barre Sculpt", description: "Isometric holds and pulses for legs, glutes, and arms.", tags: ["barre","sculpt","low impact"] },
  { title: "Prenatal Yoga", description: "Safe sequences to reduce discomfort and prepare for birth.", tags: ["prenatal","yoga","low impact"] },
  { title: "Seniors Low-Impact", description: "Balance, light strength, and mobility for active aging.", tags: ["seniors","balance","low impact"] },
  { title: "Meditation & Breathwork", description: "Guided mindfulness, diaphragmatic breathing, and calm.", tags: ["meditation","breathwork","mindfulness"] },
];

// helpers
const slugify = s => String(s).toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const inferDuration = title => {
  const m = String(title).match(/\b(\d{2,3})\b/);
  const n = m ? Number(m[1]) : 60;
  return Math.min(Math.max(n, 20), 180); // clamp 20..180
};

const inferLevel = tags => {
  const t = (tags || []).map(x => String(x).toLowerCase());
  if (t.includes("beginner")) return "beginner";
  if (t.includes("advanced")) return "advanced";
  return "all";
};

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");
  console.log("[seed] connecting:", uri);
  await mongoose.connect(uri);

  const reset = process.argv.includes("--reset");
  if (reset) {
    const r = await Class.deleteMany({});
    console.log("[seed] cleared:", r.deletedCount);
  }

  for (const c of DATA) {
    const slug = slugify(c.title);
    const durationMin = inferDuration(c.title);
    const level = inferLevel(c.tags);
    const v = await embed(`${c.title}. ${c.description}. ${(c.tags||[]).join(", ")}`);

    await Class.updateOne(
      { slug },
      { $set: {
          slug,
          title: c.title,
          description: c.description || "",
          tags: c.tags || [],
          level,
          durationMin,
          price: 0,
          embedding: v,
          active: true,
        } },
      { upsert: true }
    );
    console.log("[seed] upserted:", c.title);
  }

  await mongoose.disconnect();
  console.log("[seed] done:", DATA.length);
})();
