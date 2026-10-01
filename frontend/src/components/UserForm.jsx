// src/components/UserForm.jsx
// Add or edit a user. Skills, titles and locations come from the jobs
// in the database, so you can build a matching user in a few clicks.

import { useState } from "react";
import TagInput from "./TagInput";
import SkillPicker from "./SkillPicker";

const WORK_TYPES = ["Remote", "Hybrid", "On-site"];

const EMPTY_USER = {
  name: "",
  phoneNumber: "",
  jobTitles: [],
  locations: [],
  workTypes: [],
  skills: [],
  preferredCompanies: [],
};

export default function UserForm({ initialUser, summary, status, onSave, onCancel, saving }) {
  const isEdit = Boolean(initialUser);
  const [form, setForm]       = useState(initialUser || EMPTY_USER);
  const [sendNow, setSendNow] = useState(true);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  function toggleWorkType(type) {
    set("workTypes", form.workTypes.includes(type) ? form.workTypes.filter((w) => w !== type) : [...form.workTypes, type]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form, sendNow);
  }

  // Custom skills the user typed that aren't in the job list
  const knownSkills = summary.skills.map((s) => s.name.toLowerCase());
  const customSkills = form.skills.filter((s) => !knownSkills.includes(s.toLowerCase()));

  return (
    <form className="panel user-form" onSubmit={handleSubmit}>
      <h2 className="panel-title">{isEdit ? `Edit ${initialUser.name}` : "Add a user"}</h2>

      {/* ── Who ─────────────────────────────────────────────── */}
      <div className="form-row">
        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Anika" required />
        </label>
        <label className="field">
          <span>WhatsApp number</span>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
          <small className="hint">10-digit numbers get +91 added automatically.</small>
        </label>
      </div>

      {status?.twilioEnabled && (
        <div className="callout">
          <strong>First time with this number?</strong> From that phone, send{" "}
          <code>{status.joinCode || "join <your-code>"}</code> on WhatsApp to <code>{status.sandboxNumber}</code>.
          Twilio's sandbox only delivers to numbers that have joined.
        </div>
      )}

      {/* ── Skills ──────────────────────────────────────────── */}
      <div className="field">
        <span>Skills companies are asking for</span>
        <small className="hint">The number shows how many jobs want that skill. Click to select.</small>
        <SkillPicker skills={summary.skills} selected={form.skills} onChange={(v) => set("skills", v)} />
      </div>

      <div className="field">
        <span>Other skills</span>
        <TagInput
          tags={customSkills}
          onChange={(custom) => set("skills", [...form.skills.filter((s) => knownSkills.includes(s.toLowerCase())), ...custom])}
          placeholder="Type a skill and press Enter"
        />
      </div>

      {/* ── Preferences ─────────────────────────────────────── */}
      <div className="field">
        <span>Job titles</span>
        <TagInput
          tags={form.jobTitles}
          onChange={(v) => set("jobTitles", v)}
          placeholder="e.g. Backend Engineer"
          suggestions={["Software Engineer", "Backend Engineer", "Frontend Developer", "Data Engineer", "DevOps Engineer"]}
        />
        <small className="hint">A job matches if its title contains any of these.</small>
      </div>

      <div className="form-row">
        <div className="field">
          <span>Locations</span>
          <TagInput
            tags={form.locations}
            onChange={(v) => set("locations", v)}
            placeholder="e.g. Bangalore"
            suggestions={summary.locations}
          />
          <small className="hint">Leave empty to accept any location.</small>
        </div>

        <div className="field">
          <span>Work type</span>
          <div className="toggle-group">
            {WORK_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                className={`toggle ${form.workTypes.includes(type) ? "on" : ""}`}
                onClick={() => toggleWorkType(type)}
                aria-pressed={form.workTypes.includes(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <small className="hint">None selected means any work type.</small>
        </div>
      </div>

      <div className="field">
        <span>Preferred companies (optional)</span>
        <TagInput
          tags={form.preferredCompanies}
          onChange={(v) => set("preferredCompanies", v)}
          placeholder="e.g. Razorpay"
          suggestions={summary.companies}
        />
      </div>

      {/* ── Save ────────────────────────────────────────────── */}
      {!isEdit && (
        <label className="check">
          <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} />
          Send current matches to WhatsApp right after saving
        </label>
      )}

      <div className="btn-row">
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add user"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
