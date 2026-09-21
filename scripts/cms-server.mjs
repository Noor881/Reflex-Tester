import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeArticle } from "../api/lib/article-schema.mjs";
import { cleanText } from "../api/lib/http.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CONTENT_FILE = path.join(ROOT, "content", "articles.json");
const HOST = "127.0.0.1";
const PORT = Number(process.env.REFLEX_CMS_PORT || 4174);
const MAX_BODY = 1024 * 1024;
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
  console.log(
    "Local authoring mode. Hosted mode uses the token-protected /api routes.",
  );
});
