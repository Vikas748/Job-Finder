// models/NotificationLog.js
// Tracks every WhatsApp alert that was sent, so we never notify twice.

const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    // Reference to the job that triggered this notification
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    // "sent" or "failed"
    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "sent",
    },
    // "whatsapp" or "console" (console = Twilio not configured, demo mode)
    channel: {
      type: String,
      default: "whatsapp",
    },
    // Optional error message if the notification failed
    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,   // createdAt = when the notification was sent
  }
);

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
