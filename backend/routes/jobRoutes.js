// routes/jobRoutes.js
// Maps HTTP verbs + URL paths to job controller functions.

const express = require("express");
const router  = express.Router();
const {
  getAllJobs,
  getJobById,
  addJob,
  seedJobs,
  getMatchingJobs,
} = require("../controllers/jobController");

// NOTE: /seed and /matching must come BEFORE /:id
// so Express doesn't treat "seed"/"matching" as a MongoDB ObjectId.

router.get("/matching", getMatchingJobs);   // GET  /api/jobs/matching
router.post("/seed",    seedJobs);          // POST /api/jobs/seed
router.get("/",         getAllJobs);        // GET  /api/jobs
router.post("/",        addJob);            // POST /api/jobs
router.get("/:id",      getJobById);        // GET  /api/jobs/:id

module.exports = router;
