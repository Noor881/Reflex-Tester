import {
  cleanText,
  escapeHtml,
  methodNotAllowed,
  readJson,
  sendJson,
  sameOrigin,
} from "./lib/http.mjs";
import { storeContact } from "./lib/db.mjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const notify = async (message) => {
  const payload = {
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
  };
  if (process.env.CONTACT_WEBHOOK_URL) {
    const response = await fetch(process.env.CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Contact notification webhook failed.");
    return "webhook";
  }
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO) {
    const from =
      process.env.CONTACT_FROM || "ReflexTester <onboarding@resend.dev>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [process.env.CONTACT_TO],
        reply_to: message.email,
        subject: `ReflexTester contact: ${message.subject || "New message"}`,
        html: `<h2>${escapeHtml(message.subject || "New message")}</h2><p><strong>From:</strong> ${escapeHtml(message.name)} &lt;${escapeHtml(message.email)}&gt;</p><p>${escapeHtml(message.message).replaceAll("\n", "<br>")}</p>`,
      }),
    });
    if (!response.ok) throw new Error("Email provider rejected the message.");
    return "resend";
  }
  throw new Error(
    "Contact delivery is not configured. Set CONTACT_WEBHOOK_URL or Resend variables.",
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!sameOrigin(req))
    return sendJson(res, 403, { error: "Origin rejected." });
  try {
    const input = await readJson(req, 20 * 1024);
    if (cleanText(input.website, 100)) return sendJson(res, 200, { ok: true });
    const message = {
      name: cleanText(input.name, 100),
      email: cleanText(input.email, 200).toLowerCase(),
      subject: cleanText(input.subject, 180),
      message: cleanText(input.message, 4000),
    };
    if (message.name.length < 2) throw new Error("Please provide your name.");
    if (!emailPattern.test(message.email))
      throw new Error("Please provide a valid email address.");
    if (message.message.length < 10)
      throw new Error("Please include a little more detail.");
    await storeContact(message);
    const delivery = await notify(message);
    return sendJson(res, 200, { ok: true, delivery });
  } catch (error) {
    return sendJson(res, 400, {
      error: String(error?.message || "Message could not be sent.").slice(
        0,
        500,
      ),
    });
  }
}
