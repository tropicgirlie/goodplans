CREATE TABLE IF NOT EXISTS email_suppressions (email_hash TEXT PRIMARY KEY, reason TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS email_provider_events (id TEXT PRIMARY KEY, provider_id TEXT NOT NULL, kind TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS support_requests (id TEXT PRIMARY KEY, email TEXT NOT NULL, kind TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS service_jobs (name TEXT PRIMARY KEY, status TEXT NOT NULL, updated_at TEXT NOT NULL);
