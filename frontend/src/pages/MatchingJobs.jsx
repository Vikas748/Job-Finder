// src/pages/MatchingJobs.jsx
// Jobs that match one user, best first.

import { useState, useEffect } from "react";
import { FileSpreadsheet, Send } from "lucide-react";
import JobCard from "../components/JobCard";
import { useToast } from "../components/Toast";
import { getUsers, getUserMatches, sendUserAlerts, exportUrl } from "../services/api";
import { summariseAlerts } from "../services/alertSummary";

export default function MatchingJobs({ userId, setUserId, navigate }) {
  const toast = useToast();
  const [users, setUsers]     = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load users once; pick the first one if none is selected
  useEffect(() => {
    getUsers()
      .then((list) => {
        setUsers(list);
        if (!userId && list.length > 0) setUserId(list[0]._id);
        if (list.length === 0) setLoading(false);
      })
      .catch((err) => toast(err.message, "error"));
  }, []);

  // Reload matches whenever the selected user changes
  useEffect(() => {
    if (userId) loadMatches();
  }, [userId]);

  async function loadMatches() {
    setLoading(true);
    try {
      setJobs(await getUserMatches(userId));
    } catch (err) {
      toast(err.message, "error");
    }
    setLoading(false);
  }

  async function handleSend() {
    setSending(true);
    try {
      const { results } = await sendUserAlerts(userId);
      const { text, type } = summariseAlerts(results);
      toast(text, type);
      loadMatches();
    } catch (err) {
      toast(err.message, "error");
    }
    setSending(false);
  }

  if (!loading && users.length === 0) {
    return (
      <div className="page">
        <div className="empty">
          <h2>Add a user to see matches</h2>
          <p>Matches are worked out per user from their skills, titles and location.</p>
          <button className="btn btn-primary" onClick={() => navigate("users")}>Add user</button>
        </div>
      </div>
    );
  }

  const newCount = jobs.filter((j) => !j.alreadyNotified).length;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Matches</h1>
          <p>{loading ? "Finding matches…" : `${jobs.length} matching job${jobs.length === 1 ? "" : "s"}, ${newCount} not sent yet.`}</p>
        </div>
        <div className="head-actions">
          <select value={userId} onChange={(e) => setUserId(e.target.value)} aria-label="Choose user">
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <a className="btn btn-ghost" href={userId ? exportUrl(userId) : "#"}><FileSpreadsheet size={16} /> Download Excel</a>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending || newCount === 0}>
            <Send size={16} /> {sending ? "Sending…" : `Send ${newCount} new`}
          </button>
        </div>
      </header>

      {!loading && jobs.length === 0 ? (
        <div className="empty">
          <h2>No matches for this user</h2>
          <p>Try adding more skills, or remove the location or work-type filter.</p>
          <button className="btn btn-ghost" onClick={() => navigate("users")}>Edit preferences</button>
        </div>
      ) : (
        <div className="job-grid">
          {jobs.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
