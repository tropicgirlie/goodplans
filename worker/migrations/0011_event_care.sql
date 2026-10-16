ALTER TABLE discovered_events ADD COLUMN children_welcome TEXT NOT NULL DEFAULT 'unknown' CHECK(children_welcome IN ('unknown','yes','no'));
ALTER TABLE discovered_events ADD COLUMN childcare TEXT NOT NULL DEFAULT 'unknown' CHECK(childcare IN ('unknown','provided','not-provided'));
ALTER TABLE discovered_events ADD COLUMN care_url TEXT;
