PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organisations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_series (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id),
  name TEXT NOT NULL,
  city TEXT,
  cadence TEXT,
  default_template_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_templates (
  id TEXT PRIMARY KEY,
  organisation_id TEXT REFERENCES organisations(id),
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  audience_tone TEXT NOT NULL,
  mood TEXT NOT NULL,
  age_range TEXT,
  palette_json TEXT NOT NULL DEFAULT '[]',
  art_direction TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  organisation_id TEXT REFERENCES organisations(id),
  series_id TEXT REFERENCES event_series(id),
  template_id TEXT REFERENCES event_templates(id),
  host_user_id TEXT NOT NULL REFERENCES users(id),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  venue_place_id TEXT,
  city TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  visibility TEXT NOT NULL DEFAULT 'invite' CHECK (visibility IN ('draft', 'invite', 'public')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  cover_key TEXT,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_email TEXT,
  guest_name TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guest_sessions (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  invitation_id TEXT NOT NULL UNIQUE REFERENCES invitations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'maybe', 'declined', 'waitlisted')),
  responded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_changes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL REFERENCES users(id),
  changed_fields_json TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_artwork (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES event_templates(id),
  status TEXT NOT NULL CHECK (status IN ('queued', 'ready_for_approval', 'approved', 'rejected', 'failed')),
  r2_key TEXT,
  prompt_snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT
);

CREATE TABLE IF NOT EXISTS event_sources (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  host_user_id TEXT NOT NULL REFERENCES users(id),
  source_url TEXT NOT NULL,
  source_host TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'ready_for_review', 'failed', 'confirmed')),
  snapshot_json TEXT,
  draft_json TEXT,
  confidence_json TEXT,
  confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  invitation_id TEXT REFERENCES invitations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS calendar_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'connected', 'revoked')),
  encrypted_refresh_token TEXT,
  external_calendar_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS invitations_event_id_idx ON invitations(event_id);
CREATE INDEX IF NOT EXISTS rsvps_event_status_idx ON rsvps(event_id, status);
CREATE INDEX IF NOT EXISTS event_changes_event_id_idx ON event_changes(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS guest_sessions_invitation_id_idx ON guest_sessions(invitation_id);
CREATE INDEX IF NOT EXISTS event_sources_host_id_idx ON event_sources(host_user_id, created_at DESC);
