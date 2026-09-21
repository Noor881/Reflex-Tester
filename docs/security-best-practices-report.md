# Security hardening report

## Executive summary

ReflexTester is a static, account-free frontend with a small attack surface. This pass removed executable inline scripts, tightened the production Content Security Policy, limited deployed files to `dist/`, retained same-origin-only application code and kept local storage free of secrets.

## Resolved findings

### SEC-01 — Executable inline scripts weakened CSP

- Severity: Medium
- Location: generated root and article pages; `vercel.json`
- Resolution: page bootstrapping moved to `src/app/static-page.js`; `script-src` is now `'self'` without `'unsafe-inline'`.

### SEC-02 — Repository internals were inside the deployment root

- Severity: Medium
- Location: previous Vercel `outputDirectory: "."`
- Resolution: a curated distribution builder now publishes only runtime pages, modules, styles, manifests and assets to `dist/`.

### SEC-03 — Legacy response header and incomplete CSP directives

- Severity: Low
- Location: `vercel.json`
- Resolution: obsolete `X-XSS-Protection` was removed. CSP now defines `base-uri`, `object-src`, `form-action`, `manifest-src`, `worker-src` and HTTPS upgrading.

## Residual notes

- UI templates use `innerHTML` with repository-controlled constants and numeric/local tool state. Do not insert URL, network or user-authored HTML into these templates without sanitisation or safe DOM construction.
- `style-src 'unsafe-inline'` remains because existing components use inline style properties. This permits CSS injection if an untrusted style source is introduced, but does not permit inline JavaScript.
- Local storage contains non-sensitive game results only. Authentication tokens or personal secrets must never be added there.
