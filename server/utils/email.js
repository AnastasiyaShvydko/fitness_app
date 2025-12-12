// server/utils/email.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.VITE_SMTP_HOST,
  port: Number(process.env.VITE_SMTP_PORT || 587),
  secure: Number(process.env.VITE_SMTP_PORT) === 465,
  auth: { user: process.env.VITE_SMTP_USER, pass: process.env.VITE_SMTP_PASS },
});

const money = (n, cur) => `${cur} ${Number(n ?? 0).toFixed(2)}`;

function orderHtml(order = {}) {
  const cur = order?.amounts?.currency || "CAD";
  const items = (order?.items || [])
    .map(i => `<li>${Number(i?.qty||0)} × ${i?.title || "Item"} — ${money(i?.unitPrice, cur)}</li>`)
    .join("");
  return `
    <div style="font-family:system-ui,Arial,sans-serif">
      <h2>Thanks for your order${order?.customer?.name ? `, ${order.customer.name}` : ""}!</h2>
      <p>Order ID: <b>${order?._id || "-"}</b></p>
      <ul>${items || "<li>(no items)</li>"}</ul>
      <p>Subtotal: ${money(order?.amounts?.subtotal, cur)}<br/>
         Shipping: ${money(order?.amounts?.shipping, cur)}<br/>
         Discount: ${money(order?.amounts?.discount, cur)}<br/>
         <b>Total: ${money(order?.amounts?.total, cur)}</b></p>
      <p>Status: <b>${order?.status || "-"}</b></p>
    </div>
  `;
}

function orderText(order = {}) {
  const cur = order?.amounts?.currency || "CAD";
  const lines = (order?.items || [])
    .map(i => `- ${i?.qty || 0} x ${i?.title || "Item"} — ${money(i?.unitPrice, cur)}`)
    .join("\n");
  return [
    `Thanks for your order${order?.customer?.name ? `, ${order.customer.name}` : ""}!`,
    `Order ID: ${order?._id || "-"}`,
    lines ? `Items:\n${lines}` : "Items: (none)",
    `Subtotal: ${money(order?.amounts?.subtotal, cur)}`,
    `Shipping: ${money(order?.amounts?.shipping, cur)}`,
    `Discount: ${money(order?.amounts?.discount, cur)}`,
    `Total: ${money(order?.amounts?.total, cur)}`,
    `Status: ${order?.status || "-"}`,
  ].join("\n");
}

async function sendOrderEmail({ to, subject = "Order confirmation", order }) {
  if (!to) throw new Error("Recipient email is required");
  const html = orderHtml(order);
  const text = orderText(order);

  console.log("[email] to:", to, "subject:", subject, "html_len:", html.length);
  const info = await transporter.sendMail({
    from: process.env.VITE_FROM_EMAIL, // e.g. "Your Name <your@gmail.com>"
    to,
    subject,
    text,     // plaintext fallback → avoids “empty” emails
    html,     // HTML version
  });
  console.log("[email] sent:", info.messageId);
  return info;
}

module.exports = { sendOrderEmail };
