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

// Sends any text to a WhatsApp number.
// Returns { success, channel, errorMessage } and never throws.
async function sendWhatsApp(phoneNumber, body) {
  if (!isTwilioEnabled) {
    console.log(`\n📣  [DEMO MODE] WhatsApp to ${phoneNumber}:\n${body}\n${"-".repeat(50)}`);
    return { success: true, channel: "console", errorMessage: "" };
  }

  try {
    const message = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${phoneNumber}`,
      body,
    });
    console.log(`✅  WhatsApp sent to ${phoneNumber} (SID ${message.sid})`);
    return { success: true, channel: "whatsapp", errorMessage: "" };
  } catch (err) {
    console.error(`❌  Twilio error for ${phoneNumber}:`, err.message);
    return { success: false, channel: "whatsapp", errorMessage: friendlyError(err) };
  }
}

// Turns common Twilio sandbox errors into a hint the user can act on.
function friendlyError(err) {
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
  };
}

module.exports = { buildJobMessage, sendWhatsApp, getStatus };
