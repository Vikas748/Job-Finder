// services/alertService.js
// The alert pipeline, shared by several controllers:
//
//   1. Find jobs that match the user
//   2. Skip jobs this user was already notified about (duplicate guard)
//   3. Send one WhatsApp message per new match
//   4. Log the result so it is never sent twice

const Job             = require("../models/Job");
const NotificationLog = require("../models/NotificationLog");
const { findMatches } = require("./matcher");
const { buildJobMessage, buildJobVariables, sendWhatsApp } = require("./notifier");

// Sends alerts to one user for the given jobs (defaults to every job in the DB).
// Returns a list like [{ title, company, status: "sent" | "skipped" | "failed", ... }]
async function alertUser(user, jobs = null) {
  if (!user.alertsEnabled) return [];

  const allJobs = jobs || (await Job.find());
  const matches = findMatches(user, allJobs);
  const results = [];

  for (const job of matches) {
    // ── Duplicate guard ─────────────────────────────────────────────
    const previous = await NotificationLog.findOne({ userId: user._id, jobId: job._id });
    if (previous && previous.status === "sent") {
      results.push({ jobId: job._id, title: job.title, company: job.company, status: "skipped" });
      continue;
    }

    // ── Send ────────────────────────────────────────────────────────
    const { success, channel, errorMessage } = await sendWhatsApp(
      user.phoneNumber,
      buildJobMessage(job),
      buildJobVariables(job)
    );

    // ── Log (update the old "failed" row if there was one) ──────────
    await NotificationLog.findOneAndUpdate(
      { userId: user._id, jobId: job._id },
      { status: success ? "sent" : "failed", channel, errorMessage },
      { upsert: true }
    );

    results.push({
      jobId: job._id,
      title: job.title,
      company: job.company,
      status: success ? "sent" : "failed",
      channel,
      errorMessage,
    });
  }

  return results;
}

module.exports = { alertUser };
