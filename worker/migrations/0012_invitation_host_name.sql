-- An explicit public invitation name, separate from account/email and guest identity.
ALTER TABLE events ADD COLUMN host_name TEXT;
