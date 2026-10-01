// controllers/jobController.js
// Job postings: list, add, seed sample data, and the skills summary.

const Job        = require("../models/Job");
const User       = require("../models/User");
const sampleJobs = require("../data/sampleJobs");
const { alertUser } = require("../services/alertService");

// GET /api/jobs  → all jobs, newest first
const getAllJobs = async (req, res) => {
  const jobs = await Job.find().sort({ postedDate: -1, createdAt: -1 });
  res.json(jobs);
};

// POST /api/jobs  → add a job, then immediately alert every user it matches.
// This is the "new job appears → user gets WhatsApp" flow.
const addJob = async (req, res) => {
  const { title, company, location, workType, keywords, postedDate, jobUrl, description } = req.body;

  if (!title || !company || !location || !workType || !postedDate || !jobUrl) {
    return res.status(400).json({ error: "Title, company, location, work type, posted date and job URL are required." });
  }

  const job = await Job.create({ title, company, location, workType, keywords, postedDate, jobUrl, description });

  // Check this one new job against every user
  const alerts = [];
  for (const user of await User.find()) {
    const results = await alertUser(user, [job]);
    results.forEach((r) => alerts.push({ ...r, userName: user.name }));
  }

  res.status(201).json({ job, alerts });
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Job deleted." });
};

// POST /api/jobs/seed  → load sample jobs (skips ones already present)
const seedJobs = async (req, res) => {
  let added = 0;

  for (const data of sampleJobs) {
    const exists = await Job.findOne({ title: data.title, company: data.company });
    if (!exists) {
      await Job.create(data);
      added++;
    }
  }

  res.status(201).json({ message: `${added} sample job(s) added.` });
};

// GET /api/jobs/skills  → what companies are asking for, so the
// "Add user" form can show clickable suggestions.
// Response: { skills: [{ name, count }], titles: [...], locations: [...], companies: [...] }
const getSkillSummary = async (req, res) => {
  const jobs = await Job.find();
  const skillCount = {};

  for (const job of jobs) {
    for (const skill of job.keywords) {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    }
  }

  const skills = Object.entries(skillCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const unique = (list) => [...new Set(list)].sort();

  res.json({
    skills,
    titles:    unique(jobs.map((j) => j.title)),
    locations: unique(jobs.flatMap((j) => j.location.split(",").map((part) => part.trim()))),
    companies: unique(jobs.map((j) => j.company)),
  });
};

module.exports = { getAllJobs, addJob, deleteJob, seedJobs, getSkillSummary };
