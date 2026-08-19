INSERT OR IGNORE INTO users (id, email, display_name) VALUES
  ('user_tessa', 'tessa@example.com', 'Tessa');

INSERT OR IGNORE INTO organisations (id, name, owner_user_id) VALUES
  ('org_women_in_tech', 'Women in Tech', 'user_tessa');

INSERT OR IGNORE INTO event_templates (id, organisation_id, name, format, audience_tone, mood, age_range, palette_json, art_direction, prompt_template) VALUES
  ('template_brunch', 'org_women_in_tech', 'Sunday Brunch', 'brunch', 'women in tech', 'thoughtful and warm', '25-55', '["terracotta","butter","dusty violet","ink"]', 'Refined editorial paper collage with a long-table conversation, city details, flowers and spacious layered paper.', 'Original editorial paper collage for {title}. Audience tone: {audience_tone}. Mood: {mood}. Avoid text, logos and stereotypes.'),
  ('template_gallery', 'org_women_in_tech', 'Gallery Late', 'gallery late', 'mixed friends', 'curious and lively', NULL, '["cobalt","coral","pink","ink"]', 'Dense city-night collage with a gallery, cinema curtain and ticket-like paper shapes.', 'Original collage cover for {title}. Mood: {mood}.'),
  ('template_retreat', 'org_women_in_tech', 'Small Retreat', 'retreat', 'familiar friends', 'calm and restorative', NULL, '["butter","violet","forest","ink"]', 'Quiet cut-paper travel collage with generous breathing room.', 'Original collage cover for {title}. Mood: {mood}.');

INSERT OR IGNORE INTO event_series (id, organisation_id, name, city, cadence, default_template_id) VALUES
  ('series_wit_brunch', 'org_women_in_tech', 'Women in Tech Brunch', 'Dublin', 'Once a month', 'template_brunch');

INSERT OR IGNORE INTO events (id, organisation_id, series_id, template_id, host_user_id, slug, title, description, starts_at, ends_at, timezone, venue_name, venue_address, city, capacity, visibility, status, cover_key) VALUES
  ('event_wit_brunch_oct', 'org_women_in_tech', 'series_wit_brunch', 'template_brunch', 'user_tessa', 'women-in-tech-brunch-october', 'Women in Tech Brunch', 'A low-pressure table for women working in and around technology.', '2026-10-19T14:00:00+01:00', '2026-10-19T18:00:00+01:00', 'Europe/Dublin', 'Dublin brunch venue', 'Dublin', 'Dublin', 24, 'invite', 'published', 'covers/women-in-tech-brunch.png');
