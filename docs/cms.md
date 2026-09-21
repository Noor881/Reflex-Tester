# Editorial Studio

ReflexTester includes a local-only editorial CMS for creating and updating guides without editing JavaScript. It is intentionally excluded from `dist/`; it never exposes a write API on the public website.

## Start the CMS

From the repository root:

```bash
npm run cms
```

Open [http://127.0.0.1:4174/admin/](http://127.0.0.1:4174/admin/).

The editor writes articles to `content/articles.json`. It supports editorial and affiliate guides, draft/published/archived status, clean slugs, SEO title and description fields, focus keywords, hero image selection, Markdown-style article bodies, affiliate disclosures and a live SEO checklist.

## Publishing workflow

1. Create a draft and complete the SEO inspector.
2. Preview the route and click **Publish & generate**.
3. Click **Build site** and wait for validation, tests and the curated `dist/` build to pass.
4. Review the generated page, then commit and push `content/articles.json` plus generated output.

Draft and archived entries are excluded from public article routes, sitemap and RSS. Changing a slug should be treated as a URL change; add a redirect when an established article is renamed.

The server binds to `127.0.0.1` only and accepts Amazon links only over HTTPS from `amzn.to` or Amazon UK hosts. Do not expose the CMS port to the internet or place credentials in the content file.
