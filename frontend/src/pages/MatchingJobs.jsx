// src/pages/MatchingJobs.jsx
// Shows only jobs that match the user's saved preferences.

import { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import { getMatchingJobs } from "../services/api";
import { useToast } from "../components/Toast";

export default function MatchingJobs() {
  const toast = useToast();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getMatchingJobs();
      setJobs(data);
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <div className="page-header"><h2>✅ Matching Jobs</h2></div>
        <div className="empty-state"><div className="empty-icon">🔄</div><p>Loading…</p></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>✅ Matching Jobs</h2>
        <p>{jobs.length} job{jobs.length !== 1 ? "s" : ""} match your current preferences</p>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No matches yet. Save your preferences and make sure jobs are loaded.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
