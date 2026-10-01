// src/pages/AlertHistory.jsx
// Every alert attempt. One row per user + job, so duplicates can't happen.

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { useToast } from "../components/Toast";
import { getHistory, clearHistory, getUsers } from "../services/api";

export default function AlertHistory() {
  const toast = useToast();
  const [logs, setLogs]     = useState([]);
  const [users, setUsers]   = useState([]);
  const [filterId, setFilterId] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterId]);

  async function load() {
    setLoading(true);
    try {
      setLogs(await getHistory(filterId));
    } catch (err) {
      toast(err.message, "error");
    }
    setLoading(false);
  }

  async function handleClear() {
    const who = filterId ? users.find((u) => u._id === filterId)?.name : "all users";
    if (!confirm(`Clear alert history for ${who}? The same jobs can then be sent again.`)) return;
    const { message } = await clearHistory(filterId);
    toast(message, "info");
    load();
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Alert history</h1>
          <p>A job is sent to each user once. Clear the history to repeat a demo.</p>
        </div>
        <div className="head-actions">
          <select value={filterId} onChange={(e) => setFilterId(e.target.value)} aria-label="Filter by user">
            <option value="">All users</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={handleClear} disabled={logs.length === 0}>
            <RotateCcw size={16} /> Clear history
          </button>
        </div>
      </header>

      <section className="panel">
        {!loading && logs.length === 0 ? (
          <div className="empty">
            <h2>No alerts yet</h2>
            <p>Send alerts from the Users page or post a job that matches someone.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Sent to</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <strong>{log.jobId?.title || "Deleted job"}</strong>
                      <div className="muted">{log.jobId?.company}</div>
                    </td>
                    <td>
                      {log.userId?.name || "Deleted user"}
                      <div className="muted">{log.userId?.phoneNumber}</div>
                    </td>
                    <td>{log.channel === "console" ? "Terminal (demo)" : "WhatsApp"}</td>
                    <td>
                      <span className={`status status-${log.status}`}>{log.status === "sent" ? "Sent" : "Failed"}</span>
                      {log.errorMessage && <div className="error-text">{log.errorMessage}</div>}
                    </td>
                    <td className="nowrap">{new Date(log.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
