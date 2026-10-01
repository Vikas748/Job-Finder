// controllers/jobController.js
// Handles all job-related HTTP requests.
// Each function maps to one API endpoint (see routes/jobRoutes.js).

const Job          = require("../models/Job");
const sampleJobs   = require("../data/sampleJobs");
const MatcherService = require("../services/matcher");
const UserProfile    = require("../models/UserProfile");

// GET /api/jobs
// Returns all jobs stored in the database.
const getAllJobs = async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
};

// GET /api/jobs/:id
// Returns a single job by its MongoDB ID.
const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
};

// POST /api/jobs
// Adds a new job posting to the database.
const addJob = async (req, res) => {
  const { title, company, location, workType, keywords, postedDate, jobUrl, description } = req.body;

  if (!title || !company || !location || !workType || !postedDate || !jobUrl) {
    return res.status(400).json({ error: "title, company, location, workType, postedDate, and jobUrl are required." });
  }

  const job = await Job.create({ title, company, location, workType, keywords, postedDate, jobUrl, description });
  res.status(201).json(job);
};

// POST /api/jobs/seed
// Loads the built-in sample jobs into the database (skips duplicates by title+company).
const seedJobs = async (req, res) => {
  const inserted = [];

  for (const data of sampleJobs) {
    // Avoid adding the same job twice on repeated seed calls
    const exists = await Job.findOne({ title: data.title, company: data.company });
    if (!exists) {
      const job = await Job.create(data);
      inserted.push(job);
    }
  }

  res.status(201).json({ message: `${inserted.length} sample job(s) added.`, jobs: inserted });
};

// GET /api/jobs/matching
// Returns jobs that match the saved user profile, each with a "matchReason" field.
const getMatchingJobs = async (req, res) => {
  const profile = await UserProfile.findById("main");
  if (!profile) return res.json([]);   // No profile saved yet

  const allJobs = await Job.find();
  const matcher = new MatcherService(profile);
  const matched = matcher.filter(allJobs);

  res.json(matched);
};

module.exports = { getAllJobs, getJobById, addJob, seedJobs, getMatchingJobs };
