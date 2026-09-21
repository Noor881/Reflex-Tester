import {
  cleanText,
  methodNotAllowed,
  readJson,
  requireAdmin,
  sendJson,
} from "./lib/http.mjs";
import { normalizeArticle } from "./lib/article-schema.mjs";
import {
  isConfigured,
  readArticles,
  writeArticles,
} from "./lib/github-content.mjs";

const ensureBackend = (res) => {
  if (!process.env.CMS_ADMIN_TOKEN) {
    sendJson(res, 503, {
      error: "CMS_ADMIN_TOKEN is not configured on the server.",
    });
    return false;
  }
  if (!isConfigured()) {
    sendJson(res, 503, {
      error: "GITHUB_TOKEN and GITHUB_REPO are required for CMS storage.",
    });
    return false;
  }
  return true;
};

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method))
    return methodNotAllowed(res, ["GET", "POST"]);
  if (!ensureBackend(res) || !requireAdmin(req, res)) return;
  try {
    const current = await readArticles();
    if (req.method === "GET") {
      return sendJson(res, 200, {
        ...current.data,
        mode: "github",
      });
    }
    const input = await readJson(req);
    const article = normalizeArticle(input);
    const articles = Array.isArray(current.data.articles)
      ? [...current.data.articles]
      : [];
    const originalSlug = cleanText(input.originalSlug, 90);
    const lookupSlug = originalSlug || article.slug;
    const index = articles.findIndex((item) => item.slug === lookupSlug);
    const duplicate = articles.findIndex(
      (item) => item.slug === article.slug && item.slug !== lookupSlug,
    );
    if (duplicate !== -1)
      return sendJson(res, 409, { error: "That slug is already in use." });
    if (index === -1) articles.push(article);
    else articles[index] = article;
    const data = {
      version: current.data.version || 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      articles,
    };
    await writeArticles(
      data,
      current.sha,
      `${index === -1 ? "Add" : "Update"} guide: ${article.slug}`,
    );
    return sendJson(res, 200, {
      ok: true,
      article,
      count: data.articles.length,
      deployment: "GitHub commit created; Vercel will rebuild when connected.",
    });
  } catch (error) {
    return sendJson(res, 400, {
      error: String(error?.message || "CMS request failed.").slice(0, 1000),
    });
  }
}
