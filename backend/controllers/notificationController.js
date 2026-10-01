// controllers/notificationController.js
// Handles sending WhatsApp alerts, viewing history, and exporting to Excel.

const Job             = require("../models/Job");
const UserProfile     = require("../models/UserProfile");
const NotificationLog = require("../models/NotificationLog");
const MatcherService  = require("../services/matcher");
const NotifierService = require("../services/notifier");
const ExcelExporter   = require("../services/excelExporter");

// POST /api/notifications/send
// Full pipeline:
//   1. Load profile and all jobs
//   2. Find matching jobs
//   3. Skip any job already notified (duplicate guard)
//   4. Send WhatsApp message for new matches
//   5. Log each notification result
const sendNotifications = async (req, res) => {
  const profile = await UserProfile.findById("main");
  if (!profile) {
    return res.status(400).json({ error: "No user profile found. Save your preferences first." });
  }

  const allJobs = await Job.find();
  const matcher = new MatcherService(profile);
  const matched = matcher.filter(allJobs);

  const notifier = new NotifierService();
  const results  = [];

  for (const job of matched) {
    // ── Duplicate guard: skip if already notified ────────────────────
    const alreadyNotified = await NotificationLog.findOne({ jobId: job._id });
    if (alreadyNotified) {
      results.push({ jobId: job._id, title: job.title, company: job.company, status: "skipped (already notified)" });
      continue;
    }

    // ── Send notification ────────────────────────────────────────────
    const { success, channel, errorMessage } = await notifier.send(profile.phoneNumber, job);

    // ── Log the attempt ──────────────────────────────────────────────
    await NotificationLog.create({
      jobId:        job._id,
      status:       success ? "sent" : "failed",
      channel,
      errorMessage: errorMessage || "",
    });

    results.push({
      jobId:   job._id,
      title:   job.title,
      company: job.company,
      status:  success ? "sent" : `failed: ${errorMessage}`,
      channel,
    });
  }

  res.json({ results });
};

// GET /api/notifications/history
// Returns all past notification log entries.
const getHistory = async (req, res) => {
  const logs = await NotificationLog.find()
    .populate("jobId", "title company")   // include job title and company in response
    .sort({ createdAt: -1 });
  res.json(logs);
};

// GET /api/notifications/export
// Generates an Excel file of matching jobs and streams it as a download.
const exportExcel = async (req, res) => {
  const profile = await UserProfile.findById("main");
  const allJobs = await Job.find();

  const matcher = new MatcherService(profile || {});
  const matched = profile ? matcher.filter(allJobs) : allJobs.map(j => j.toObject());

  const exporter  = new ExcelExporter();
  const filePath  = await exporter.export(matched);

  res.download(filePath, "matching_jobs.xlsx");
};

module.exports = { sendNotifications, getHistory, exportExcel };
