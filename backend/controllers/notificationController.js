// controllers/notificationController.js
// Alerts for everyone, alert history, and Twilio status.

const User            = require("../models/User");
const NotificationLog = require("../models/NotificationLog");
const { alertUser }   = require("../services/alertService");
const { getStatus }   = require("../services/notifier");

// POST /api/notifications/send  → run alerts for every user
const sendAllAlerts = async (req, res) => {
  const results = [];

  for (const user of await User.find()) {
    const userResults = await alertUser(user);
    userResults.forEach((r) => results.push({ ...r, userName: user.name }));
  }

  res.json({ results });
};

// GET /api/notifications/history?userId=...  → alert log (optionally for one user)
const getHistory = async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};

  const logs = await NotificationLog.find(filter)
    .populate("jobId", "title company")
    .populate("userId", "name phoneNumber")
    .sort({ updatedAt: -1 });

  res.json(logs);
};

// DELETE /api/notifications/history?userId=...
// Clears the log so the same jobs can be sent again — handy for repeating a demo.
const clearHistory = async (req, res) => {
  const filter = req.query.userId ? { userId: req.query.userId } : {};
  const { deletedCount } = await NotificationLog.deleteMany(filter);
  res.json({ message: `Cleared ${deletedCount} alert(s).` });
};

// GET /api/notifications/status  → is Twilio connected, and the sandbox join details
const getNotifierStatus = (req, res) => {
  res.json(getStatus());
};

module.exports = { sendAllAlerts, getHistory, clearHistory, getNotifierStatus };
