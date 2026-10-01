// src/pages/Dashboard.jsx
// Overview page with stats and quick-action buttons.

import { useState, useEffect } from "react";
import { getAllJobs, getMatchingJobs, getHistory, seedJobs, sendAlerts, exportExcelUrl } from "../services/api";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({ total: "—", matched: "—", notified: "—" });
  const [alertResults, setAlertResults] = useState([]);
  const [loading, setLoading] = useState({ seed: false, send: false });

  // Load stats when page mounts
  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [jobs, matched, history] = await Promise.all([
        getAllJobs(), getMatchingJobs(), getHistory(),
      ]);
      setStats({ total: jobs.length, matched: matched.length, notified: history.length });
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
  }

  async function handleSeed() {
    setLoading(l => ({ ...l, seed: true }));
    try {
      const data = await seedJobs();
      toast(`✅ ${data.message}`, "success");
      loadStats();
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(l => ({ ...l, seed: false }));
  }

  async function handleSendAlerts() {
    setLoading(l => ({ ...l, send: true }));
    setAlertResults([]);
    try {
      const data = await sendAlerts();
      setAlertResults(data.results || []);
      loadStats();
      toast("📨 Alert run complete!", "success");
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(l => ({ ...l, send: false }));
  }

  return (
    <div>
      <div className="page-header">
        <h2>🚀 Dashboard</h2>
        <p>Overview of your job search activity</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.matched}</div>
          <div className="stat-label">Matched Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.notified}</div>
          <div className="stat-label">Alerts Sent</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-title">⚡ Quick Actions</div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSeed} disabled={loading.seed}>
            {loading.seed ? <><span className="spinner" /> Loading…</> : "🌱 Load Sample Jobs"}
          </button>
          <button className="btn btn-success" onClick={handleSendAlerts} disabled={loading.send}>
            {loading.send ? <><span className="spinner" /> Sending…</> : "📨 Send Alerts for New Matches"}
          </button>
          <a href={exportExcelUrl()} target="_blank" rel="noreferrer" className="btn btn-outline">
            📥 Export to Excel
          </a>
        </div>

        {/* Alert results summary */}
        {alertResults.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            {alertResults.map((r, i) => {
              const isSkip = r.status.startsWith("skipped");
              const isFail = r.status.startsWith("failed");
              const color  = isSkip ? "var(--text-muted)" : isFail ? "var(--red)" : "var(--green)";
              const icon   = isSkip ? "⏭" : isFail ? "❌" : "✅";
              return (
                <div key={i} className="alert-result-row">
                  <span>{icon}</span>
                  <strong style={{ color: "var(--text-primary)", minWidth: "200px" }}>
                    {r.title} @ {r.company}
                  </strong>
                  <span style={{ color }}>{r.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
