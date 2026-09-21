export const methodNotAllowed = (res, methods) => {
  res.setHeader("Allow", methods.join(", "));
  return sendJson(res, 405, { error: "Method not allowed." });
};

export const sendJson = (res, status, payload, headers = {}) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, value] of Object.entries(headers))
    res.setHeader(name, value);
  res.end(JSON.stringify(payload));
};

export const readJson = (req, maxBytes = 1024 * 1024) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });

export const cleanText = (value, max = 10000) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);

export const getBearer = (req) => {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
};

export const sameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin || !req.headers.host) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
};

export const requireAdmin = (req, res) => {
  const expected = process.env.CMS_ADMIN_TOKEN;
  if (!expected) return true;
  if (getBearer(req) === expected) return true;
  sendJson(res, 401, {
    error: "CMS authentication required. Set the admin token first.",
  });
  return false;
};

export const escapeHtml = (value) =>
  cleanText(value, 10000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
