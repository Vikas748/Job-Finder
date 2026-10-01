// src/services/alertSummary.js
// Turns a list of alert results from the backend into one short toast message.

export function summariseAlerts(results) {
  const sent    = results.filter((r) => r.status === "sent").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed  = results.filter((r) => r.status === "failed");

  if (failed.length > 0) return { text: `${failed.length} failed: ${failed[0].errorMessage}`, type: "error" };
  if (sent === 0 && skipped === 0) return { text: "No matching jobs right now.", type: "info" };
  if (sent === 0) return { text: `Nothing new to send. ${skipped} match${skipped > 1 ? "es were" : " was"} already sent earlier.`, type: "info" };
  return { text: `Sent ${sent} new match${sent > 1 ? "es" : ""} on WhatsApp.`, type: "success" };
}
