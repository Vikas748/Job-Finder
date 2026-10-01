// src/App.jsx
// Root component — manages page navigation and renders the sidebar + active page.

import { useState } from "react";
import Sidebar       from "./components/Sidebar";
import Dashboard     from "./pages/Dashboard";
import Profile       from "./pages/Profile";
import AllJobs       from "./pages/AllJobs";
import MatchingJobs  from "./pages/MatchingJobs";
import AlertHistory  from "./pages/AlertHistory";
import AddJob        from "./pages/AddJob";

// Map page IDs to their components
const PAGES = {
  dashboard: Dashboard,
  profile:   Profile,
  jobs:      AllJobs,
  matches:   MatchingJobs,
  history:   AlertHistory,
  addjob:    AddJob,
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  // Look up the component for the active page
  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}
