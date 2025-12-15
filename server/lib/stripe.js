// server/lib/stripe.js  (рекомендуемый singleton)
require("dotenv").config();
const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
module.exports = stripe; 