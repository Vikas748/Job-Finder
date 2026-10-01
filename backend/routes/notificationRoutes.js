// routes/notificationRoutes.js
const express = require("express");
const router  = express.Router();
const { sendAllAlerts, getHistory, clearHistory, getNotifierStatus } = require("../controllers/notificationController");

router.post("/send",      sendAllAlerts);     // POST   /api/notifications/send
router.get("/history",    getHistory);        // GET    /api/notifications/history
router.delete("/history", clearHistory);      // DELETE /api/notifications/history
router.get("/status",     getNotifierStatus); // GET    /api/notifications/status

module.exports = router;
