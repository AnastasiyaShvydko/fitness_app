const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.VITE_SMTP_HOST,
  port: Number(process.env.VITE_SMTP_PORT || 587),
  secure: Number(process.env.VITE_SMTP_PORT) === 465,
  auth: { user: process.env.VITE_SMTP_USER, pass: process.env.SMTP_PASS },
  logger: true,  // optional: logs SMTP conversation
  debug: true,
});

async function sendBookingEmail({ to, subject, booking }) {
console.log("Preparing to send booking email to:", booking);
  const html = `
    <h2>Trial Class Confirmation</h2>
    <p>Hi ${booking.customer.firstName},</p>
    <p>Your trial class has been booked successfully.</p>
    <ul>
      <li><strong>Date:</strong> ${booking.date}</li>
      <li><strong>Time:</strong> ${booking.time}</li>
      <li><strong>Notes:</strong> ${booking.notes || "None"}</li>
    </ul>
    <p>Thank you for booking with us!</p>
  `;

  await transporter.sendMail({
    from: `"Your Fitness Studio" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendBookingEmail };
