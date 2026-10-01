// models/User.js
// One document per person who wants job alerts.
// Each user has their own preferences and their own WhatsApp number,
// so you can add yourself (or a friend) and test alerts instantly.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // WhatsApp number in E.164 format, e.g. "+919876543210"
    phoneNumber: { type: String, required: true, trim: true },

    // Job preferences
    jobTitles:          { type: [String], default: [] }, // e.g. ["Backend Engineer"]
    locations:          { type: [String], default: [] }, // e.g. ["Bangalore", "Remote"]
    workTypes:          { type: [String], default: [] }, // e.g. ["Remote", "Hybrid"]
    skills:             { type: [String], default: [] }, // e.g. ["Node.js", "MongoDB"]
    preferredCompanies: { type: [String], default: [] }, // optional

    // Turn alerts off without deleting the user
    alertsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
