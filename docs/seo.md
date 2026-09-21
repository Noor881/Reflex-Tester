# SEO and AI-search implementation

- Canonical production origin: `https://reflextester.vercel.app`
- Every indexable route is generated from canonical registries and included in `sitemap.xml` with an accurate modification date.
- `feed.xml` is generated from the same article registry.
- Pages include robots preview controls, canonical URL, Open Graph, Twitter cards and large preview images.
- Homepage uses `Organization` and `WebSite` JSON-LD.
- Tools use `WebApplication` JSON-LD.
- Guides use `TechArticle` or `Article` JSON-LD with publisher, author, image and dates.
- Important content exists in static HTML and is reachable through ordinary anchor links.
- `robots.txt` does not block CSS, JavaScript or images required for rendering.
- WebP editorial images reduce transfer size while preserving the original PNG sources.
- The site does not claim that `llms.txt`, keyword stuffing, invented citations or special “AI schema” improve rankings. Google’s AI search features use ordinary index eligibility and quality systems.

Operational steps that require account ownership remain manual: verify the property in Google Search Console and Bing Webmaster Tools, submit the sitemap, and optionally configure an IndexNow key after the production domain is final.
