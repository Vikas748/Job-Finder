// services/matcher.js
// Core matching logic — compares each job against the user's preferences.
//
// Matching rules (simple string-based, no AI):
//   1. Title match   — job title contains one of the user's desired titles
//   2. Location match— job location contains one of the user's locations
//   3. Work type     — job workType is in the user's accepted work types
//   4. Keyword match — any user keyword appears in the job keywords / title / description
//   5. Company match — (bonus) job company is in the user's preferred companies
//
// A job is included if at least ONE rule matches.

class MatcherService {
  constructor(profile) {
    // Normalise everything to lowercase for case-insensitive matching
    this.titles    = (profile.jobTitles          || []).map(t => t.toLowerCase());
    this.locations = (profile.locations          || []).map(l => l.toLowerCase());
    this.workTypes = (profile.workTypes          || []).map(w => w.toLowerCase());
    this.keywords  = (profile.keywords           || []).map(k => k.toLowerCase());
    this.companies = (profile.preferredCompanies || []).map(c => c.toLowerCase());
  }

  // Returns an array of job objects that match the profile.
  // Each returned object gets an extra "matchReason" field.
  filter(jobs) {
    const results = [];

    for (const job of jobs) {
      const reasons = this.getMatchReasons(job);
      if (reasons.length > 0) {
        results.push({
          ...job.toObject(),          // convert Mongoose doc → plain object
          matchReason: reasons.join(" | "),
        });
      }
    }

    return results;
  }

  // Returns a list of human-readable reason strings.
  // An empty array means no match.
  getMatchReasons(job) {
    const reasons = [];

    const title    = (job.title       || "").toLowerCase();
    const location = (job.location    || "").toLowerCase();
    const workType = (job.workType    || "").toLowerCase();
    const company  = (job.company     || "").toLowerCase();
    const desc     = (job.description || "").toLowerCase();
    const jobKw    = (job.keywords    || []).map(k => k.toLowerCase());

    // 1. Title match
    const matchedTitles = this.titles.filter(t => title.includes(t));
    if (matchedTitles.length > 0) {
      reasons.push(`Title: ${matchedTitles.join(", ")}`);
    }

    // 2. Location match
    const matchedLocs = this.locations.filter(l => location.includes(l));
    if (matchedLocs.length > 0) {
      reasons.push(`Location: ${matchedLocs.join(", ")}`);
    }

    // 3. Work type match
    if (this.workTypes.length > 0 && this.workTypes.includes(workType)) {
      reasons.push(`Work type: ${job.workType}`);
    }

    // 4. Keyword match (in job.keywords array, title, or description)
    const matchedKw = this.keywords.filter(
      kw => jobKw.includes(kw) || title.includes(kw) || desc.includes(kw)
    );
    if (matchedKw.length > 0) {
      reasons.push(`Keywords: ${matchedKw.join(", ")}`);
    }

    // 5. Preferred company (bonus — does not filter out non-matches)
    if (this.companies.length > 0 && this.companies.includes(company)) {
      reasons.push(`Preferred company: ${job.company}`);
    }

    return reasons;
  }
}

module.exports = MatcherService;
