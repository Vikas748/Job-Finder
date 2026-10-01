// services/notifier.js
// Sends WhatsApp messages via the Twilio API.
//
// If Twilio credentials are missing, it falls back to console output
// so the app still works during development / demo without a Twilio account.
//
// Required .env variables:
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_WHATSAPP_FROM  (e.g. whatsapp:+14155238886)

class NotifierService {
  constructor() {
    this.accountSid  = process.env.TWILIO_ACCOUNT_SID  || "";
    this.authToken   = process.env.TWILIO_AUTH_TOKEN   || "";
    this.fromNumber  = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
    this.isEnabled   = !!(
      this.accountSid &&
      this.authToken &&
      !this.accountSid.includes("xxxx") &&
      this.authToken !== "your_auth_token_here"
    );
  }

  // Sends a WhatsApp notification for a matched job.
  //
  // @param {string} phoneNumber  Recipient number in E.164 e.g. "+919876543210"
  // @param {object} job          Plain job object with matchReason field
  // @returns {Promise<{ success, channel, errorMessage }>}
  async send(phoneNumber, job) {
    const body = this.buildMessage(job);

    // ── Demo / console mode (Twilio not configured) ──────────────────
    if (!this.isEnabled) {
      console.log("\n📣  [DEMO — Twilio not configured, printing to console]");
      console.log(body);
      console.log("-".repeat(60));
      return { success: true, channel: "console", errorMessage: "" };
    }

    if (!phoneNumber) {
      return { success: false, channel: "whatsapp", errorMessage: "No phone number in profile" };
    }

    // ── Send via Twilio ───────────────────────────────────────────────
    try {
      const twilio = require("twilio");
      const client = twilio(this.accountSid, this.authToken);

      const message = await client.messages.create({
        body: body,
        from: this.fromNumber,
        to:   `whatsapp:${phoneNumber}`,
      });

      console.log(`✅  WhatsApp sent to ${phoneNumber} — SID: ${message.sid}`);
      return { success: true, channel: "whatsapp", errorMessage: "" };
    } catch (err) {
      console.error("❌  Twilio error:", err.message);
      return { success: false, channel: "whatsapp", errorMessage: err.message };
    }
  }

  // Formats the notification message body.
  buildMessage(job) {
    return [
      "🔔 *New Job Match!*",
      "",
      `*Company:* ${job.company}`,
      `*Role:* ${job.title}`,
      `*Location:* ${job.location}`,
      `*Work Type:* ${job.workType}`,
      `*Why it matched:* ${job.matchReason || ""}`,
      `*Apply:* ${job.jobUrl}`,
    ].join("\n");
  }
}

module.exports = NotifierService;
