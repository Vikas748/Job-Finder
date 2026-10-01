// src/pages/Dashboard.jsx
// Overview: a 3-step setup guide, a few numbers, and a preview of the WhatsApp message.

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import WhatsAppPreview from "../components/WhatsAppPreview";
import { useToast } from "../components/Toast";
import { getAllJobs, getUsers, getHistory, getUserMatches, seedJobs, sendAllAlerts } from "../services/api";
import { summariseAlerts } from "../services/alertSummary";

export default function Dashboard({ navigate }) {
  const toast = useToast();
  const [jobs, setJobs]       = useState([]);
  const [users, setUsers]     = useState([]);
  const [history, setHistory] = useState([]);
  const [topMatch, setTopMatch] = useState(null); // best match of the newest user, for the preview
  const [busy, setBusy]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [jobList, userList, logs] = await Promise.all([getAllJobs(), getUsers(), getHistory()]);
      setJobs(jobList);
      setUsers(userList);
      setHistory(logs);
      if (userList.length > 0) {
        const matches = await getUserMatches(userList[0]._id);
        setTopMatch(matches[0] || null);
      }
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleSeed() {
    setBusy("seed");
    try {
      const { message } = await seedJobs();
      toast(message, "success");
      await load();
    } catch (err) {
      toast(err.message, "error");
    }
    setBusy("");
  }

  async function handleSendAll() {
    setBusy("send");
    try {
      const { results } = await sendAllAlerts();
      const { text, type } = summariseAlerts(results);
      toast(text, type);
      await load();
    } catch (err) {
      toast(err.message, "error");
    }
    setBusy("");
  }

  const sentCount = history.filter((h) => h.status === "sent").length;

  // The setup really is a sequence, so it's shown as numbered steps
  const steps = [
    {
      done: jobs.length > 0,
      title: "Load job postings",
      text: "Adds 12 sample tech jobs to the database.",
      action: <button className="btn btn-ghost btn-sm" onClick={handleSeed} disabled={busy === "seed"}>{busy === "seed" ? "Loading…" : "Load sample jobs"}</button>,
    },
    {
      done: users.length > 0,
      title: "Add yourself as a user",
      text: "Pick your skills and enter your own WhatsApp number.",
      action: <button className="btn btn-ghost btn-sm" onClick={() => navigate("users")}>Add user</button>,
    },
    {
      done: sentCount > 0,
      title: "Send alerts",
      text: "Every user gets their new matches. Already-sent jobs are skipped.",
      action: <button className="btn btn-primary btn-sm" onClick={handleSendAll} disabled={busy === "send" || users.length === 0}>{busy === "send" ? "Sending…" : "Send alerts to everyone"}</button>,
    },
  ];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">New jobs, straight to WhatsApp.</h1>
          <p className="hero-sub">
            JobPing checks each job against every user's skills, titles and location,
            writes the matches to Excel, and sends a WhatsApp message once per job.
          </p>

          <ol className="steps">
            {steps.map((step, i) => (
              <li key={step.title} className={`step ${step.done ? "done" : ""}`}>
                <span className="step-num">{step.done ? <Check size={16} /> : i + 1}</span>
                <div className="step-body">
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </div>
                {step.action}
              </li>
            ))}
          </ol>

          <dl className="numbers">
            <div><dt>Jobs</dt><dd>{jobs.length}</dd></div>
            <div><dt>Users</dt><dd>{users.length}</dd></div>
            <div><dt>Alerts sent</dt><dd>{sentCount}</dd></div>
          </dl>
        </div>

        <div className="hero-phone">
          <WhatsAppPreview
            job={topMatch || { company: "Razorpay", title: "Senior Backend Engineer", location: "Bangalore, India", workType: "Hybrid", jobUrl: "https://razorpay.com/jobs/…" }}
          />
          <p className="phone-caption">
            {topMatch ? `${users[0].name}'s best match right now` : "What a user receives"}
          </p>
        </div>
      </section>

      {history.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Latest alerts</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("history")}>See all</button>
          </div>
          <ul className="activity">
            {history.slice(0, 5).map((log) => (
              <li key={log._id}>
                <span className={`dot dot-${log.status}`} />
                <span><strong>{log.jobId?.title || "Deleted job"}</strong> at {log.jobId?.company || "—"}</span>
                <span className="muted">to {log.userId?.name || "deleted user"}</span>
                <span className="muted right">{new Date(log.updatedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
