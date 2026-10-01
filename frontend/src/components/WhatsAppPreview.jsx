// src/components/WhatsAppPreview.jsx
// A phone-style preview of the exact WhatsApp message a user receives.
// Pass a job object; *bold* text is rendered like WhatsApp does.

function renderLine(line, i) {
  // Split "*Company:* Razorpay" into bold and normal parts
  const parts = line.split(/(\*[^*]+\*)/g);
  return (
    <div key={i} className="wa-line">
      {parts.map((part, j) =>
        part.startsWith("*") && part.endsWith("*") ? <strong key={j}>{part.slice(1, -1)}</strong> : part
      )}
    </div>
  );
}

export default function WhatsAppPreview({ job, contactName = "JobPing alerts" }) {
  const lines = [
    "🔔 *New job match!*",
    "",
    `*Company:* ${job.company || "Company name"}`,
    `*Role:* ${job.title || "Job title"}`,
    `*Location:* ${job.location || "Location"} (${job.workType || "Remote"})`,
    job.matchReason ? `*Why it matched:* ${job.matchReason}` : null,
    `*Apply:* ${job.jobUrl || "https://…"}`,
  ].filter((line) => line !== null);

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="phone">
      <div className="phone-top">
        <span className="phone-avatar">J</span>
        <div>
          <div className="phone-contact">{contactName}</div>
          <div className="phone-sub">via Twilio sandbox</div>
        </div>
      </div>
      <div className="phone-chat">
        <div className="wa-bubble">
          {lines.map(renderLine)}
          <span className="wa-time">{time}</span>
        </div>
      </div>
    </div>
  );
}
