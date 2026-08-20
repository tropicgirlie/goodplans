-- D1 Migration: Curated Venues Registry

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  sensory_noise TEXT CHECK (sensory_noise IN ('low', 'medium', 'high')),
  mobility_accessible BOOLEAN DEFAULT TRUE,
  age_cohort_appeal TEXT NOT NULL, -- JSON array of strings
  mbti_vibe_tags TEXT NOT NULL      -- JSON array of strings
);

INSERT OR IGNORE INTO venues (id, name, address, city, category, sensory_noise, mobility_accessible, age_cohort_appeal, mbti_vibe_tags) VALUES
  ('venue_clement_pekoe', 'Clement & Pekoe Coffee', 'South William St, Dublin 2', 'Dublin', 'coffee-stroll', 'low', 1, '["20s","30s","40s","50s","60s"]', '["introvert-friendly","cozy","thoughtful"]'),
  ('venue_powerscourt_spa', 'Powerscourt Springs Spa & Thermal Pools', 'Enniskerry, Co. Wicklow', 'Dublin', 'retreat', 'low', 1, '["20s","30s","40s","50s","60s"]', '["introvert-friendly","cozy","calm","restorative"]'),
  ('venue_ranelagh_pottery', 'Ranelagh Clay Sculpting & Wine Studio', 'Ranelagh, Dublin 6', 'Dublin', 'pottery-workshop', 'medium', 1, '["20s","30s","40s"]', '["creative","social","lively"]'),
  ('venue_coppinger_row', 'Coppinger Row natural wine tapas', 'Coppinger Row, Dublin 2', 'Dublin', 'dinner-out', 'medium', 1, '["20s","30s","40s","50s"]', '["lively","social","creative"]'),
  ('venue_clockwork_door', 'The Clockwork Door Board Game Cafe', 'Temple Bar, Dublin 2', 'Dublin', 'board-games', 'medium', 1, '["20s","30s","40s"]', '["introvert-friendly","creative","cozy"]'),
  ('venue_howth_walk', 'Howth Cliff Walk coastal path', 'Howth, Co. Dublin', 'Dublin', 'outdoor-walk', 'low', 0, '["20s","30s","40s","50s"]', '["introvert-friendly","calm","fresh-air"]');
