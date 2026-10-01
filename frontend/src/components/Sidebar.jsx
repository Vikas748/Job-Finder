// src/components/Sidebar.jsx
// Navigation sidebar with page links.

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",     icon: "📊" },
  { id: "profile",   label: "Preferences",   icon: "⚙️" },
  { id: "jobs",      label: "All Jobs",       icon: "💼" },
  { id: "matches",   label: "Matching Jobs",  icon: "✅" },
  { id: "history",   label: "Alert History",  icon: "🔔" },
  { id: "addjob",    label: "Add Job",        icon: "➕" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🎯</div>
        <div>
          <h1>JobFilter</h1>
          <span>Smart Job Alerts</span>
        </div>
      </div>

      {NAV_ITEMS.map((item, index) => (
        <>
          {index === 4 && <div key="divider" className="sidebar-divider" />}
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        </>
      ))}
    </aside>
  );
}
