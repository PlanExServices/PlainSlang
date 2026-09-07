-- PlainSlang schema for Supabase.
-- Run once in the Supabase dashboard → SQL Editor, BEFORE scripts/seed-supabase.mjs.

CREATE TABLE IF NOT EXISTS terms (
  id                 SERIAL PRIMARY KEY,
  term               TEXT NOT NULL,
  emoji              TEXT DEFAULT '',
  definition         TEXT NOT NULL,
  example            TEXT,
  notes              TEXT,
  age_group          TEXT NOT NULL,
  difficulty         TEXT NOT NULL DEFAULT 'medium',
  say                TEXT,
  source_name        TEXT,
  source_url         TEXT,
  tags               TEXT DEFAULT '[]',
  is_woty            INTEGER DEFAULT 0,
  trending           INTEGER DEFAULT 0,
  trending_evidence  TEXT,
  is_seed            INTEGER DEFAULT 0,
  category           TEXT NOT NULL DEFAULT 'teen',
  related            TEXT NOT NULL DEFAULT '[]',
  created_at         TEXT,
  updated_at         TEXT
);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_terms_category   ON terms (category);
CREATE INDEX IF NOT EXISTS idx_terms_trending   ON terms (trending);
CREATE INDEX IF NOT EXISTS idx_terms_term_lower ON terms (LOWER(term));

-- Row Level Security: the anon (public) key may only READ.
-- All writes go through the app's service-role key, which bypasses RLS.
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read terms" ON terms;
CREATE POLICY "public read terms" ON terms FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read meta" ON meta;
CREATE POLICY "public read meta" ON meta FOR SELECT USING (true);

-- Realtime: broadcast every change on both tables to subscribed browsers.
ALTER PUBLICATION supabase_realtime ADD TABLE terms;
ALTER PUBLICATION supabase_realtime ADD TABLE meta;

-- Full row data in change events (so deletes carry ids)
ALTER TABLE terms REPLICA IDENTITY FULL;
ALTER TABLE meta  REPLICA IDENTITY FULL;
