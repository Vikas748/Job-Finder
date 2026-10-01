// services/notifier.js
// Sends WhatsApp messages through Twilio.
//
// Demo mode: if Twilio keys are missing in .env, messages are printed
// in the terminal instead, so the whole app still works without an account.

const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken  = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const joinCode   = process.env.TWILIO_SANDBOX_JOIN_CODE || "";

// Twilio TRIAL accounts can't send free text on WhatsApp — only Twilio's
// pre-approved templates (a "Content SID" starting with HX).
// If this is set, we send that template and fill its {{1}} and {{2}} with job details.
// Upgraded accounts can leave it empty and the full text message is sent instead.
const contentSid = process.env.TWILIO_CONTENT_SID || "";

// Twilio is "on" only when real-looking keys are present
const isTwilioEnabled =
  accountSid.startsWith("AC") &&
  !accountSid.includes("xxxx") &&
  authToken.length > 0 &&
  authToken !== "your_auth_token_here";

const client = isTwilioEnabled ? twilio(accountSid, authToken) : null;

// Builds the message text, in the format the assignment asks for.
function buildJobMessage(job) {
  return [
    "🔔 *New job match!*",
    "",
    `*Company:* ${job.company}`,
    `*Role:* ${job.title}`,
    `*Location:* ${job.location} (${job.workType})`,
    job.matchReason ? `*Why it matched:* ${job.matchReason}` : null,
    `*Apply:* ${job.jobUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// Sends a WhatsApp message.
//   body      → full text (used in demo mode and on upgraded Twilio accounts)
//   variables → { "1": "...", "2": "..." } for the trial template (only if TWILIO_CONTENT_SID is set)
// Returns { success, channel, errorMessage } and never throws.
async function sendWhatsApp(phoneNumber, body, variables = null) {
  if (!isTwilioEnabled) {
    console.log(`\n📣  [DEMO MODE] WhatsApp to ${phoneNumber}:\n${body}\n${"-".repeat(50)}`);
    return { success: true, channel: "console", errorMessage: "" };
  }

  const message = { from: fromNumber, to: `whatsapp:${phoneNumber}` };

  if (contentSid) {
    message.contentSid = contentSid;
    message.contentVariables = JSON.stringify(variables || { 1: "JobPing", 2: "now" });
  } else {
    message.body = body;
  }

  try {
    const result = await client.messages.create(message);
    console.log(`✅  WhatsApp sent to ${phoneNumber} (SID ${result.sid})`);
    return { success: true, channel: "whatsapp", errorMessage: "" };
  } catch (err) {
    console.error(`❌  Twilio error for ${phoneNumber}:`, err.code, err.message);
    return { success: false, channel: "whatsapp", errorMessage: friendlyError(err) };
  }
}

// Short values for the trial template's two placeholders
function buildJobVariables(job) {
  return {
    1: `${job.title} at ${job.company}`,
    2: `${job.location} (${job.workType}). Apply: ${job.jobUrl}`,
  };
}

// Turns common Twilio sandbox errors into a hint the user can act on.
function friendlyError(err) {
  if (/contentsid required/i.test(err.message)) {
    return "Twilio trial accounts can only send templates. Add TWILIO_CONTENT_SID to backend/.env (see README) or upgrade the Twilio account.";
  }
  if (err.code === 63028) {
    return "The template's number of {{variables}} doesn't match. Use a template with exactly two variables, like the appointment reminder.";
  }
  if (err.code === 63015 || err.code === 63016) {
    return `This number hasn't joined the sandbox recently. Send "${joinCode || "join <your-code>"}" to ${fromNumber.replace("whatsapp:", "")} on WhatsApp, then try again.`;
  }
  if (err.code === 21211 || err.code === 21614) {
    return "That phone number isn't valid. Use the format +919876543210.";
  }
  return err.message;
}

function getStatus() {
  return {
    twilioEnabled: isTwilioEnabled,
    sandboxNumber: fromNumber.replace("whatsapp:", ""),
    joinCode,
    usingTemplate: Boolean(contentSid),
  };
}

module.exports = { buildJobMessage, buildJobVariables, sendWhatsApp, getStatus };
