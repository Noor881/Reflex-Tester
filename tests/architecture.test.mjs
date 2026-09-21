import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tools } from "../src/data/tools.js";
import { articles, affiliateArticles } from "../src/data/articles.js";

const root = resolve(import.meta.dirname, "..");

test("tool and article slugs are unique", () => {
  assert.equal(new Set(tools.map((item) => item.slug)).size, tools.length);
  const allArticles = [...articles, ...affiliateArticles];
  assert.equal(
    new Set(allArticles.map((item) => item.slug)).size,
    allArticles.length,
  );
});

test("every canonical route has a generated HTML entry", async () => {
  await Promise.all(
    tools.map((item) => access(resolve(root, `tools/${item.slug}.html`))),
  );
  await Promise.all(
    [...articles, ...affiliateArticles].map((item) =>
      access(resolve(root, `blog/${item.slug}.html`)),
    ),
  );
});

test("affiliate links have disclosure-safe relationship attributes", async () => {
  for (const item of affiliateArticles) {
    const html = await readFile(
      resolve(root, `blog/${item.slug}.html`),
      "utf8",
    );
    assert.match(html, /Affiliate disclosure:/);
    assert.match(html, /rel="sponsored nofollow noopener"/);
    assert.ok(html.includes(item.link));
  }
});

test("production pages contain canonical, robots and structured-data signals", async () => {
  const html = await readFile(resolve(root, "index.html"), "utf8");
  assert.match(html, /rel="canonical"/);
  assert.match(html, /name="robots"/);
  assert.match(html, /application\/ld\+json/);
});
