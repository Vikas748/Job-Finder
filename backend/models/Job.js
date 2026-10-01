// models/Job.js
// Mongoose schema for a single job posting.

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workType: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      required: true,
    },
    // Array of skill keywords e.g. ["Python", "Django", "REST"]
    keywords: {
      type: [String],
      default: [],
    },
    postedDate: {
      type: String,   // stored as "YYYY-MM-DD" string for simplicity
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,   // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Job", jobSchema);
