// src/pages/Users.jsx
// Everyone who gets alerts. Add yourself with your own number and test right away.

import { useState, useEffect } from "react";
import { Send, MessageCircle, FileSpreadsheet, Pencil, Trash2, Sparkles, UserPlus } from "lucide-react";
import UserForm from "../components/UserForm";
import { useToast } from "../components/Toast";
import {
  getUsers, createUser, updateUser, deleteUser,
  getSkillSummary, sendTestMessage, sendUserAlerts, exportUrl,
} from "../services/api";
import { summariseAlerts } from "../services/alertSummary";

export default function Users({ navigate, status }) {
  const toast = useToast();
  const [users, setUsers]       = useState([]);
  const [summary, setSummary]   = useState({ skills: [], locations: [], companies: [] });
  const [editing, setEditing]   = useState(null); // null = closed, "new" = add, or a user object
  const [saving, setSaving]     = useState(false);
  const [busyId, setBusyId]     = useState(""); // which user card has a request running

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [userList, skillSummary] = await Promise.all([getUsers(), getSkillSummary()]);
      setUsers(userList);
      setSummary(skillSummary);
      if (userList.length === 0) setEditing("new"); // open the form straight away
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function handleSave(form, sendNow) {
    setSaving(true);
    try {
      if (editing === "new") {
        const { alerts } = await createUser({ ...form, sendNow });
        toast(`${form.name} added.`, "success");
        if (sendNow) {
          const { text, type } = summariseAlerts(alerts);
          toast(text, type);
        }
      } else {
        await updateUser(editing._id, form);
        toast("Changes saved.", "success");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, "error");
    }
    setSaving(false);
  }

  async function handleDelete(user) {
    if (!confirm(`Delete ${user.name} and their alert history?`)) return;
    await deleteUser(user._id);
    toast(`${user.name} deleted.`, "info");
    load();
  }

  // Runs an API call for one card and shows a spinner on that card only
  async function runForUser(user, action) {
    setBusyId(user._id);
    try {
      if (action === "test") {
        const result = await sendTestMessage(user._id);
        toast(
          result.success
            ? result.channel === "console" ? "Demo mode: test message printed in the backend terminal." : `Test message sent to ${user.phoneNumber}.`
            : result.errorMessage,
          result.success ? "success" : "error"
        );
      } else {
        const { results } = await sendUserAlerts(user._id);
        const { text, type } = summariseAlerts(results);
        toast(text, type);
      }
    } catch (err) {
      toast(err.message, "error");
    }
    setBusyId("");
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Users</h1>
          <p>Each user gets their own WhatsApp alerts. Add your own number to test.</p>
        </div>
        {editing === null && (
          <button className="btn btn-primary" onClick={() => setEditing("new")}>
            <UserPlus size={16} /> Add user
          </button>
        )}
      </header>

      {editing !== null && (
        <UserForm
          key={editing === "new" ? "new" : editing._id}
          initialUser={editing === "new" ? null : editing}
          summary={summary}
          status={status}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="user-grid">
        {users.map((user) => (
          <article key={user._id} className={`user-card ${busyId === user._id ? "busy" : ""}`}>
            <header className="user-card-head">
              <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <h3>{user.name}</h3>
                <div className="muted">{user.phoneNumber}</div>
              </div>
              <button className="match-count" onClick={() => navigate("matches", user._id)}>
                <strong>{user.matchCount}</strong> matches
              </button>
            </header>

            <div className="chip-list">
              {user.skills.length === 0 && <span className="muted">No skills added</span>}
              {user.skills.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>

            <dl className="prefs">
              <dt>Titles</dt><dd>{user.jobTitles.join(", ") || "Any"}</dd>
              <dt>Locations</dt><dd>{user.locations.join(", ") || "Any"}</dd>
              <dt>Work type</dt><dd>{user.workTypes.join(", ") || "Any"}</dd>
            </dl>

            <div className="card-actions">
              <button className="btn btn-primary btn-sm" onClick={() => runForUser(user, "alerts")} disabled={busyId === user._id}>
                <Send size={14} /> Send new matches
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => runForUser(user, "test")} disabled={busyId === user._id}>
                <MessageCircle size={14} /> Test message
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("matches", user._id)}>
                <Sparkles size={14} /> View matches
              </button>
              <a className="btn btn-ghost btn-sm" href={exportUrl(user._id)}>
                <FileSpreadsheet size={14} /> Excel
              </a>
              <span className="spacer" />
              <button className="icon-btn" aria-label={`Edit ${user.name}`} onClick={() => setEditing(user)}><Pencil size={16} /></button>
              <button className="icon-btn danger" aria-label={`Delete ${user.name}`} onClick={() => handleDelete(user)}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
