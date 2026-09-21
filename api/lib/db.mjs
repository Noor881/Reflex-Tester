let sqlClient;

const databaseUrl = () =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

const sql = async () => {
  if (!databaseUrl()) return null;
  if (!sqlClient) {
    const { neon } = await import("@neondatabase/serverless");
    sqlClient = neon(databaseUrl());
  }
  return sqlClient;
};

export const storeEvent = async (event) => {
  const query = await sql();
  if (!query) return false;
  await query`CREATE TABLE IF NOT EXISTS reflex_events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    slug TEXT,
    path TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await query`
    INSERT INTO reflex_events (event_name, slug, path, metadata)
    VALUES (${event.name}, ${event.slug || null}, ${event.path || null}, ${JSON.stringify(event.metadata || {})}::jsonb)
  `;
  return true;
};

export const storeContact = async (message) => {
  const query = await sql();
  if (!query) return false;
  await query`CREATE TABLE IF NOT EXISTS reflex_contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await query`
    INSERT INTO reflex_contacts (name, email, subject, message)
    VALUES (${message.name}, ${message.email}, ${message.subject || null}, ${message.message})
  `;
  return true;
};
