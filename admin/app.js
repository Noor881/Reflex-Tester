const $ = (selector) => document.querySelector(selector);
const form = $("[data-form]");
const list = $("[data-article-list]");
const toast = $("[data-toast]");
const field = (name) => form.elements.namedItem(name);
const state = { data: null, current: null, slugTouched: false };
const token = () => sessionStorage.getItem("reflex-cms-token") || "";
const apiFetch = (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (token()) headers.set("Authorization", `Bearer ${token()}`);
  return fetch(url, { ...options, headers });
};

const emptyArticle = () => ({
  type: "editorial",
  status: "draft",
  title: "",
  slug: "",
  category: "Training",
  focusKeyword: "",
  heroImage: "reaction-study.webp",
  seoTitle: "",
  seoDescription: "",
  description: "",
  intro: "",
  focus: [],
  actions: [],
  body: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString().slice(0, 10),
  author: "ReflexTester Editorial",
  product: "",
  link: "",
  summary: "",
  checks: [],
  verdict: "",
});

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

const showToast = (message, error = false) => {
  toast.textContent = message;
  toast.classList.toggle("error", error);
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(
    () => toast.classList.remove("is-visible"),
    4200,
  );
};

const lines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const formatStatus = (status) => status || "draft";

const setValue = (name, value) => {
  const control = field(name);
  if (control)
    control.value = Array.isArray(value) ? value.join("\n") : value || "";
};

const setForm = (article) => {
  state.current = article;
  state.slugTouched = Boolean(article.slug);
  for (const name of [
    "originalSlug",
    "title",
    "type",
    "status",
    "slug",
    "category",
    "focusKeyword",
    "heroImage",
    "seoTitle",
    "seoDescription",
    "description",
    "intro",
    "focus",
    "actions",
    "body",
    "publishedAt",
    "updatedAt",
    "author",
    "product",
    "link",
    "summary",
    "checks",
    "verdict",
  ]) {
    const source =
      name === "originalSlug"
        ? article.slug
        : name === "seoDescription"
          ? article.seoDescription || article.description
          : article[name];
    setValue(name, source);
  }
  $("[data-editor-state]").textContent =
    article.status === "published" ? "Published guide" : "Draft guide";
  $("[data-editor-title]").textContent = article.title || "Untitled guide";
  updateAffiliateFields();
  updateAll();
};

const getForm = () => ({
  originalSlug: field("originalSlug").value,
  title: field("title").value.trim(),
  type: field("type").value,
  status: field("status").value,
  slug: field("slug").value.trim(),
  category: field("category").value.trim(),
  focusKeyword: field("focusKeyword").value.trim(),
  heroImage: field("heroImage").value,
  seoTitle: field("seoTitle").value.trim(),
  seoDescription: field("seoDescription").value.trim(),
  description: field("seoDescription").value.trim(),
  intro: field("intro").value.trim(),
  focus: lines(field("focus").value),
  actions: lines(field("actions").value),
  body: field("body").value.trim(),
  publishedAt: field("publishedAt").value,
  updatedAt: field("updatedAt").value,
  author: field("author").value.trim(),
  product: field("product").value.trim(),
  link: field("link").value.trim(),
  summary: field("summary").value.trim(),
  checks: lines(field("checks").value),
  verdict: field("verdict").value.trim(),
});

const updateAffiliateFields = () => {
  const affiliate = field("type").value === "affiliate";
  $("[data-affiliate-fields]").hidden = !affiliate;
  for (const control of $("[data-affiliate-fields]").querySelectorAll(
    "input, textarea",
  ))
    control.disabled = !affiliate;
};

const updateList = () => {
  list.replaceChildren();
  const query = $("[data-search]").value.toLowerCase().trim();
  const items = (state.data?.articles || [])
    .filter((article) =>
      `${article.title} ${article.slug}`.toLowerCase().includes(query),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No matching guides.";
    list.append(empty);
    return;
  }
  for (const article of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "article-item";
    if (state.current?.slug === article.slug) button.classList.add("is-active");
    const title = document.createElement("strong");
    title.textContent = article.title;
    const meta = document.createElement("small");
    meta.textContent = `${article.type === "affiliate" ? "Affiliate" : "Editorial"} · ${article.slug}`;
    const status = document.createElement("span");
    status.className = `status ${formatStatus(article.status)}`;
    status.textContent = formatStatus(article.status);
    button.append(title, meta, status);
    button.addEventListener("click", () => setForm(article));
    list.append(button);
  }
};

const updateSeo = () => {
  const article = getForm();
  const title = article.title;
  const description = article.seoDescription || article.description;
  const keyword = article.focusKeyword.toLowerCase();
  const bodyLength =
    article.body.length +
    article.focus.join(" ").length +
    article.actions.join(" ").length;
  const checks = [
    [
      title.length >= 30 && title.length <= 65,
      "Title is between 30 and 65 characters",
    ],
    [
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug),
      "Slug is clean and URL-safe",
    ],
    [
      description.length >= 50 && description.length <= 180,
      "Meta description is 50–180 characters",
    ],
    [
      !keyword ||
        `${title} ${description} ${article.slug}`
          .toLowerCase()
          .includes(keyword),
      "Focus keyword appears naturally",
    ],
    [article.focus.length >= 3, "At least three key ideas are supplied"],
    [bodyLength >= 450, "Article has enough useful substance"],
    [Boolean(article.heroImage), "Hero image is selected"],
    [
      article.type !== "affiliate" ||
        (Boolean(article.product) && /^https:\/\//.test(article.link)),
      "Affiliate fields are complete",
    ],
    [Boolean(article.category), "Category is set"],
    [article.status === "published", "Ready to publish"],
  ];
  const passed = checks.filter(([ok]) => ok).length;
  const score = passed * 10;
  $("[data-score]").textContent = `${score} / 100`;
  const ring = $("[data-score-ring]");
  ring.textContent = score;
  ring.classList.toggle("good", score >= 80);
  ring.classList.toggle("warn", score < 80);
  const checklist = $("[data-checklist]");
  checklist.replaceChildren();
  for (const [ok, label] of checks) {
    const item = document.createElement("li");
    item.className = ok ? "pass" : "";
    item.textContent = label;
    checklist.append(item);
  }
  $("[data-preview-title]").textContent = title || "Your guide title";
  $("[data-preview-description]").textContent =
    description || "Your meta description will appear here.";
  $("[data-preview-url]").textContent =
    `reflextester.vercel.app/blog/${article.slug || "your-slug"}`;
  $("[data-title-count]").textContent = `${title.length} / 140`;
  $("[data-seo-title-count]").textContent = `${article.seoTitle.length} / 70`;
  $("[data-seo-description-count]").textContent = `${description.length} / 180`;
  $("[data-editor-title]").textContent = title || "Untitled guide";
};

const updateAll = () => {
  updateAffiliateFields();
  updateSeo();
  updateList();
};

const save = async (publish = false) => {
  if (publish) field("status").value = "published";
  updateAll();
  if (!form.reportValidity()) {
    showToast("Complete the required fields first.", true);
    return;
  }
  const article = getForm();
  try {
    showToast("Saving and regenerating pages…");
    const response = await apiFetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save guide.");
    state.data.articles = state.data.articles.filter(
      (item) => item.slug !== article.originalSlug,
    );
    state.data.articles.push(result.article);
    setForm(result.article);
    showToast(
      publish
        ? result.deployment || "Published successfully."
        : result.deployment || "Draft saved successfully.",
    );
  } catch (error) {
    showToast(error.message, true);
  }
};

const build = async () => {
  try {
    showToast("Running the full production build…");
    const response = await apiFetch("/api/build", { method: "POST" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Build failed.");
    showToast("Production build passed. You can commit and deploy.");
  } catch (error) {
    showToast(error.message, true);
  }
};

const load = async () => {
  try {
    const response = await apiFetch("/api/articles");
    if (response.status === 401)
      throw new Error(
        "Enter the production CMS admin token, then click Connect.",
      );
    state.data = await response.json();
    setForm(emptyArticle());
    updateList();
  } catch (error) {
    showToast(`Start the CMS with npm run cms. ${error.message}`, true);
  }
};

$("[data-auth-form]").addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = $("[data-token]").value.trim();
  if (value) sessionStorage.setItem("reflex-cms-token", value);
  else sessionStorage.removeItem("reflex-cms-token");
  await load();
});
$("[data-new]").addEventListener("click", () => {
  setForm(emptyArticle());
  updateList();
  field("title").focus();
});
$("[data-search]").addEventListener("input", updateList);
$("[data-save]").addEventListener("click", () => save(false));
$("[data-publish]").addEventListener("click", () => save(true));
$("[data-build]").addEventListener("click", build);
$("[data-preview]").addEventListener("click", () => {
  const slug = field("slug").value.trim();
  if (!slug) return showToast("Add a slug before opening preview.", true);
  window.open(`../blog/${slug}.html`, "_blank", "noopener");
});
form.addEventListener("input", () => {
  if (document.activeElement === field("slug")) state.slugTouched = true;
  if (document.activeElement === field("title") && !state.slugTouched)
    field("slug").value = slugify(field("title").value);
  updateAll();
});
field("type").addEventListener("change", updateAll);

load();
