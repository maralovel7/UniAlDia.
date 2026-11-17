/*
# Create knowledge_entries table

1. New Tables
- `knowledge_entries`
  - `id` (uuid, primary key)
  - `title` (text, not null) — título descriptivo, ej. "Horarios línea 27 Metrocentro"
  - `content` (text, not null) — el contenido completo en texto (horarios, requisitos, etc.)
  - `category` (text, not null) — categoría: Transporte, Vivienda, Becas, Universidad, Ocio, Empleo, General
  - `url` (text, nullable) — enlace externo donde ver más información
  - `file_url` (text, nullable) — enlace a un PDF o imagen con la información
  - `keywords` (text, nullable) — palabras clave adicionales para facilitar búsquedas
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- App sin login (single-tenant). RLS activada.
- Grants CRUD a anon + authenticated para que el frontend y la edge function puedan operar.
- Policies permissive (true) porque los datos son intencionalmente públicos/compartidos.
*/

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  url text,
  file_url text,
  keywords text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_entries TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_knowledge" ON knowledge_entries;
CREATE POLICY "anon_select_knowledge"
  ON knowledge_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_knowledge" ON knowledge_entries;
CREATE POLICY "anon_insert_knowledge"
  ON knowledge_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_knowledge" ON knowledge_entries;
CREATE POLICY "anon_update_knowledge"
  ON knowledge_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_knowledge" ON knowledge_entries;
CREATE POLICY "anon_delete_knowledge"
  ON knowledge_entries FOR DELETE
  TO anon, authenticated USING (true);
