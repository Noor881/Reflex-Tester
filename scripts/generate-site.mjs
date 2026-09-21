import { writeFile } from "node:fs/promises";
import { tools } from "../src/data/tools.js";
import {
  articles as editorialArticles,
  affiliateArticles,
} from "../src/data/articles.js";

const root = new URL("../", import.meta.url);
const SITE_URL = "https://reflextester.vercel.app";
const UPDATED = "2026-09-21";
const esc = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const head = ({
  title,
  description,
  path = "",
  depth = ".",
  type = "website",
  image = `${SITE_URL}/assets/photos/performance-workspace.webp`,
  schema,
}) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="theme-color" content="#f4f2ed"><link rel="canonical" href="${SITE_URL}/${path}"><link rel="alternate" type="application/rss+xml" title="ReflexTester Guides" href="${SITE_URL}/feed.xml"><meta property="og:site_name" content="ReflexTester"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE_URL}/${path}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}"><link rel="icon" href="${depth}/assets/brand/reflextester-mark.svg" type="image/svg+xml"><link rel="icon" href="${depth}/favicon.ico" sizes="any"><link rel="manifest" href="${depth}/manifest.json"><link rel="stylesheet" href="${depth}/src/styles/base.css">${schema ? `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>` : ""}`;
const end = (module) =>
  `<script type="module" src="${module}"></script></body></html>`;
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ReflexTester",
      url: SITE_URL,
      logo: `${SITE_URL}/assets/brand/reflextester-mark.svg`,
      email: "contact@reflextester.fun",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ReflexTester",
      description:
        "Browser-based reaction tests, aim training, cognitive exercises and game utilities.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ],
};

for (const tool of tools) {
  const path = `tools/${tool.slug}.html`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/${path}`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "ReflexTester", url: SITE_URL },
  };
  const html = `${head({ title: `${tool.name} — ReflexTester`, description: tool.description, path, depth: "..", schema })}<link rel="stylesheet" href="../src/styles/tool.css"></head><body data-tool="${tool.slug}"><main id="main"></main>${end("../src/app/tool-page.js")}`;
  await writeFile(new URL(`../tools/${tool.slug}.html`, import.meta.url), html);
}

const rootPages = {
  "index.html": `${head({ title: "ReflexTester — Reaction, aim and cognitive performance tools", description: "Measure reaction speed, train mouse control and use precise game utilities in your browser.", schema: siteSchema })}<link rel="stylesheet" href="./src/styles/site.css"></head><body><main id="main"></main>${end("./src/app/home.js")}`,
  "tools.html": `${head({ title: "Tests, training and game utilities — ReflexTester", description: "Browse reaction tests, aim training, cognitive exercises and game setup utilities.", path: "tools.html" })}<link rel="stylesheet" href="./src/styles/site.css"></head><body><main id="main"></main>${end("./src/app/catalog.js")}`,
  "dashboard.html": `${head({ title: "Your local results — ReflexTester", description: "Review real attempts, personal bests and averages stored in this browser.", path: "dashboard.html" })}<link rel="stylesheet" href="./src/styles/site.css"></head><body><main id="main"></main>${end("./src/app/dashboard.js")}`,
  "about.html": `${head({ title: "About ReflexTester", description: "How ReflexTester approaches browser-based performance measurement and practice.", path: "about.html" })}<link rel="stylesheet" href="./src/styles/article.css"></head><body><main id="main" class="article-layout"><article class="article"><span class="eyebrow">About</span><h1>Performance tools with clear limits.</h1><p>ReflexTester provides browser-based tests, practice drills and game configuration utilities. It works without an account and stores personal results locally.</p><h2>What the measurements mean</h2><p>A browser result includes human response time plus display, operating-system and input-device latency. The tools are designed for personal comparison under consistent conditions; they are not medical or diagnostic instruments.</p><h2>How the product is built</h2><p>Timing-sensitive tests use monotonic browser timing, interactive drills use Pointer Events, and statistics come only from completed activity on the current device.</p></article></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "editorial-policy.html": `${head({ title: "Editorial policy — ReflexTester", description: "How ReflexTester creates, reviews and updates guides and buyer information.", path: "editorial-policy.html" })}<link rel="stylesheet" href="./src/styles/article.css"></head><body><main id="main" class="article-layout"><article class="article"><span class="eyebrow">Editorial standards</span><h1>Useful, cautious and transparent information.</h1><p>ReflexTester guides support practical decisions without presenting browser measurements as medical diagnosis, occupational certification or guaranteed performance improvement.</p><h2>How guides are produced</h2><p>Each guide starts from a defined reader question, separates observation from advice, avoids invented statistics and states important measurement limits. Automated tools may assist structure and editing; published pages are reviewed for clarity, relevance and unsupported claims.</p><h2>Corrections and updates</h2><p>Pages show a review or update date. Material errors are corrected in the canonical source registry and regenerated across the site. Correction requests can be sent through the contact page.</p><h2>Affiliate independence</h2><p>Affiliate guides identify commercial links before the first purchase link. Commission eligibility does not change the listed checks, cautions or suitability guidance.</p></article></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "contact.html": `${head({ title: "Contact ReflexTester", description: "Contact the ReflexTester team.", path: "contact.html" })}<link rel="stylesheet" href="./src/styles/article.css"></head><body><main id="main" class="article-layout"><article class="article"><span class="eyebrow">Contact</span><h1>Report a problem or suggest an improvement.</h1><p>Include the tool name, browser, device type and the steps that produced the issue.</p><p><a class="button accent" href="mailto:contact@reflextester.fun">contact@reflextester.fun</a></p></article></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "privacy-policy.html": `${head({ title: "Privacy policy — ReflexTester", description: "How ReflexTester handles local results, analytics and affiliate links.", path: "privacy-policy.html" })}<link rel="stylesheet" href="./src/styles/article.css"></head><body><main id="main" class="article-layout"><article class="article"><span class="eyebrow">Legal</span><h1>Privacy policy</h1><p>Last updated 21 September 2026.</p><h2>Local activity data</h2><p>Test results and preferences are stored in your browser using local storage. They are not an account and are not transmitted by the result system. You can clear them from the Results page.</p><h2>Analytics and hosting</h2><p>Hosting providers may process standard request information such as IP address, browser information and requested URL for delivery and security. If analytics are enabled, they may collect aggregate usage information.</p><h2>Affiliate links</h2><p>Some guides contain clearly disclosed Amazon affiliate links. Clicking them can allow Amazon to associate a qualifying purchase with this website.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:contact@reflextester.fun">contact@reflextester.fun</a>.</p></article></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "terms-of-service.html": `${head({ title: "Terms of service — ReflexTester", description: "Terms for using ReflexTester browser tools and written content.", path: "terms-of-service.html" })}<link rel="stylesheet" href="./src/styles/article.css"></head><body><main id="main" class="article-layout"><article class="article"><span class="eyebrow">Legal</span><h1>Terms of service</h1><p>Last updated 21 September 2026.</p><h2>Use of the tools</h2><p>ReflexTester is provided for general information, recreation and personal practice. Results are affected by hardware and software conditions and must not be treated as medical, occupational or safety certification.</p><h2>Content and third parties</h2><p>Game names and trademarks belong to their respective owners. Links to third-party websites are governed by those websites' terms.</p><h2>Availability</h2><p>Tools may change as browsers and platform requirements evolve. We do not guarantee uninterrupted availability.</p></article></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "404.html": `${head({ title: "Page not found — ReflexTester", description: "The requested ReflexTester page could not be found.", path: "404.html" })}<link rel="stylesheet" href="./src/styles/site.css"></head><body><main id="main"><div class="page"><span class="eyebrow">404</span><h1>That page is not here.</h1><p class="lede">The URL may have changed or been entered incorrectly.</p><a class="button accent" href="./tools.html">Browse tools</a></div></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
  "500.html": `${head({ title: "Something went wrong — ReflexTester", description: "ReflexTester encountered an unexpected error.", path: "500.html" })}<link rel="stylesheet" href="./src/styles/site.css"></head><body><main id="main"><div class="page"><span class="eyebrow">Error</span><h1>Something went wrong.</h1><p class="lede">Reload the page. If the problem continues, report the tool and browser you were using.</p><a class="button accent" href="./index.html">Return home</a></div></main><script type="module">import{mountShell}from'./src/app/shell.js';mountShell()</script></body></html>`,
};
for (const [file, html] of Object.entries(rootPages)) {
  const externalized = html.replace(
    /<script type="module">[\s\S]*?mountShell\(\)[\s\S]*?<\/script>/,
    '<script type="module" src="./src/app/static-page.js"></script>',
  );
  await writeFile(new URL(`../${file}`, import.meta.url), externalized);
}

const section = (id, title, body) =>
  `<section><h2 id="${id}">${title}</h2>${body}</section>`;
const list = (values) =>
  `<ul>${values.map((value) => `<li>${value}</li>`).join("")}</ul>`;
const renderEditorial = (item) => {
  const intro = `<p class="article-deck">${item.description}</p><p>Performance is variable. A useful guide should help you test an idea without pretending that one score explains your health, talent or future potential. This article focuses on repeatable observation and practical decisions.</p>`;
  return `<article class="article"><span class="eyebrow">${item.category}</span><h1>${item.title}</h1><div class="article-meta">ReflexTester editorial · Reviewed 21 September 2026 · 6 min read</div>${intro}${section("key-ideas", "The key ideas", list(item.focus))}${section("practical-method", "A practical method", `<p>Use a simple routine so that normal variation is less likely to mislead you.</p>${list(item.actions)}<p>Keep the browser, display, input device and posture unchanged during a comparison. If you change several factors together, the score cannot tell you which change mattered.</p>`)}${section("read-results", "How to read the result", "<p>Use multiple valid attempts and report the median. Also look at the range: a slightly faster median with much wider variation may not represent better control. Discard attempts affected by an accidental click, interruption or obvious anticipation, but do not remove ordinary slow responses simply because they look disappointing.</p>")}${section("limits", "Limits and safety", "<p>ReflexTester is a recreational measurement and practice website. Browser results include display, operating-system and input-device delay. They are not medical tests, fitness-to-drive assessments, occupational certification or treatment advice.</p>")}${section("next-step", "Try it consistently", '<p>Choose one relevant ReflexTester tool, record the conditions and repeat the same short protocol on another day. Consistent methods produce more useful observations than dramatic one-off scores.</p><p><a class="button accent" href="../tools.html">Browse testing and training tools</a></p>')}</article>`;
};
const renderAffiliate = (item) =>
  `<article class="article"><span class="eyebrow">${item.category}</span><h1>${item.title}</h1><div class="article-meta">Independent buyer’s guide · Updated 21 September 2026 · 5 min read</div><p class="affiliate-disclosure"><strong>Affiliate disclosure:</strong> As an Amazon Associate, ReflexTester may earn from qualifying purchases made through links on this page, at no additional cost to you.</p><p class="article-deck">${item.description}</p>${section("product-summary", "Product summary", `<div class="affiliate-product"><h3>${item.product}</h3><p>${item.summary}</p><a class="affiliate-button" href="${item.link}" target="_blank" rel="sponsored nofollow noopener">Check the current Amazon UK listing →</a><p><small>Price, seller, availability and listing details can change. Confirm them before ordering.</small></p></div>`)}${section("before-buying", "What to check before buying", list(item.checks))}${section("fit", "Who it may suit", `<p>${item.verdict}</p><p>This page is an editorial overview, not a substitute for the current product label, manufacturer instructions or professional advice.</p>`)}${section("decision", "A sensible buying decision", "<p>Open the current listing, verify the exact product and pack, compare the total delivered price and read recent reviews for recurring issues. Avoid relying on a single rating or promotional claim.</p>")}<div class="affiliate-product"><h2 id="current-listing">Check the current offer</h2><a class="affiliate-button" href="${item.link}" target="_blank" rel="sponsored nofollow noopener">View on Amazon UK →</a></div></article>`;

const articles = [];
for (const item of [...editorialArticles, ...affiliateArticles]) {
  const file = `${item.slug}.html`,
    article = item.link ? renderAffiliate(item) : renderEditorial(item);
  const headings = [
    ...article.matchAll(/<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi),
  ].map((match) => ({
    id: match[1],
    label: match[2].replace(/<[^>]+>/g, "").trim(),
  }));
  const toc = `<aside class="article-aside"><span class="eyebrow">On this page</span><nav>${headings.map((h) => `<a href="#${h.id}">${h.label}</a>`).join("")}</nav></aside>`;
  const path = `blog/${file}`;
  const image = `${SITE_URL}/assets/photos/${/sleep|dehydrat|nap|recovery/i.test(item.slug) ? "sleep-recovery.webp" : /hardware|mouse|gaming|gamer|monitor|vr|aim/i.test(item.slug) ? "aim-hardware.webp" : "reaction-study.webp"}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": item.link ? "Article" : "TechArticle",
    headline: item.title,
    description: item.description,
    image: [image],
    datePublished: UPDATED,
    dateModified: UPDATED,
    inLanguage: "en",
    mainEntityOfPage: `${SITE_URL}/${path}`,
    author: {
      "@type": "Organization",
      name: "ReflexTester Editorial",
      url: `${SITE_URL}/about.html`,
    },
    publisher: {
      "@type": "Organization",
      name: "ReflexTester",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/brand/reflextester-mark.svg`,
      },
    },
  };
  const html = `${head({ title: `${item.title} — ReflexTester`, description: item.description, path, depth: "..", type: "article", image, schema })}<link rel="stylesheet" href="../src/styles/article.css"></head><body data-active="learn"><main id="main" class="article-layout">${article}${toc}</main><script type="module" src="../src/app/static-page.js"></script></body></html>`;
  await writeFile(
    new URL(`../blog/${file}`, import.meta.url),
    html.replace(/[ \t]+$/gm, ""),
  );
  articles.push({ file, title: item.title, description: item.description });
}

const cards = articles
  .map(
    (article) =>
      `<a class="tool-row" href="./blog/${article.file}"><span class="tool-kind">Guide</span><span class="tool-name">${article.title}</span><p>${article.description}</p><span class="tool-arrow">→</span></a>`,
  )
  .join("");
const blogIndex = `${head({ title: "Guides — ReflexTester", description: "Practical guides to reaction time, aim training, cognition and performance.", path: "blog.html" })}<link rel="stylesheet" href="./src/styles/site.css"></head><body data-active="learn"><main id="main"><div class="page"><header class="catalog-head"><div><span class="eyebrow">Learning</span><h1>Understand your performance.</h1><p class="lede">Evidence-aware explanations and practical training guidance.</p></div><label class="field"><span>Search guides</span><input type="search" data-search placeholder="Reaction time, sleep, hardware…"></label></header><div class="tool-list" data-list>${cards}</div></div></main><script type="module" src="./src/app/static-page.js"></script></body></html>`;
await writeFile(new URL("../blog.html", import.meta.url), blogIndex);
const insideCards = articles
  .map(
    (article) =>
      `<a class="tool-row" href="./${article.file}"><span class="tool-kind">Guide</span><span class="tool-name">${article.title}</span><p>${article.description}</p><span class="tool-arrow">→</span></a>`,
  )
  .join("");
const insideIndex = `${head({ title: "Guides — ReflexTester", description: "Practical guides to reaction time, aim training, cognition and performance.", path: "blog/", depth: ".." })}<link rel="stylesheet" href="../src/styles/site.css"></head><body data-active="learn"><main id="main"><div class="page"><header class="catalog-head"><div><span class="eyebrow">Learning</span><h1>Understand your performance.</h1><p class="lede">Evidence-aware explanations and practical training guidance.</p></div><label class="field"><span>Search guides</span><input type="search" data-search placeholder="Reaction time, sleep, hardware…"></label></header><div class="tool-list" data-list>${insideCards}</div></div></main><script type="module" src="../src/app/static-page.js"></script></body></html>`;
await writeFile(new URL("../blog/index.html", import.meta.url), insideIndex);

const indexablePaths = [
  "",
  "tools.html",
  "dashboard.html",
  "blog.html",
  "about.html",
  "editorial-policy.html",
  "contact.html",
  "privacy-policy.html",
  "terms-of-service.html",
  ...tools.map((tool) => `tools/${tool.slug}.html`),
  ...articles.map((article) => `blog/${article.file}`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePaths.map((path) => `  <url><loc>${SITE_URL}/${path}</loc><lastmod>${UPDATED}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(new URL("../sitemap.xml", import.meta.url), sitemap);

const rssItems = articles
  .map(
    (article) =>
      `<item><title>${esc(article.title)}</title><link>${SITE_URL}/blog/${article.file}</link><guid isPermaLink="true">${SITE_URL}/blog/${article.file}</guid><description>${esc(article.description)}</description><pubDate>Mon, 21 Sep 2026 00:00:00 GMT</pubDate></item>`,
  )
  .join("\n");
const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>ReflexTester Guides</title><link>${SITE_URL}/blog.html</link><description>Practical guides to reaction testing, aim training, cognition and performance.</description><language>en</language><lastBuildDate>Mon, 21 Sep 2026 00:00:00 GMT</lastBuildDate><atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>${rssItems}</channel></rss>\n`;
await writeFile(new URL("../feed.xml", import.meta.url), feed);

console.log(
  `Generated ${tools.length} tool routes and rebuilt ${articles.length} original articles.`,
);
