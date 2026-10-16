ALTER TABLE events ADD COLUMN booking_url TEXT;
ALTER TABLE events ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'own' CHECK (plan_type IN ('own','attend'));
