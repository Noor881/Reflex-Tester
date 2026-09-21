import { methodNotAllowed, requireAdmin, sendJson } from "./lib/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!process.env.CMS_ADMIN_TOKEN) {
    return sendJson(res, 503, {
      error: "CMS_ADMIN_TOKEN is not configured on the server.",
    });
  }
  if (!requireAdmin(req, res)) return;
  if (!process.env.VERCEL_DEPLOY_HOOK_URL) {
    return sendJson(res, 200, {
      ok: true,
      mode: "github-auto-deploy",
      message:
        "No deploy hook is required when Vercel is connected to the configured GitHub branch.",
    });
  }
  try {
    const response = await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, {
      method: "POST",
    });
    if (!response.ok)
      throw new Error("Vercel deploy hook rejected the request.");
    return sendJson(res, 200, {
      ok: true,
      mode: "vercel-deploy-hook",
      message: "A new deployment was requested.",
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: String(error?.message || "Deployment request failed.").slice(
        0,
        500,
      ),
    });
  }
}
