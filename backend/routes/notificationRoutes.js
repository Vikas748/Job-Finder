// routes/notificationRoutes.js
// Maps HTTP verbs + URL paths to notification controller functions.

const express = require("express");
const router  = express.Router();
const {
  sendNotifications,
  getHistory,
  exportExcel,
} = require("../controllers/notificationController");

router.post("/send",    sendNotifications);  // POST /api/notifications/send
router.get("/history",  getHistory);         // GET  /api/notifications/history
router.get("/export",   exportExcel);        // GET  /api/notifications/export

module.exports = router;
