import {
  cleanText,
  methodNotAllowed,
  readJson,
  sendJson,
  sameOrigin,
} from "./lib/http.mjs";
import { storeEvent } from "./lib/db.mjs";

const allowedEvents = new Set([
  "affiliate_click",
  "tool_start",
  "contact_success",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!sameOrigin(req))
    return sendJson(res, 403, { error: "Origin rejected." });
  try {
    const input = await readJson(req, 16 * 1024);
    const name = cleanText(input.name, 40);
    if (!allowedEvents.has(name))
      return sendJson(res, 400, { error: "Unsupported event." });
    const metadata =
      input.metadata && typeof input.metadata === "object"
        ? Object.fromEntries(
            Object.entries(input.metadata)
              .slice(0, 20)
              .map(([key, value]) => [
                cleanText(key, 40),
                cleanText(value, 180),
              ]),
          )
        : {};
    const event = {
      name,
      slug: cleanText(input.slug, 100),
      path: cleanText(input.path, 300),
      metadata,
    };
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      const response = await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          receivedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Analytics webhook failed.");
      return sendJson(res, 204, {});
    }
    const stored = await storeEvent(event);
    if (!stored) console.info("ReflexTester event", event);
    return sendJson(res, 204, {});
  } catch (error) {
    return sendJson(res, 400, {
      error: String(error?.message || "Event rejected.").slice(0, 500),
    });
  }
}
