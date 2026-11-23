/*
# Create web_updates table (internet-sourced live updates)

1. New Tables
- `web_updates`: news items found by searching the internet (Tavily), shown on the homepage "Última hora" section.
  - `id` (uuid, primary key)
  - `title` (text, not null): headline of the found article.
  - `summary` (text): short excerpt of the source content.
  - `url` (text, unique, not null): link to the source; unique so the same article is stored once.
  - `source_name` (text): website domain for display.
  - `category` (text): topic tag for display.
  - `query` (text): the search that found it (for the team's context).
  - `found_at` (timestamptz, default now()): when it was last seen.
- `web_updates_meta`: single-row table storing the last refresh timestamp so refreshes are rate-limited with durable state (edge function instances share no memory).
  - `id` (boolean, primary key, default true)
  - `last_refresh_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Grant SELECT on `web_updates` to `anon` and `authenticated` (public homepage data, no sign-in app).
- Policy: public read of web updates (USING (true) — intentionally shared/public data).
- Grant INSERT/UPDATE on both tables to `service_role` only (edge functions write; visitors cannot write).
- No grants on `web_updates_meta` to anon/authenticated: it is internal state.
*/

CREATE TABLE IF NOT EXISTS web_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  url text UNIQUE NOT NULL,
  source_name text,
  category text,
  query text,
  found_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_web_updates_found_at ON web_updates (found_at DESC);

CREATE TABLE IF NOT EXISTS web_updates_meta (
  id boolean PRIMARY KEY DEFAULT true,
  last_refresh_at timestamptz
);

INSERT INTO web_updates_meta (id, last_refresh_at) VALUES (true, now()) ON CONFLICT (id) DO NOTHING;

ALTER TABLE web_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_updates_meta ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON web_updates TO anon, authenticated;
GRANT INSERT, UPDATE ON web_updates TO service_role;
GRANT SELECT, UPDATE ON web_updates_meta TO service_role;

DROP POLICY IF EXISTS "Public can read web updates" ON web_updates;
CREATE POLICY "Public can read web updates" ON web_updates
FOR SELECT TO anon, authenticated USING (true);
