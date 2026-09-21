import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CONTENT_FILE = path.join(ROOT, "content", "articles.json");
const HOST = "127.0.0.1";
const PORT = Number(process.env.REFLEX_CMS_PORT || 4174);
const MAX_BODY = 1024 * 1024;
const allowedImages = new Set([
  "aim-hardware.webp",
  "performance-workspace.webp",
  "reaction-study.webp",
  "sleep-recovery.webp",
]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const send = (res, status, body, type = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
};

const json = (res, status, value) =>
  send(res, status, JSON.stringify(value), "application/json; charset=utf-8");

const readBody = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const cleanText = (value, max = 10000) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);

const cleanList = (value, maxItems = 20) =>
  (Array.isArray(value) ? value : String(value ?? "").split("\n"))
    .map((item) => cleanText(item, 500))
    .filter(Boolean)
    .slice(0, maxItems);

const validDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

const validateUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["amzn.to", "amazon.co.uk", "www.amazon.co.uk"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

const normalizeArticle = (input) => {
  const type = input.type === "affiliate" ? "affiliate" : "editorial";
  const status = ["draft", "published", "archived"].includes(input.status)
    ? input.status
    : "draft";
  const title = cleanText(input.title, 140);
  const slug = cleanText(input.slug, 90).toLowerCase();
  const description = cleanText(input.description, 180);
  const today = new Date().toISOString().slice(0, 10);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(
      "Slug must use lowercase letters, numbers and hyphens only.",
    );
  if (title.length < 8) throw new Error("Title must be at least 8 characters.");
  if (description.length < 50)
    throw new Error("SEO description must be at least 50 characters.");
  const updatedAt = validDate(input.updatedAt) ? input.updatedAt : today;
  const publishedAt = validDate(input.publishedAt)
    ? input.publishedAt
    : updatedAt;
  const article = {
    ...input,
    slug,
    title,
    description,
    category: cleanText(input.category || "Guides", 60),
    type,
    status,
    publishedAt,
    updatedAt,
    author: cleanText(input.author || "ReflexTester Editorial", 80),
    heroImage: allowedImages.has(input.heroImage)
      ? input.heroImage
      : "reaction-study.webp",
    focusKeyword: cleanText(input.focusKeyword, 80),
    seoTitle: cleanText(input.seoTitle, 70),
    seoDescription: cleanText(input.seoDescription, 180),
    intro: cleanText(input.intro, 600),
    body: cleanText(input.body, 30000),
    focus: cleanList(input.focus),
    actions: cleanList(input.actions),
    faq: [],
  };
  if (type === "affiliate") {
    article.product = cleanText(input.product, 180);
    article.link = cleanText(input.link, 500);
    article.summary = cleanText(input.summary, 1000);
    article.checks = cleanList(input.checks);
    article.verdict = cleanText(input.verdict, 1000);
    if (!article.product || !validateUrl(article.link))
      throw new Error(
        "Affiliate articles need a valid HTTPS Amazon UK/amzn.to link and product name.",
      );
  } else {
    delete article.product;
    delete article.link;
    delete article.summary;
    delete article.checks;
    delete article.verdict;
  }
  return article;
};

const loadContent = async () =>
  JSON.parse(await readFile(CONTENT_FILE, "utf8"));

const saveContent = async (data) => {
  const temp = `${CONTENT_FILE}.tmp`;
  await writeFile(temp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temp, CONTENT_FILE);
};

const run = (command, args) =>
  execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

const generate = () =>
  run(process.execPath, [path.join(ROOT, "scripts", "generate-site.mjs")]);

const build = () =>
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);

const serveFile = async (req, res, pathname) => {
  const requested =
    pathname === "/" || pathname === "/admin" || pathname === "/admin/"
      ? "/admin/index.html"
      : pathname;
  const absolute = path.resolve(ROOT, `.${requested}`);
  if (!absolute.startsWith(ROOT) || absolute.includes(".."))
    return send(res, 403, "Forbidden");
  try {
    const body = await readFile(absolute);
    const type =
      mimeTypes[path.extname(absolute)] || "application/octet-stream";
    return send(res, 200, body, type);
  } catch {
    return send(res, 404, "Not found");
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  try {
    if (url.pathname === "/api/health") return json(res, 200, { ok: true });
    if (url.pathname === "/api/articles" && req.method === "GET")
      return json(res, 200, await loadContent());
    if (url.pathname === "/api/articles" && req.method === "POST") {
      const input = await readBody(req);
      const article = normalizeArticle(input);
      const data = await loadContent();
      const originalSlug = cleanText(input.originalSlug, 90);
      const index = data.articles.findIndex(
        (item) => item.slug === (originalSlug || article.slug),
      );
      if (index === -1) data.articles.push(article);
      else data.articles[index] = article;
      data.updatedAt = new Date().toISOString().slice(0, 10);
      await saveContent(data);
      generate();
      return json(res, 200, { ok: true, article, count: data.articles.length });
    }
    if (url.pathname === "/api/build" && req.method === "POST") {
      build();
      return json(res, 200, { ok: true, message: "Build completed." });
    }
    return serveFile(req, res, url.pathname);
  } catch (error) {
    const message = error?.stderr || error?.message || "CMS request failed.";
    return json(res, 400, { ok: false, error: String(message).slice(-4000) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ReflexTester CMS: http://${HOST}:${PORT}/admin/`);
  console.log("Local-only editor. It is intentionally not included in dist/.");
});
