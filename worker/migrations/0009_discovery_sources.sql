CREATE TABLE discovery_sources (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL UNIQUE,
 link_path TEXT NOT NULL DEFAULT '', keywords TEXT NOT NULL DEFAULT '',
 enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL,
 last_checked_at TEXT, last_count INTEGER NOT NULL DEFAULT 0, last_error TEXT
);
ALTER TABLE discovered_events ADD COLUMN collector_id TEXT;
CREATE INDEX discovered_events_collector ON discovered_events(collector_id);
