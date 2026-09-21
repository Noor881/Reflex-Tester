const getApi = () => process.env.GITHUB_API_URL || "https://api.github.com";
const getRepo = () => process.env.GITHUB_REPO || "";
const getBranch = () => process.env.GITHUB_BRANCH || "main";

const configured = () => Boolean(process.env.GITHUB_TOKEN && getRepo());

const headers = () => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ReflexTester-CMS",
});

const contentUrl = () =>
  `${getApi()}/repos/${getRepo()}/contents/content/articles.json?ref=${encodeURIComponent(getBranch())}`;

const readResponse = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body.message || `GitHub API request failed (${response.status}).`;
    throw new Error(message);
  }
  return body;
};

export const isConfigured = configured;

export const readArticles = async () => {
  if (!configured())
    throw new Error("GitHub content storage is not configured.");
  const response = await fetch(contentUrl(), { headers: headers() });
  const payload = await readResponse(response);
  const encoded = String(payload.content || "").replaceAll("\n", "");
  return {
    data: JSON.parse(Buffer.from(encoded, "base64").toString("utf8")),
    sha: payload.sha,
  };
};

export const writeArticles = async (data, sha, message) => {
  if (!configured())
    throw new Error("GitHub content storage is not configured.");
  const body = {
    message,
    content: Buffer.from(`${JSON.stringify(data, null, 2)}\n`).toString(
      "base64",
    ),
    branch: getBranch(),
  };
  if (sha) body.sha = sha;
  const response = await fetch(contentUrl().split("?")[0], {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readResponse(response);
};
