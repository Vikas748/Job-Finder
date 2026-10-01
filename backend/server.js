// server.js — Express application entry point
//
// MVC Structure:
//   models/      → Mongoose schemas (M)
//   controllers/ → Business logic per route group (C)
//   routes/      → URL-to-controller mapping (connects C to HTTP)
//   services/    → Shared utilities (matcher, notifier, excel)

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const jobRoutes          = require("./routes/jobRoutes");
const profileRoutes      = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors());                        // Allow requests from the React frontend
app.use(express.json());                // Parse JSON request bodies

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/jobs",          jobRoutes);
app.use("/api/profile",       profileRoutes);
app.use("/api/notifications",  notificationRoutes);

// ── Health check ─────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Job Filter API is running." });
});

// ── Global error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Connect to MongoDB and start server ──────────────────────────────
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobfilter";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
