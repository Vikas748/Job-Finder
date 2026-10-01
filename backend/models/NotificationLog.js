// models/NotificationLog.js
// One row per (user, job) alert. This is our duplicate guard:
// if a "sent" row already exists for a user + job, we never send it again.

const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId:  { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },

    status:       { type: String, enum: ["sent", "failed"], default: "sent" },
    channel:      { type: String, default: "whatsapp" }, // "whatsapp" or "console" (demo mode)
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true } // createdAt = when the alert was attempted
);

// The database itself refuses a second log row for the same user + job.
notificationLogSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
