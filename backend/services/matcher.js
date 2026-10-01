// services/matcher.js
// Decides whether a job is a good fit for a user, and explains why.
//
// The rules are intentionally simple (plain string checks, no AI):
//
//   Step 1 — Must-pass filters (only applied if the user filled them in)
//     • Work type : job.workType must be one of the user's work types
//     • Location  : job.location must contain one of the user's locations
//                   ("Remote" in the user's list also accepts any Remote job)
//
//   Step 2 — Relevance (at least one must be true)
//     • Title match : job title contains one of the user's desired titles
//     • Skill match : the job asks for at least one of the user's skills
//
//   Step 3 — Bonus
//     • Preferred company : adds to the score, never required
//
// Each matching job gets: matchScore (0–100), matchReason (text),
// matchedSkills and missingSkills (skills the company wants that the user hasn't listed).

const lower = (list) => (list || []).map((item) => item.toLowerCase().trim());

function matchJob(user, job) {
  const userTitles    = lower(user.jobTitles);
  const userLocations = lower(user.locations);
  const userWorkTypes = lower(user.workTypes);
  const userSkills    = lower(user.skills);
  const userCompanies = lower(user.preferredCompanies);

  const title       = (job.title || "").toLowerCase();
  const location    = (job.location || "").toLowerCase();
  const workType    = (job.workType || "").toLowerCase();
  const company     = (job.company || "").toLowerCase();
  const description = (job.description || "").toLowerCase();
  const jobSkills   = job.keywords || [];

  // ── Step 1: must-pass filters ─────────────────────────────────────
  if (userWorkTypes.length > 0 && !userWorkTypes.includes(workType)) {
    return null;
  }

  if (userLocations.length > 0) {
    const locationOk = userLocations.some(
      (loc) => location.includes(loc) || (loc === "remote" && workType === "remote")
    );
    if (!locationOk) return null;
  }

  // ── Step 2: relevance ─────────────────────────────────────────────
  const matchedTitles = (user.jobTitles || []).filter((t) => title.includes(t.toLowerCase().trim()));

  // A skill counts if it's in the job's skill list, title or description
  const matchedSkills = jobSkills.filter((skill) => userSkills.includes(skill.toLowerCase()));
  const extraSkills = (user.skills || []).filter(
    (skill) =>
      !matchedSkills.some((m) => m.toLowerCase() === skill.toLowerCase()) &&
      (title.includes(skill.toLowerCase()) || description.includes(skill.toLowerCase()))
  );
  const allMatchedSkills = [...matchedSkills, ...extraSkills];
  const missingSkills = jobSkills.filter((skill) => !userSkills.includes(skill.toLowerCase()));

  const userGaveCriteria = userTitles.length > 0 || userSkills.length > 0;
  if (userGaveCriteria && matchedTitles.length === 0 && allMatchedSkills.length === 0) {
    return null;
  }

  // ── Step 3: score + reasons ───────────────────────────────────────
  const reasons = [];
  let score = 0;

  if (matchedTitles.length > 0) {
    score += 35;
    reasons.push(`Title matches "${matchedTitles.join(", ")}"`);
  }

  if (allMatchedSkills.length > 0) {
    // Up to 50 points, based on how many of the job's skills the user has
    const total = Math.max(jobSkills.length, allMatchedSkills.length);
    score += Math.round((allMatchedSkills.length / total) * 50);
    reasons.push(`Skills: ${allMatchedSkills.join(", ")}`);
  }

  if (userCompanies.includes(company)) {
    score += 15;
    reasons.push(`Preferred company: ${job.company}`);
  }

  if (userLocations.length > 0) reasons.push(`Location: ${job.location}`);
  if (userWorkTypes.length > 0) reasons.push(`Work type: ${job.workType}`);

  return {
    matchScore: Math.min(score, 100),
    matchReason: reasons.join(" | "),
    matchedSkills: allMatchedSkills,
    missingSkills,
  };
}

// Returns the jobs that match, best match first.
// Each result is a plain job object plus the match fields above.
function findMatches(user, jobs) {
  const results = [];

  for (const job of jobs) {
    const match = matchJob(user, job);
    if (match) {
      const plainJob = job.toObject ? job.toObject() : job;
      results.push({ ...plainJob, ...match });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { matchJob, findMatches };
