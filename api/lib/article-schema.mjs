import { cleanText } from "./http.mjs";

export const allowedImages = new Set([
  "aim-hardware.webp",
  "performance-workspace.webp",
  "reaction-study.webp",
  "sleep-recovery.webp",
]);

const cleanList = (value, maxItems = 20) =>
  (Array.isArray(value) ? value : String(value ?? "").split("\n"))
    .map((item) => cleanText(item, 500))
    .filter(Boolean)
    .slice(0, maxItems);

const validDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

const validAffiliateUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["amzn.to", "amazon.co.uk", "www.amazon.co.uk"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

export const normalizeArticle = (input) => {
  const type = input.type === "affiliate" ? "affiliate" : "editorial";
  const status = ["draft", "published", "archived"].includes(input.status)
    ? input.status
    : "draft";
  const title = cleanText(input.title, 140);
  const slug = cleanText(input.slug, 90).toLowerCase();
  const description = cleanText(input.description, 180);
  const today = new Date().toISOString().slice(0, 10);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(
      "Slug must use lowercase letters, numbers and hyphens only.",
    );
  if (title.length < 8) throw new Error("Title must be at least 8 characters.");
  if (description.length < 50)
    throw new Error("SEO description must be at least 50 characters.");
  const updatedAt = validDate(input.updatedAt) ? input.updatedAt : today;
  const publishedAt = validDate(input.publishedAt)
    ? input.publishedAt
    : updatedAt;
  const article = {
    slug,
    title,
    description,
    category: cleanText(input.category || "Guides", 60),
    type,
    status,
    publishedAt,
    updatedAt,
    author: cleanText(input.author || "ReflexTester Editorial", 80),
    heroImage: allowedImages.has(input.heroImage)
      ? input.heroImage
      : "reaction-study.webp",
    focusKeyword: cleanText(input.focusKeyword, 80),
    seoTitle: cleanText(input.seoTitle, 70),
    seoDescription: cleanText(input.seoDescription, 180),
    intro: cleanText(input.intro, 600),
    body: cleanText(input.body, 30000),
    focus: cleanList(input.focus),
    actions: cleanList(input.actions),
    faq: [],
  };
  if (type === "affiliate") {
    article.product = cleanText(input.product, 180);
    article.link = cleanText(input.link, 500);
    article.summary = cleanText(input.summary, 1000);
    article.checks = cleanList(input.checks);
    article.verdict = cleanText(input.verdict, 1000);
    if (!article.product || !validAffiliateUrl(article.link))
      throw new Error(
        "Affiliate articles need a valid HTTPS Amazon UK/amzn.to link and product name.",
      );
  }
  return article;
};

export const isPublished = (article) =>
  article.status !== "draft" && article.status !== "archived";
