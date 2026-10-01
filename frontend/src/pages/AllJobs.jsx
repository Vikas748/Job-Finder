// src/pages/AllJobs.jsx
// Displays every job in the database as a searchable table.

import { useState, useEffect } from "react";
import { getAllJobs } from "../services/api";
import { useToast } from "../components/Toast";

function WorkTypeBadge({ type }) {
  const map = { Remote: "badge-remote", Hybrid: "badge-hybrid", "On-site": "badge-onsite" };
  return <span className={`badge ${map[type] || "badge-onsite"}`}>{type}</span>;
}

export default function AllJobs() {
  const toast = useToast();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllJobs();
      setJobs(data);
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(false);
  }

  const filtered = jobs.filter(j =>
    [j.title, j.company, j.location, ...(j.keywords || [])]
      .join(" ").toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h2>💼 All Jobs</h2>
        <p>Complete list of jobs in the database ({jobs.length} total)</p>
      </div>

      <div className="card">
        {/* Search bar */}
        <input
          type="text"
          placeholder="🔍  Search by title, company, location, keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: "16px", maxWidth: "400px" }}
        />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Work Type</th>
                <th>Posted</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🔄</div><p>Loading…</p></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📭</div><p>No jobs found. Use "Load Sample Jobs" on the Dashboard.</p></div></td></tr>
              ) : filtered.map(job => (
                <tr key={job._id}>
                  <td><strong>{job.title}</strong></td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td><WorkTypeBadge type={job.workType} /></td>
                  <td>{job.postedDate}</td>
                  <td>
                    <a href={job.jobUrl} target="_blank" rel="noreferrer"
                       style={{ color: "var(--accent-light)" }}>Apply ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
