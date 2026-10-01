// src/pages/AllJobs.jsx
// Every job in the database, plus which skills are most in demand.

import { useState, useEffect } from "react";
import { Search, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "../components/Toast";
import { getAllJobs, getSkillSummary, deleteJob, seedJobs } from "../services/api";

export default function AllJobs({ navigate }) {
  const toast = useToast();
  const [jobs, setJobs]     = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [jobList, summary] = await Promise.all([getAllJobs(), getSkillSummary()]);
      setJobs(jobList);
      setSkills(summary.skills.slice(0, 8));
    } catch (err) {
      toast(err.message, "error");
    }
    setLoading(false);
  }

  async function handleDelete(job) {
    if (!confirm(`Delete "${job.title}" at ${job.company}?`)) return;
    await deleteJob(job._id);
    toast("Job deleted.", "info");
    load();
  }

  async function handleSeed() {
    const { message } = await seedJobs();
    toast(message, "success");
    load();
  }

  const query = search.toLowerCase();
  const filtered = jobs.filter((j) =>
    [j.title, j.company, j.location, j.workType, ...j.keywords].join(" ").toLowerCase().includes(query)
  );
  const topCount = skills[0]?.count || 1;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>All jobs</h1>
          <p>{jobs.length} job{jobs.length === 1 ? "" : "s"} in the database.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("addjob")}>Post a job</button>
      </header>

      {skills.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Most requested skills</h2>
          <div className="bars">
            {skills.map((s) => (
              <div key={s.name} className="bar-row">
                <span className="bar-label">{s.name}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(s.count / topCount) * 100}%` }} />
                </span>
                <span className="bar-value">{s.count} job{s.count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <label className="search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, location or skill"
          />
        </label>

        {!loading && jobs.length === 0 ? (
          <div className="empty">
            <h2>No jobs yet</h2>
            <p>Load the sample set or post your own job.</p>
            <button className="btn btn-primary" onClick={handleSeed}>Load sample jobs</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Skills</th>
                  <th>Posted</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div className="muted">{job.company}</div>
                    </td>
                    <td>{job.location}</td>
                    <td><span className={`worktype wt-${job.workType.toLowerCase()}`}>{job.workType}</span></td>
                    <td className="chip-cell">{job.keywords.map((k) => <span key={k} className="chip">{k}</span>)}</td>
                    <td className="nowrap">{job.postedDate}</td>
                    <td className="nowrap">
                      <a className="icon-btn" href={job.jobUrl} target="_blank" rel="noreferrer" aria-label="Open job"><ExternalLink size={16} /></a>
                      <button className="icon-btn danger" onClick={() => handleDelete(job)} aria-label="Delete job"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="muted pad">No jobs match "{search}".</p>}
          </div>
        )}
      </section>
    </div>
  );
}
