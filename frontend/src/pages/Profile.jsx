// src/pages/Profile.jsx
// User preference form — saves job search criteria to the backend.

import { useState, useEffect } from "react";
import TagInput from "../components/TagInput";
import { getProfile, saveProfile } from "../services/api";
import { useToast } from "../components/Toast";

const WORK_TYPE_OPTIONS = ["Remote", "Hybrid", "On-site"];

export default function Profile() {
  const toast = useToast();
  const [form, setForm] = useState({
    name:               "",
    phoneNumber:        "",
    jobTitles:          [],
    locations:          [],
    workTypes:          [],
    keywords:           [],
    preferredCompanies: [],
  });

  // Load saved profile when page mounts
  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();
      setForm({
        name:               data.name               || "",
        phoneNumber:        data.phoneNumber         || "",
        jobTitles:          data.jobTitles           || [],
        locations:          data.locations           || [],
        workTypes:          data.workTypes           || [],
        keywords:           data.keywords            || [],
        preferredCompanies: data.preferredCompanies  || [],
      });
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
  }

  function toggleWorkType(type) {
    setForm(f => ({
      ...f,
      workTypes: f.workTypes.includes(type)
        ? f.workTypes.filter(w => w !== type)
        : [...f.workTypes, type],
    }));
  }

  async function handleSave() {
    try {
      await saveProfile(form);
      toast("✅ Preferences saved!", "success");
    } catch (err) {
      toast(`❌ ${err.message}`, "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Job Preferences</h2>
        <p>Set your criteria. The matching engine uses these to find relevant jobs.</p>
      </div>

      <div className="card">
        <div className="form-grid">
          {/* Name */}
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={form.name} placeholder="e.g. Priya Sharma"
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>WhatsApp Number</label>
            <input type="tel" value={form.phoneNumber} placeholder="+919876543210"
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
            <span className="form-hint">Used for WhatsApp alerts via Twilio</span>
          </div>

          {/* Job Titles */}
          <div className="form-group full-width">
            <label>Desired Job Titles</label>
            <TagInput tags={form.jobTitles}
              onChange={tags => setForm(f => ({ ...f, jobTitles: tags }))}
              placeholder="e.g. Software Engineer, Backend Engineer" />
          </div>

          {/* Locations */}
          <div className="form-group full-width">
            <label>Preferred Locations</label>
            <TagInput tags={form.locations}
              onChange={tags => setForm(f => ({ ...f, locations: tags }))}
              placeholder="e.g. India, Bangalore, Remote" />
          </div>

          {/* Work Types */}
          <div className="form-group">
            <label>Accepted Work Types</label>
            <div className="checkbox-group">
              {WORK_TYPE_OPTIONS.map(type => (
                <label key={type} className="checkbox-label">
                  <input type="checkbox"
                    checked={form.workTypes.includes(type)}
                    onChange={() => toggleWorkType(type)} />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="form-group">
            <label>Keywords / Skills</label>
            <TagInput tags={form.keywords}
              onChange={tags => setForm(f => ({ ...f, keywords: tags }))}
              placeholder="e.g. Python, Node.js, API" />
          </div>

          {/* Preferred Companies */}
          <div className="form-group full-width">
            <label>Preferred Companies <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
            <TagInput tags={form.preferredCompanies}
              onChange={tags => setForm(f => ({ ...f, preferredCompanies: tags }))}
              placeholder="e.g. Google, Razorpay" />
            <span className="form-hint">Leave blank to match all companies</span>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={handleSave}>💾 Save Preferences</button>
          <button className="btn btn-outline" onClick={loadProfile}>↺ Reload</button>
        </div>
      </div>
    </div>
  );
}
