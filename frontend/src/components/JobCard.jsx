// src/components/JobCard.jsx
// One matching job: score, skills the user has vs. skills the job also wants.

import { MapPin, CalendarDays, ExternalLink, Check } from "lucide-react";

export default function JobCard({ job }) {
  const score = job.matchScore ?? 0;

  return (
    <article className="job-card">
      <header className="job-card-head">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <div className="job-company">{job.company}</div>
        </div>
        {/* Score ring: the conic-gradient fills to the score percentage */}
        <div className="score-ring" style={{ "--score": score }} title={`Match score ${score}%`}>
          <span>{score}</span>
        </div>
      </header>

      <div className="job-meta">
        <span><MapPin size={14} /> {job.location}</span>
        <span className={`worktype wt-${job.workType.toLowerCase()}`}>{job.workType}</span>
        <span><CalendarDays size={14} /> {job.postedDate}</span>
      </div>

      {job.matchedSkills?.length > 0 && (
        <div className="skill-row">
          <span className="skill-row-label">You have</span>
          {job.matchedSkills.map((s) => (
            <span key={s} className="chip chip-have"><Check size={12} /> {s}</span>
          ))}
        </div>
      )}

      {job.missingSkills?.length > 0 && (
        <div className="skill-row">
          <span className="skill-row-label">Also wants</span>
          {job.missingSkills.map((s) => (
            <span key={s} className="chip chip-missing">{s}</span>
          ))}
        </div>
      )}

      {job.matchReason && <p className="match-reason">{job.matchReason}</p>}

      <footer className="job-card-foot">
        {job.alreadyNotified ? (
          <span className="sent-tag"><Check size={14} /> Sent on WhatsApp</span>
        ) : (
          <span className="new-tag">Not sent yet</span>
        )}
        <a href={job.jobUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
          Open job <ExternalLink size={14} />
        </a>
      </footer>
    </article>
  );
}
