// controllers/profileController.js
// Handles reading and saving the user's job preferences.

const UserProfile = require("../models/UserProfile");

// GET /api/profile
// Returns the current user preference profile.
const getProfile = async (req, res) => {
  const profile = await UserProfile.findById("main");
  if (!profile) {
    // Return empty defaults if no profile saved yet
    return res.json({
      name: "",
      jobTitles: [],
      locations: [],
      workTypes: [],
      keywords: [],
      preferredCompanies: [],
      phoneNumber: "",
    });
  }
  res.json(profile);
};

// POST /api/profile
// Creates or updates the user preference profile.
const saveProfile = async (req, res) => {
  const { name, jobTitles, locations, workTypes, keywords, preferredCompanies, phoneNumber } = req.body;

  // findByIdAndUpdate with upsert:true creates the doc if it doesn't exist
  const profile = await UserProfile.findByIdAndUpdate(
    "main",
    { name, jobTitles, locations, workTypes, keywords, preferredCompanies, phoneNumber },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({ message: "Profile saved successfully.", profile });
};

module.exports = { getProfile, saveProfile };
