// server/services/inventory.js
const mongoose = require("mongoose");
const Product = require("../models/Product"); // адаптируй путь

async function decStockBySku(sku, qty, session) {
  // 1) вариант: SKU в variants[]
  let r = await Product.updateOne(
    { "variants.sku": sku, "variants.stock": { $gte: qty } },
    { $inc: { "variants.$.stock": -qty } },
    { session }
  );
  if (r.modifiedCount > 0) return true;

  // 2) вариант: SKU на уровне продукта
  r = await Product.updateOne(
    { sku, stock: { $gte: qty } },
    { $inc: { stock: -qty } },
    { session }
  );
  return r.modifiedCount > 0;
}

async function applyInventory(order, { session: extSession } = {}) {
  const run = async (session) => {
    for (const it of order.items || []) {
      const sku = String(it.sku || "").trim();
      const qty = Number(it.qty || 0);
      if (!sku || qty <= 0) continue;
      const ok = await decStockBySku(sku, qty, session);
      if (!ok) throw new Error(`Out of stock for ${sku} (need ${qty})`);
    }
  };

  if (extSession) return run(extSession);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => { await run(session); });
  } finally {
    await session.endSession();
  }
}

module.exports = { applyInventory };
