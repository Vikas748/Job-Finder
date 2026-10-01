// src/services/api.js
// Every call to the Express backend lives here.
// Pages import these functions instead of writing fetch() themselves.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Can't reach the backend. Start it with `npm run dev` in the backend folder.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

const post = (path, data) => request(path, { method: "POST", body: JSON.stringify(data || {}) });
const put  = (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) });
const del  = (path)       => request(path, { method: "DELETE" });

// ── Jobs ─────────────────────────────────────────────────────────────
export const getAllJobs      = ()     => request("/jobs");
export const addJob          = (data) => post("/jobs", data);
export const deleteJob       = (id)   => del(`/jobs/${id}`);
export const seedJobs        = ()     => post("/jobs/seed");
export const getSkillSummary = ()     => request("/jobs/skills");

// ── Users ────────────────────────────────────────────────────────────
export const getUsers        = ()         => request("/users");
export const createUser      = (data)     => post("/users", data);
export const updateUser      = (id, data) => put(`/users/${id}`, data);
export const deleteUser      = (id)       => del(`/users/${id}`);
export const getUserMatches  = (id)       => request(`/users/${id}/matches`);
export const sendTestMessage = (id)       => post(`/users/${id}/test`);
export const sendUserAlerts  = (id)       => post(`/users/${id}/alerts`);
export const exportUrl       = (id)       => `${BASE_URL}/users/${id}/export`;

// ── Notifications ────────────────────────────────────────────────────
export const sendAllAlerts = ()       => post("/notifications/send");
export const getHistory    = (userId) => request(`/notifications/history${userId ? `?userId=${userId}` : ""}`);
export const clearHistory  = (userId) => del(`/notifications/history${userId ? `?userId=${userId}` : ""}`);
export const getStatus     = ()       => request("/notifications/status");
