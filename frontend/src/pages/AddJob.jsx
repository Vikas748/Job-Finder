// src/pages/AddJob.jsx
// Form to manually add a new job posting to the database.

import { useState } from "react";
import TagInput from "../components/TagInput";
import { addJob } from "../services/api";
import { useToast } from "../components/Toast";

const empty = {
  title: "", company: "", location: "", workType: "Remote",
  postedDate: "", jobUrl: "", keywords: [], description: "",
};

export default function AddJob() {
  const toast = useToast();
  const [form, setForm]       = useState(empty);
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.company || !form.location || !form.postedDate || !form.jobUrl) {
      toast("⚠️ Title, Company, Location, Date, and URL are required.", "error");
      return;
    }
    setLoading(true);
    try {
      await addJob(form);
      toast("✅ Job added successfully!", "success");
      setForm(empty);
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="page-header">
        <h2>➕ Add a Job</h2>
        <p>Manually add a new job posting to the database</p>
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Job Title *</label>
            <input type="text" value={form.title} placeholder="e.g. Backend Engineer"
              onChange={e => set("title", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Company *</label>
            <input type="text" value={form.company} placeholder="e.g. Zerodha"
              onChange={e => set("company", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input type="text" value={form.location} placeholder="e.g. Bangalore, India"
              onChange={e => set("location", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Work Type *</label>
            <select value={form.workType} onChange={e => set("workType", e.target.value)}>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>

          <div className="form-group">
            <label>Posted Date *</label>
            <input type="text" value={form.postedDate} placeholder="YYYY-MM-DD"
              onChange={e => set("postedDate", e.target.value)} />
          </div>

          <div className="form-group">
            <label>Job URL *</label>
            <input type="text" value={form.jobUrl} placeholder="https://..."
              onChange={e => set("jobUrl", e.target.value)} />
          </div>

          <div className="form-group full-width">
            <label>Keywords / Skills</label>
            <TagInput tags={form.keywords}
              onChange={tags => set("keywords", tags)}
              placeholder="e.g. Node.js, MongoDB, React" />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea rows={3} value={form.description} placeholder="Brief description of the role…"
              onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" /> Saving…</> : "💾 Add Job"}
          </button>
          <button className="btn btn-outline" onClick={() => setForm(empty)}>✕ Clear</button>
        </div>
      </div>
    </div>
  );
}
