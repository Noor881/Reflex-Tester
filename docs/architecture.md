# ReflexTester architecture

## System shape

ReflexTester is a generated static application. Source data and interaction engines live under `src/`; `scripts/generate-site.mjs` creates crawlable route entries; `scripts/build-dist.mjs` copies only deployable files into `dist/`.

```text
src/data ──> generator ──> HTML routes ──> validator/tests ──> dist ──> Vercel
    │                         │
    ├── tools registry       ├── app shell and page modules
    └── article registry     └── isolated interaction engines
```

## Boundaries

- `src/data/` is the canonical route and editorial inventory.
- `src/core/` owns defensive local persistence and statistics.
- `src/tools/` contains interaction engines grouped by reaction, cognition, aim, recoil and utility families.
- `src/app/` composes pages and shared navigation without a framework runtime.
- `src/styles/` contains tokens, shared primitives and page-family layouts.
- `scripts/` owns generation, validation, image optimisation and distribution output.
- `tests/` covers registry integrity, generated output, affiliate semantics and representative browser flows.

## Build contract

`npm run build` always runs generation, validation, unit tests and the curated distribution build. Vercel deploys `dist/`, not the repository root. GitHub Actions also verifies formatting, reproducible generation and browser flows.

## URL policy

Every important page has a static HTML entry, canonical URL and crawlable internal link. Existing `.html` URLs remain supported. The corrected `monitor-refresh-rate` route permanently redirects from the historical misspelling.

## Data and privacy

Results and preferences use the `rt2:` local-storage namespace and never contain credentials or account data. Stored values are treated as non-sensitive device-local state. No third-party JavaScript is loaded.

## SEO and AI-search policy

Pages expose unique titles and descriptions, canonical URLs, Open Graph/Twitter metadata, XML sitemap entries, RSS discovery and schema.org JSON-LD that matches visible content. AI-search eligibility relies on the same crawlability and people-first quality requirements as ordinary search; no unsupported “GEO hacks” are used.
