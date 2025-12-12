// routes/search.js
const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const { embed } = require("../services/embeddings");

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json([]);

  // опц.: фильтр по тегам ?tags=yoga,evening
  const tags = String(req.query.tags || "")
    .split(",").map(s => s.trim()).filter(Boolean);

  // 1) эмбеддинг (может упасть — игнорим)
  let qvec = null;
  try { qvec = await embed(q); } catch {}

  // 2) vector search (Atlas / MongoDB 7+)
  if (qvec) {
    try {
      const pipe = [
        {
          $vectorSearch: {
            index: "v_classes",
            path: "embedding",
            queryVector: qvec,
            numCandidates: 200,
            limit: 10
          }
        },
        { $project: { title:1, description:1, tags:1, score: { $meta: "vectorSearchScore" } } },
      ];
      if (tags.length) pipe.push({ $match: { tags: { $all: tags } } });

      const vecDocs = await Class.aggregate(pipe);
      if (vecDocs.length) return res.json(vecDocs);
    } catch {}
  }

  // 3) text index fallback
  try {
    const query = { $text: { $search: q } };
    if (tags.length) query.tags = { $all: tags };

    const txt = await Class.find(
      query,
      { score: { $meta: "textScore" }, title:1, description:1, tags:1 }
    ).sort({ score: { $meta: "textScore" } }).limit(10).lean();

    if (txt.length) return res.json(txt);
  } catch {}

  // 4) regex fallback (если нет text-индекса)
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const docs = await Class.find(
    {
      $or: [{ title: rx }, { description: rx }, { tags: rx }],
      ...(tags.length ? { tags: { $all: tags } } : {})
    },
    "title description tags"
  ).limit(10).lean();

  res.json(docs);
});

module.exports = router;
