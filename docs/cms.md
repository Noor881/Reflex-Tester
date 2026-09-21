# Editorial Studio

ReflexTester includes an Editorial Studio for creating and updating guides without editing JavaScript. It works locally by default and can also be deployed as a noindex admin UI; all production writes go through the token-protected API.

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

The local server binds to `127.0.0.1` only and accepts Amazon links only over HTTPS from `amzn.to` or Amazon UK hosts. Do not expose the local CMS port to the internet or place credentials in the content file.

## Production backend

The repository also includes Vercel Functions under `api/`:

- `POST /api/articles` validates an article and commits `content/articles.json` through the GitHub Contents API. A connected Vercel project then rebuilds the static site.
- `POST /api/contact` stores messages in Neon when configured and delivers them through a webhook or Resend.
- `POST /api/events` records affiliate clicks and tool events in Neon, or forwards them to an analytics webhook.

Set these Vercel environment variables before using the hosted CMS:

```text
CMS_ADMIN_TOKEN=long-random-secret
GITHUB_TOKEN=server-side-fine-grained-token
GITHUB_REPO=Noor881/Reflex-Tester
GITHUB_BRANCH=main
DATABASE_URL=Neon-connection-string
CONTACT_TO=your-inbox@example.com
RESEND_API_KEY=optional
CONTACT_FROM=ReflexTester <noreply@your-domain.example>
CONTACT_WEBHOOK_URL=optional
ANALYTICS_WEBHOOK_URL=optional
VERCEL_DEPLOY_HOOK_URL=optional
```

Never put `GITHUB_TOKEN`, `CMS_ADMIN_TOKEN`, database credentials or email API keys in browser code. The production admin UI is `noindex`; the API remains locked behind the admin token.
