// src/components/JobCard.jsx
// Renders a single job posting as a card.
// Used on the Matching Jobs page.

function workTypeBadge(wt) {
  const map = { Remote: "badge-remote", Hybrid: "badge-hybrid", "On-site": "badge-onsite" };
  return <span className={`badge ${map[wt] || "badge-onsite"}`}>{wt}</span>;
}

export default function JobCard({ job }) {
  // Build 1–2 letter company logo from company name initials
  const initials = (job.company || "?")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1 }}>
          <div className="company-logo">{initials}</div>
          <div>
            <div className="job-title">{job.title}</div>
            <div className="job-company">{job.company}</div>
          </div>
        </div>
        {workTypeBadge(job.workType)}
      </div>

      <div className="job-meta">
        <span className="job-meta-item">📍 {job.location}</span>
        <span className="job-meta-item">📅 {job.postedDate}</span>
      </div>

      {job.matchReason && (
        <div className="match-reason">
          <strong>🎯 Why it matched</strong>
          {job.matchReason}
        </div>
      )}

      {job.keywords && job.keywords.length > 0 && (
        <div className="keywords-row">
          {job.keywords.slice(0, 5).map(k => (
            <span key={k} className="keyword-chip">{k}</span>
          ))}
        </div>
      )}

      <div className="job-card-footer">
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {job._id ? `ID: ${job._id.slice(-6)}` : ""}
        </span>
        <a
          href={job.jobUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-sm"
        >
          Apply ↗
        </a>
      </div>
    </div>
  );
}
