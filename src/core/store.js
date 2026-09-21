const PREFIX = 'rt2:';

function safeRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + key));
    return value ?? fallback;
  } catch { return fallback; }
}

function safeWrite(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export const store = {
  get: safeRead,
  set: safeWrite,
  clear() { Object.keys(localStorage).filter(key => key.startsWith(PREFIX)).forEach(key => localStorage.removeItem(key)); },
  attempts(slug) { const data = safeRead(`attempts:${slug}`, []); return Array.isArray(data) ? data : []; },
  record(slug, result) {
    const attempts = this.attempts(slug);
    attempts.unshift({ ...result, at: new Date().toISOString() });
    safeWrite(`attempts:${slug}`, attempts.slice(0, 100));
    safeWrite('recent', [slug, ...safeRead('recent', []).filter(item => item !== slug)].slice(0, 8));
    return attempts;
  }
};

export function summarize(attempts, field, lowerIsBetter = false) {
  const values = attempts.map(item => Number(item[field])).filter(Number.isFinite);
  if (!values.length) return null;
  return {
    count: values.length,
    latest: values[0],
    best: lowerIsBetter ? Math.min(...values) : Math.max(...values),
    average: values.reduce((sum, value) => sum + value, 0) / values.length
  };
}
