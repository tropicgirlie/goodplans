ALTER TABLE discovered_events ADD COLUMN themes_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE discovered_events ADD COLUMN match_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE discovered_events ADD COLUMN discovery_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE discovered_events ADD COLUMN review_status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE discovered_events ADD COLUMN first_seen_at TEXT;
UPDATE discovered_events SET first_seen_at=updated_at WHERE first_seen_at IS NULL;
CREATE INDEX discovered_events_review ON discovered_events(review_status, status, starts_at, discovery_score);
