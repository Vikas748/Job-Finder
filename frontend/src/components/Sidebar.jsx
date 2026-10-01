// src/components/Sidebar.jsx
// Left navigation + a small status box showing whether WhatsApp is live.

import { LayoutDashboard, Users, Briefcase, Sparkles, PlusCircle, History } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview",      Icon: LayoutDashboard },
  { id: "users",     label: "Users",         Icon: Users },
  { id: "matches",   label: "Matches",       Icon: Sparkles },
  { id: "jobs",      label: "All jobs",      Icon: Briefcase },
  { id: "addjob",    label: "Post a job",    Icon: PlusCircle },
  { id: "history",   label: "Alert history", Icon: History },
];

export default function Sidebar({ activePage, onNavigate, status }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-dot" />
        </span>
        <span className="brand-name">JobPing</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {status && !status.offline && (
        <div className={`status-box ${status.twilioEnabled ? "live" : "demo"}`}>
          <strong>{status.twilioEnabled ? "WhatsApp is live" : "Demo mode"}</strong>
          <span>
            {status.twilioEnabled
              ? `Sending from ${status.sandboxNumber}`
              : "Add Twilio keys to backend/.env to send real messages. Until then, messages print in the backend terminal."}
          </span>
        </div>
      )}
    </aside>
  );
}
