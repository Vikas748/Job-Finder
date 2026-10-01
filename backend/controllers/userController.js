// controllers/userController.js
// Add / edit / delete users and run alerts for a single user.

const User            = require("../models/User");
const Job             = require("../models/Job");
const NotificationLog = require("../models/NotificationLog");
const { findMatches } = require("../services/matcher");
const { alertUser }   = require("../services/alertService");
const { sendWhatsApp } = require("../services/notifier");
const { createWorkbook } = require("../services/excelExporter");

// Turns "98765 43210" or "919876543210" into "+919876543210".
// A plain 10-digit number is treated as Indian (+91).
function normalisePhone(raw = "") {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

const isValidPhone = (phone) => /^\+\d{10,15}$/.test(phone);

// Picks only the fields we allow from the request body
function readUserForm(body) {
  return {
    name:               (body.name || "").trim(),
    phoneNumber:        normalisePhone(body.phoneNumber),
    jobTitles:          body.jobTitles || [],
    locations:          body.locations || [],
    workTypes:          body.workTypes || [],
    skills:             body.skills || [],
    preferredCompanies: body.preferredCompanies || [],
    alertsEnabled:      body.alertsEnabled !== false,
  };
}

function validate(form) {
  if (!form.name) return "Add a name for this user.";
  if (!isValidPhone(form.phoneNumber)) return "Enter the WhatsApp number with country code, e.g. +919876543210.";
  return null;
}

// GET /api/users  → every user, with how many jobs currently match them
const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const jobs  = await Job.find();

  const withCounts = users.map((user) => ({
    ...user.toObject(),
    matchCount: findMatches(user, jobs).length,
  }));

  res.json(withCounts);
};

// POST /api/users  → create a user. Send { sendNow: true } to alert them right away.
const createUser = async (req, res) => {
  const form = readUserForm(req.body);
  const error = validate(form);
  if (error) return res.status(400).json({ error });

  const user = await User.create(form);
  const alerts = req.body.sendNow ? await alertUser(user) : [];

  res.status(201).json({ user, alerts });
};

// PUT /api/users/:id  → update preferences
const updateUser = async (req, res) => {
  const form = readUserForm(req.body);
  const error = validate(form);
  if (error) return res.status(400).json({ error });

  const user = await User.findByIdAndUpdate(req.params.id, form, { new: true });
  if (!user) return res.status(404).json({ error: "User not found." });

  res.json({ user });
};

// DELETE /api/users/:id  → remove user and their alert history
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await NotificationLog.deleteMany({ userId: req.params.id });
  res.json({ message: "User deleted." });
};

// GET /api/users/:id/matches  → matching jobs, best first, with "alreadyNotified" flag
const getUserMatches = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const matches = findMatches(user, await Job.find());
  const sentLogs = await NotificationLog.find({ userId: user._id, status: "sent" });
  const sentIds = new Set(sentLogs.map((log) => String(log.jobId)));

  res.json(matches.map((job) => ({ ...job, alreadyNotified: sentIds.has(String(job._id)) })));
};

// POST /api/users/:id/test  → a short "hello" message to check the number works
const sendTestMessage = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const result = await sendWhatsApp(
    user.phoneNumber,
    `👋 Hi ${user.name}! Job alerts are connected. You'll get a message here whenever a new job matches your preferences.`
  );
  res.json(result);
};

// POST /api/users/:id/alerts  → send WhatsApp alerts for this user's new matches
const sendUserAlerts = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  res.json({ results: await alertUser(user) });
};

// GET /api/users/:id/export  → download this user's matches as Excel
const exportUserMatches = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  const matches = findMatches(user, await Job.find());
  const workbook = createWorkbook(user, matches);

  const fileName = `matching_jobs_${user.name.replace(/\s+/g, "_")}.xlsx`;
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserMatches,
  sendTestMessage,
  sendUserAlerts,
  exportUserMatches,
};
