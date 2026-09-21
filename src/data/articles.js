import { readFileSync } from "node:fs";

const content = JSON.parse(
  readFileSync(new URL("../../content/articles.json", import.meta.url), "utf8"),
);

export const allArticles = content.articles;
export const articles = allArticles.filter(
  (article) =>
    article.type === "editorial" &&
    article.status !== "draft" &&
    article.status !== "archived",
);
export const affiliateArticles = allArticles.filter(
  (article) =>
    article.type === "affiliate" &&
    article.status !== "draft" &&
    article.status !== "archived",
);
