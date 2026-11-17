/*
# Create transit_alerts table

1. New Tables
- `transit_alerts`
  - `id` (uuid, primary key)
  - `title` (text, short headline of the disruption)
  - `body` (text, longer description with details)
  - `severity` (text, one of: info, warning, critical)
  - `mode` (text, one of: bus, metro, tranvia, general)
  - `lines` (text, comma-separated affected line labels, e.g. "C1,C2" or "L1")
  - `source` (text, origin of the alert: manual, ctan, metro-sevilla, tussam)
  - `source_url` (text, nullable link to the official source)
  - `active` (boolean, whether the alert is currently in effect)
  - `starts_at` (timestamptz, when the alert begins)
  - `ends_at` (timestamptz, nullable, when it is expected to end)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `transit_alerts`. No policies are added: the table is
  deny-by-default at the database level. All access is performed
  server-side through edge functions using the service_role key, which
  bypasses RLS but still requires an explicit GRANT.
- Grant SELECT, INSERT, UPDATE, DELETE on `transit_alerts` to
  `service_role` only. The anon-key frontend never touches this table
  directly; the private admin panel and the chat agent both go through
  authenticated edge functions.

3. Important notes
- Only the admin edge function (with service_role) may create, edit or
  delete alerts. The agent edge function (also service_role) may read
  active alerts to surface them in chat answers.
- An index on `active` + `starts_at` speeds up the common "list active
  alerts ordered by most recent" query used by both functions.
*/

CREATE TABLE IF NOT EXISTS transit_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  mode text NOT NULL DEFAULT 'general' CHECK (mode IN ('bus','metro','tranvia','general')),
  lines text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','ctan','metro-sevilla','tussam')),
  source_url text,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transit_alerts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON transit_alerts TO service_role;

CREATE INDEX IF NOT EXISTS transit_alerts_active_starts_idx
  ON transit_alerts (active, starts_at DESC);
