import { readFile, readdir, access } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const ignoredProtocols = /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i;
const errors = [];
let pageCount = 0;
let schemaCount = 0;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      [".git", "node_modules", "dist", "artifacts", "qa-output"].includes(
        entry.name,
      )
    )
      continue;
    const path = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await walk(path) : [path]));
  }
  return files;
}

for (const file of (await walk(root)).filter(
  (path) => extname(path) === ".html",
)) {
  pageCount += 1;
  const html = await readFile(file, "utf8");
  const label = relative(root, file).replaceAll("\\", "/");

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length)
    errors.push(
      `${label}: duplicate ids: ${[...new Set(duplicates)].join(", ")}`,
    );

  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    if (/\bsrc\s*=/i.test(match[1])) continue;
    const source = match[2].trim();
    if (!source) continue;
    if (/type=["']application\/ld\+json/i.test(match[1])) {
      try {
        JSON.parse(source);
        schemaCount += 1;
      } catch (error) {
        errors.push(`${label}: invalid JSON-LD: ${error.message}`);
      }
    } else {
      errors.push(
        `${label}: executable inline script violates the production CSP`,
      );
    }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1].split(/[?#]/)[0];
    if (
      !reference ||
      ignoredProtocols.test(reference) ||
      reference.startsWith("//")
    )
      continue;
    const target = reference.startsWith("/")
      ? join(root, reference)
      : resolve(dirname(file), reference);
    try {
      await access(target);
    } catch {
      errors.push(`${label}: missing local asset ${match[1]}`);
    }
  }
}

if (errors.length) {
  console.error(
    `Site validation failed with ${errors.length} issue(s):\n${errors.map((item) => `- ${item}`).join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `Validated ${pageCount} HTML pages and parsed ${schemaCount} JSON-LD blocks with no executable inline scripts.`,
);
