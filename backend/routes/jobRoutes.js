// routes/jobRoutes.js
const express = require("express");
const router  = express.Router();
const { getAllJobs, addJob, deleteJob, seedJobs, getSkillSummary } = require("../controllers/jobController");

router.get("/skills",  getSkillSummary); // GET    /api/jobs/skills
router.post("/seed",   seedJobs);        // POST   /api/jobs/seed
router.get("/",        getAllJobs);      // GET    /api/jobs
router.post("/",       addJob);          // POST   /api/jobs  (also sends alerts)
router.delete("/:id",  deleteJob);       // DELETE /api/jobs/:id

module.exports = router;
