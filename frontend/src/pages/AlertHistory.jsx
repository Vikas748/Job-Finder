// src/pages/AlertHistory.jsx
// Shows a log of all notifications sent (WhatsApp or console).

import { useState, useEffect } from "react";
import { getHistory } from "../services/api";
import { useToast } from "../components/Toast";

export default function AlertHistory() {
  const toast = useToast();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getHistory();
      setLogs(data);
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <h2>🔔 Alert History</h2>
        <p>Log of every notification sent — duplicate jobs are automatically skipped</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🔄</div><p>Loading…</p></div></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🔕</div><p>No alerts sent yet.</p></div></td></tr>
              ) : logs.map(log => (
                <tr key={log._id}>
                  <td>{log.jobId?.title || "—"}</td>
                  <td>{log.jobId?.company || "—"}</td>
                  <td>{log.channel}</td>
                  <td>
                    <span className={`badge badge-${log.status === "sent" ? "sent" : "failed"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>
                    {new Date(log.createdAt).toLocaleString()}
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
