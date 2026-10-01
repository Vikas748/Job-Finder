// server.js — Express application entry point
//
// Folder structure (MVC):
//   models/      → Mongoose schemas (Job, User, NotificationLog)
//   controllers/ → Request handlers
//   routes/      → URL → controller mapping
//   services/    → Matching, WhatsApp sending, Excel export

require("dotenv").config(); // load .env first so services can read it

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const jobRoutes          = require("./routes/jobRoutes");
const userRoutes         = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { getStatus }      = require("./services/notifier");

const app = express();

app.use(cors());         // allow the React app to call the API
app.use(express.json()); // parse JSON bodies

app.use("/api/jobs",          jobRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Express 5 forwards errors from async controllers here automatically
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid ID." });
  res.status(500).json({ error: err.message || "Something went wrong on the server." });
});

const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jobfilter";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    const { twilioEnabled } = getStatus();
    console.log(twilioEnabled ? "📱  Twilio WhatsApp: ON" : "🖥️   Twilio not configured — demo mode (messages print here)");
    app.listen(PORT, () => console.log(`🚀  API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
