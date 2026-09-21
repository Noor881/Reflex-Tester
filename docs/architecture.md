# ReflexTester architecture

## System shape

ReflexTester is a generated static application. Source data and interaction engines live under `src/`; `scripts/generate-site.mjs` creates crawlable route entries; `scripts/build-dist.mjs` copies only deployable files into `dist/`.

```text
CMS ──> content/articles.json ──> generator ──> HTML routes ──> validator/tests ──> dist ──> Vercel
                                      │
                                      ├── app shell and page modules
                                      └── isolated interaction engines
```

## Boundaries

- `content/articles.json` is the canonical editorial inventory; the local Editorial Studio writes it without requiring source-code edits.
- `src/data/` contains the loaders and canonical tool registry.
- `src/core/` owns defensive local persistence and statistics.
- `src/tools/` contains interaction engines grouped by reaction, cognition, aim, recoil and utility families.
- `src/app/` composes pages and shared navigation without a framework runtime.
- `src/styles/` contains tokens, shared primitives and page-family layouts.
- `scripts/` owns generation, validation, image optimisation and distribution output.
- `admin/` contains the local-only CMS UI; `scripts/cms-server.mjs` binds only to loopback and is not copied into `dist/`.
- `tests/` covers registry integrity, generated output, affiliate semantics and representative browser flows.

## Build contract

`npm run build` always runs generation, validation, unit tests and the curated distribution build. Vercel deploys `dist/`, not the repository root. GitHub Actions also verifies formatting, reproducible generation and browser flows.

## URL policy

Every important page has a static HTML entry, canonical URL and crawlable internal link. Existing `.html` URLs remain supported. The corrected `monitor-refresh-rate` route permanently redirects from the historical misspelling.

## Data and privacy

Results and preferences use the `rt2:` local-storage namespace and never contain credentials or account data. Stored values are treated as non-sensitive device-local state. No third-party JavaScript is loaded.

## SEO and AI-search policy

Pages expose unique titles and descriptions, canonical URLs, Open Graph/Twitter metadata, XML sitemap entries, RSS discovery and schema.org JSON-LD that matches visible content. AI-search eligibility relies on the same crawlability and people-first quality requirements as ordinary search; no unsupported “GEO hacks” are used.
