-- ============================================
-- SUPABASE TABLES SETUP FOR CÉVENNES CONNECT
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS actors CASCADE;

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('festival', 'marche', 'culture', 'sport', 'atelier', 'theatre')),
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  organizer TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL DEFAULT 43.9339,
  lng DOUBLE PRECISION NOT NULL DEFAULT 3.7086,
  premium_level TEXT NOT NULL DEFAULT 'standard' CHECK (premium_level IN ('standard', 'premium', 'mega-premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_premium ON events(premium_level);
CREATE INDEX idx_events_location ON events USING GIN(to_tsvector('french', location || ' ' || address));
CREATE INDEX idx_events_search ON events USING GIN(to_tsvector('french', title || ' ' || description));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTORS TABLE
-- ============================================

CREATE TABLE actors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('commerce', 'restaurant', 'artisan', 'therapeute', 'service', 'association')),
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  horaires TEXT,
  specialites TEXT[],
  lat DOUBLE PRECISION NOT NULL DEFAULT 43.9339,
  lng DOUBLE PRECISION NOT NULL DEFAULT 3.7086,
  image TEXT NOT NULL DEFAULT '',
  rating DOUBLE PRECISION,
  reviews_count INTEGER DEFAULT 0,
  premium_level TEXT NOT NULL DEFAULT 'standard' CHECK (premium_level IN ('standard', 'premium', 'mega-premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_actors_category ON actors(category);
CREATE INDEX idx_actors_premium ON actors(premium_level);
CREATE INDEX idx_actors_name ON actors(name);
CREATE INDEX idx_actors_search ON actors USING GIN(to_tsvector('french', name || ' ' || description || ' ' || address));

-- Updated_at trigger
CREATE TRIGGER update_actors_updated_at
  BEFORE UPDATE ON actors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE actors ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can read)
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Actors are viewable by everyone"
  ON actors FOR SELECT
  USING (true);

-- Admin write access (only with service role key)
CREATE POLICY "Events are modifiable by service role"
  ON events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Actors are modifiable by service role"
  ON actors FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE events IS 'Événements locaux dans les Cévennes';
COMMENT ON TABLE actors IS 'Acteurs locaux (commerces, services, associations)';
COMMENT ON COLUMN events.premium_level IS 'Niveau de mise en avant : standard, premium, mega-premium';
COMMENT ON COLUMN actors.premium_level IS 'Niveau de mise en avant : standard, premium, mega-premium';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Tables created successfully!';
  RAISE NOTICE 'Next step: Run the migration script to import data from JSON files';
END $$;
