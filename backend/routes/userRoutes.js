// routes/userRoutes.js
const express = require("express");
const router  = express.Router();
const c = require("../controllers/userController");

router.get("/",            c.getUsers);          // GET    /api/users
router.post("/",           c.createUser);        // POST   /api/users
router.put("/:id",         c.updateUser);        // PUT    /api/users/:id
router.delete("/:id",      c.deleteUser);        // DELETE /api/users/:id
router.get("/:id/matches", c.getUserMatches);    // GET    /api/users/:id/matches
router.post("/:id/test",   c.sendTestMessage);   // POST   /api/users/:id/test
router.post("/:id/alerts", c.sendUserAlerts);    // POST   /api/users/:id/alerts
router.get("/:id/export",  c.exportUserMatches); // GET    /api/users/:id/export

module.exports = router;
