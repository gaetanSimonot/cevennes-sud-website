-- Table pour les configurations de scraping automatique
CREATE TABLE IF NOT EXISTS scraping_configs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les résultats de scraping en attente de validation
CREATE TABLE IF NOT EXISTS scraped_events_pending (
  id SERIAL PRIMARY KEY,
  scraping_config_id INTEGER REFERENCES scraping_configs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'culture',
  description TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  address TEXT,
  price TEXT,
  organizer TEXT,
  contact TEXT,
  website TEXT,
  image TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  validated BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of INTEGER REFERENCES events(id),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_scraping_configs_active ON scraping_configs(active);
CREATE INDEX IF NOT EXISTS idx_scraping_configs_next_run ON scraping_configs(next_run_at);
CREATE INDEX IF NOT EXISTS idx_scraped_events_pending_validated ON scraped_events_pending(validated);
CREATE INDEX IF NOT EXISTS idx_scraped_events_pending_config ON scraped_events_pending(scraping_config_id);

-- Function pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scraping_configs_updated_at BEFORE UPDATE ON scraping_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE scraping_configs IS 'Configurations pour le scraping automatique d''agendas externes';
COMMENT ON TABLE scraped_events_pending IS 'Événements scrapés en attente de validation admin';
