const express = require("express");
const router = express.Router();

const { checkout, webhooks } = require("../lib/stripe");
const { applyInventory } = require("../services/inventory");

const { create, findById, findByIdAndUpdate } = require("../models/Order");
const { sendOrderEmail } = require("../utils/email");

const { startSession } = require("mongoose");


// util: маппинг в Stripe line_items
function toStripeLineItems(items = [], currency = "CAD") {
  const cur = String(currency || "CAD").toLowerCase();
  return items.map(i => ({
    quantity: Number(i.qty || 1),
    price_data: {
      currency: cur,
      unit_amount: Math.round(Number(i.unitPrice || 0) * 100), // в центах
      product_data: { name: i.title || "Item", metadata: { sku: i.sku || "" } },
    },
  }));
}

function abs(base, path) { return new URL(path, base).toString(); }

router.post("/create-session", async (req, res) => {
  try {
    const payload = req.body;
    // 1) создаём pending-заказ (по желанию)
    const order = await create({ ...payload, status: "pending" });

    // 2) формируем line_items
    const line_items = toStripeLineItems(payload.items, payload.amounts?.currency);

    // 3) абсолютные URL
    const BASE = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;
    const success_url = abs(BASE, `/thank-you?order=${order._id}`);
    const cancel_url  = abs(BASE, "/cart?cancel=1");

    // 4) создаём сессию Stripe
    const session = await checkout.sessions.create({
      mode: "payment",
      customer_email: payload.customer?.email,
      line_items,                    // ✅ теперь переменная определена
      success_url,
      cancel_url,
      metadata: { orderId: String(order._id) },
    });

    order.stripe = { sessionId: session.id };
    await order.save();

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});


// POST /api/checkout/place-order  (оплата при самовывозе / без Stripe)
// создаёт заказ и сразу отправляет письмо
router.post("/place-order", async (req, res) => {
  const payload = req.body;
  const session = await startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      order = await create([{ ...payload, status: "pending" }], { session });
      order = order[0];
      await applyInventory(order, { session }); // резервируем/списываем сразу
    });
    try { await sendOrderEmail({ to: order.customer?.email, subject: "Order received", order }); } catch {}
    res.status(201).json(order);
  } catch (e) {
    res.status(409).json({ message: e.message || "Inventory conflict" }); // 409 при нехватке
  } finally {
    await session.endSession();
  }
});

// Вебхук Stripe — ОБЯЗАТЕЛЬНО raw-body
async function webhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = webhooks.constructEvent(
      req.body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const order = await findById(orderId);
      // if (orderId) {
      //   const order = await Order.findById(orderId);
      //   if (order && order.status !== "paid") {
      //     order.status = "paid";
      //     order.stripe.paymentIntentId = session.payment_intent;
      //     await order.save();

      //     await sendOrderEmail({
      //       to: order.customer?.email,
      //       subject: "Payment confirmed",
      //       order,
      //     });
      //   }
      // }
      if (order && order.status !== "paid") {
      const dbSession = await startSession();
      try {
        await dbSession.withTransaction(async () => {
          await applyInventory(order, { session: dbSession }); // списать склад
          order.status = "paid";
          order.stripe.paymentIntentId = session.payment_intent;
          await order.save({ session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }

      // e-mail в try/catch, чтобы webhook не падал
      try { await sendOrderEmail({ to: order.customer?.email, subject: "Payment confirmed", order }); }
      catch (e) { console.error("[email] send failed:", e.message); }
    }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) await findByIdAndUpdate(orderId, { status: "canceled" });
    }
    res.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    res.status(500).end();
  }
}

module.exports = { router, webhookHandler };
