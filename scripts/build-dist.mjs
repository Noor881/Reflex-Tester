import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const files = [
  "404.html",
  "500.html",
  "admin",
  "about.html",
  "ads.txt",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "blog",
  "blog.html",
  "contact.html",
  "dashboard.html",
  "editorial-policy.html",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon.ico",
  "feed.xml",
  "index.html",
  "manifest.json",
  "privacy-policy.html",
  "robots.txt",
  "sitemap.xml",
  "sw.js",
  "terms-of-service.html",
  "tools",
  "tools.html",
  "src",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files)
  await cp(resolve(root, file), resolve(output, file), { recursive: true });
await cp(resolve(root, "assets/brand"), resolve(output, "assets/brand"), {
  recursive: true,
});
await cp(resolve(root, "assets/game"), resolve(output, "assets/game"), {
  recursive: true,
});
await mkdir(resolve(output, "assets/photos"), { recursive: true });
for (const photo of [
  "aim-hardware.webp",
  "performance-workspace.webp",
  "reaction-study.webp",
  "sleep-recovery.webp",
]) {
  await cp(
    resolve(root, `assets/photos/${photo}`),
    resolve(output, `assets/photos/${photo}`),
  );
}
console.log(`Built curated static output in ${output}`);
