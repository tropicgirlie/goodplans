CREATE TABLE discovered_events (
 id TEXT PRIMARY KEY, source TEXT NOT NULL, source_id TEXT NOT NULL,
 title TEXT NOT NULL, starts_at TEXT NOT NULL, ends_at TEXT, venue TEXT NOT NULL,
 category TEXT NOT NULL, price TEXT NOT NULL, url TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active', updated_at TEXT NOT NULL,
 UNIQUE(source, source_id)
);
CREATE INDEX discovered_events_dates ON discovered_events(status, starts_at);
CREATE TABLE newsletter_subscribers (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'pending',
 interests_json TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, confirm_expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL, confirmed_at TEXT, consent_version TEXT NOT NULL
);
CREATE TABLE newsletter_issues (
 id TEXT PRIMARY KEY, week TEXT NOT NULL UNIQUE, subject TEXT NOT NULL, intro TEXT NOT NULL,
 events_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', revision INTEGER NOT NULL DEFAULT 1,
 origin TEXT NOT NULL, created_at TEXT NOT NULL, approved_at TEXT, approved_by TEXT
);
CREATE TABLE newsletter_deliveries (
 id TEXT PRIMARY KEY, issue_id TEXT NOT NULL REFERENCES newsletter_issues(id),
 subscriber_id TEXT NOT NULL REFERENCES newsletter_subscribers(id),
 recipient TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued',
 attempts INTEGER NOT NULL DEFAULT 0, error TEXT, provider_id TEXT, sent_at TEXT,
 UNIQUE(issue_id, subscriber_id)
);
CREATE INDEX newsletter_delivery_queue ON newsletter_deliveries(status);
CREATE TABLE discovery_runs (
 key TEXT PRIMARY KEY, status TEXT NOT NULL, started_at TEXT NOT NULL,
 finished_at TEXT, error TEXT, count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE newsletter_tokens (token_hash TEXT PRIMARY KEY, subscriber_id TEXT NOT NULL REFERENCES newsletter_subscribers(id), created_at TEXT NOT NULL);
