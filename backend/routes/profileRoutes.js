// routes/profileRoutes.js
// Maps HTTP verbs + URL paths to profile controller functions.

const express = require("express");
const router  = express.Router();
const { getProfile, saveProfile } = require("../controllers/profileController");

router.get("/",  getProfile);    // GET  /api/profile
router.post("/", saveProfile);   // POST /api/profile

module.exports = router;
