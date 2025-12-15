// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require("express-session");
const passport = require('passport');
const slidesRouter = require("./routes/slides");

const { router: checkoutRouter, webhookHandler } = require("./routes/checkout");
require('dotenv').config();

require('./config/auth'); // load Google OAuth config

const app = express();

const searchRouter = require("./routes/search");

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // https://fitness-app-ten-theta.vercel.app
].filter(Boolean);

app.set("trust proxy", 1);

// ❶ ВЕБХУК ДОЛЖЕН БЫТЬ ЗАРЕГАН ДО json(), И РОВНО ПО ЭТОМУ ПУТИ
app.post("/api/checkout/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
}));


app.use(express.json());
app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // true only on HTTPS
    httpOnly: true,
    sameSite: "lax",      // "none" + secure:true if on different domains over HTTPS
    maxAge: 24*60*60*1000,
    path: "/",
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/checkout", checkoutRouter);
app.use((req,res,next)=>{ console.log("Origin:", req.headers.origin); next(); });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

  mongoose.connection.once("open", async () => {
  const Product = (await import("./models/Product.js")).default;
  await Product.syncIndexes();                      // ← важный шаг
  console.log("Indexes synced:", await Product.listIndexes());
});
// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/form', require('./routes/form')); // We'll create these next
app.use('/api/store', require('./routes/store')); 
app.use("/api/upload", require("./routes/upload"));
app.use("/api/slides", slidesRouter);
app.use("/api/search", searchRouter);
app.use("/api/slots", require("./routes/slots"));
app.use("/api/bookings", require("./routes/bookings"));

// // Start the server
app.listen(5000, () => {
  console.log('🚀 Server is running at http://localhost:5000');
});
