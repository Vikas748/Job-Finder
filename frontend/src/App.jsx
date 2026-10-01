// src/App.jsx
// Root component: sidebar + the active page.
// We keep navigation as simple state (no router library needed).

import { useState, useEffect } from "react";
import Sidebar      from "./components/Sidebar";
import Dashboard    from "./pages/Dashboard";
import Users        from "./pages/Users";
import AllJobs      from "./pages/AllJobs";
import MatchingJobs from "./pages/MatchingJobs";
import AlertHistory from "./pages/AlertHistory";
import AddJob       from "./pages/AddJob";
import { getStatus } from "./services/api";

const PAGES = {
  dashboard: Dashboard,
  users:     Users,
  jobs:      AllJobs,
  matches:   MatchingJobs,
  addjob:    AddJob,
  history:   AlertHistory,
};

export default function App() {
  const [page, setPage]     = useState("dashboard");
  const [userId, setUserId] = useState(""); // user selected on Matches / History pages
  const [status, setStatus] = useState(null); // Twilio status from the backend

  useEffect(() => {
    getStatus()
      .then(setStatus)
      .catch(() => setStatus({ offline: true }));
  }, []);

  // navigate("matches", someUserId) opens a page for a specific user
  function navigate(nextPage, nextUserId) {
    if (nextUserId) setUserId(nextUserId);
    setPage(nextPage);
    window.scrollTo(0, 0);
  }

  const Page = PAGES[page] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={navigate} status={status} />
      <main className="main-content">
        {status?.offline && (
          <div className="banner banner-error">
            The backend isn't running. Open a terminal in <code>backend</code> and run <code>npm run dev</code>, then refresh.
          </div>
        )}
        <Page navigate={navigate} userId={userId} setUserId={setUserId} status={status} />
      </main>
    </div>
  );
}
