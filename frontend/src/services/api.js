// src/services/api.js
// All HTTP calls to the Express backend live here.
// Components import these functions instead of writing fetch() inline.

const BASE_URL = "http://localhost:5000/api";

// ── Generic fetch wrapper ────────────────────────────────────────────
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Jobs ─────────────────────────────────────────────────────────────
export const getAllJobs     = ()           => request("/jobs");
export const addJob        = (data)       => request("/jobs",      { method: "POST", body: JSON.stringify(data) });
export const seedJobs      = ()           => request("/jobs/seed",     { method: "POST" });
export const getMatchingJobs = ()         => request("/jobs/matching");

// ── Profile ──────────────────────────────────────────────────────────
export const getProfile    = ()           => request("/profile");
export const saveProfile   = (data)       => request("/profile",   { method: "POST", body: JSON.stringify(data) });

// ── Notifications ────────────────────────────────────────────────────
export const sendAlerts    = ()           => request("/notifications/send",    { method: "POST" });
export const getHistory    = ()           => request("/notifications/history");
export const exportExcelUrl = ()          => `${BASE_URL}/notifications/export`;
