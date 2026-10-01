// models/UserProfile.js
// Mongoose schema for the user's job preferences.
// We only ever keep ONE profile document (upserted by ID "main").

const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    // Fixed ID so we always upsert the same single document
    _id: {
      type: String,
      default: "main",
    },
    name: {
      type: String,
      default: "",
    },
    // Desired job titles e.g. ["Software Engineer", "Backend Engineer"]
    jobTitles: {
      type: [String],
      default: [],
    },
    // Preferred locations e.g. ["India", "Bangalore", "Remote"]
    locations: {
      type: [String],
      default: [],
    },
    // Accepted work types e.g. ["Remote", "Hybrid"]
    workTypes: {
      type: [String],
      default: [],
    },
    // Skill keywords e.g. ["Python", "API", "Backend"]
    keywords: {
      type: [String],
      default: [],
    },
    // Optional preferred companies e.g. ["Google", "Razorpay"]
    preferredCompanies: {
      type: [String],
      default: [],
    },
    // WhatsApp phone number (E.164 format) e.g. "+919876543210"
    phoneNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    _id: false,   // We manage _id manually above
  }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
