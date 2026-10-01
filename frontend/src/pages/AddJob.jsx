// src/pages/AddJob.jsx
// Post a new job. As soon as it's saved, every matching user gets a WhatsApp alert.
// The phone on the right previews the message while you type.

import { useState, useEffect } from "react";
import TagInput from "../components/TagInput";
import WhatsAppPreview from "../components/WhatsAppPreview";
import { useToast } from "../components/Toast";
import { addJob, getSkillSummary } from "../services/api";

const today = new Date().toISOString().slice(0, 10);

const EMPTY_JOB = {
  title: "", company: "", location: "", workType: "Remote",
  postedDate: today, jobUrl: "", keywords: [], description: "",
};

export default function AddJob() {
  const toast = useToast();
  const [form, setForm]       = useState(EMPTY_JOB);
  const [skillNames, setSkillNames] = useState([]);
  const [saving, setSaving]   = useState(false);
  const [alerts, setAlerts]   = useState(null); // who got notified about the last job

  useEffect(() => {
    getSkillSummary().then((s) => setSkillNames(s.skills.map((k) => k.name))).catch(() => {});
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await addJob(form);
      setAlerts(result.alerts);
      toast("Job posted.", "success");
      setForm(EMPTY_JOB);
    } catch (err) {
      toast(err.message, "error");
    }
    setSaving(false);
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Post a job</h1>
          <p>Matching users are alerted on WhatsApp the moment you save. This is the quickest way to demo a live alert.</p>
        </div>
      </header>

      <div className="split">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field">
              <span>Job title</span>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Backend Engineer" required />
            </label>
            <label className="field">
              <span>Company</span>
              <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Zerodha" required />
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Location</span>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Bangalore, India" required />
            </label>
            <label className="field">
              <span>Work type</span>
              <select value={form.workType} onChange={(e) => set("workType", e.target.value)}>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Posted date</span>
              <input type="date" value={form.postedDate} onChange={(e) => set("postedDate", e.target.value)} required />
            </label>
            <label className="field">
              <span>Job URL</span>
              <input type="url" value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} placeholder="https://…" required />
            </label>
          </div>

          <div className="field">
            <span>Skills required</span>
            <TagInput
              tags={form.keywords}
              onChange={(v) => set("keywords", v)}
              placeholder="Type a skill and press Enter"
              suggestions={skillNames}
            />
          </div>

          <label className="field">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What the role involves" />
          </label>

          <div className="btn-row">
            <button className="btn btn-primary" disabled={saving}>{saving ? "Posting…" : "Post job and alert matches"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(EMPTY_JOB)}>Clear</button>
          </div>

          {alerts && (
            <div className="result-box">
              {alerts.length === 0 ? (
                <p>No user matched this job, so no alerts were sent.</p>
              ) : (
                alerts.map((a, i) => (
                  <p key={i} className={`result-${a.status}`}>
                    {a.status === "sent" ? "Sent to" : "Failed for"} <strong>{a.userName}</strong>
                    {a.channel === "console" && " (demo mode, check the backend terminal)"}
                    {a.errorMessage && `: ${a.errorMessage}`}
                  </p>
                ))
              )}
            </div>
          )}
        </form>

        <aside className="sticky-phone">
          <WhatsAppPreview job={form} />
          <p className="phone-caption">Live preview</p>
        </aside>
      </div>
    </div>
  );
}
