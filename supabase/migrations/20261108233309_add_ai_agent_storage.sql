/*
# Add secure storage for the UniAlDía AI agent

## Purpose
Adds durable records for the public assistant and private administration without deleting existing knowledge.

## New tables
- `chat_sessions`: hashed opaque browser sessions with timestamps and expiry.
- `chat_messages`: user and assistant messages linked to a session.
- `agent_settings`: editable server-side system prompt and version.
- `ai_documents`: PDF/DOCX metadata and processing status.
- `ai_document_chunks`: extracted fragments with source page and optional vector embedding.

## Security
- RLS is enabled on every new table.
- Private AI tables are reachable only by the server's service role.
- Existing `knowledge_entries` remains public for reading, but direct client writes are removed.
- A private storage bucket restricts documents to PDF/DOCX and 10 MB.

## Important notes
1. Conversations are isolated by an opaque session token whose hash is stored server-side.
2. Nullable embeddings allow text retrieval when no embedding provider is configured.
3. The settings row is initialized with the current assistant's basic prompt.
*/

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (char_length(content) <= 30000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  system_prompt text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  mime_type text NOT NULL CHECK (mime_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  file_size bigint NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0),
  content text NOT NULL,
  source_page integer,
  embedding vector(1536),
  search_document tsvector GENERATED ALWAYS AS (to_tsvector('spanish', content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS ai_document_chunks_search_idx ON ai_document_chunks USING gin(search_document);
CREATE INDEX IF NOT EXISTS ai_document_chunks_embedding_idx ON ai_document_chunks USING hnsw (embedding vector_cosine_ops);

INSERT INTO agent_settings (id, system_prompt)
VALUES (true, 'Eres UniAlDía, un asistente útil que informa sobre actualidad en Sevilla, la universidad, la vivienda, el empleo, las becas y el ocio. Responde en español, con claridad y sin inventar datos. Usa el contexto recuperado y cita las fuentes disponibles.')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_document_chunks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON chat_sessions, chat_messages, agent_settings, ai_documents, ai_document_chunks FROM PUBLIC, anon, authenticated;
GRANT ALL ON chat_sessions, chat_messages, agent_settings, ai_documents, ai_document_chunks TO service_role;

REVOKE INSERT, UPDATE, DELETE ON knowledge_entries FROM anon, authenticated;
DROP POLICY IF EXISTS "anon_insert_knowledge" ON knowledge_entries;
DROP POLICY IF EXISTS "anon_update_knowledge" ON knowledge_entries;
DROP POLICY IF EXISTS "anon_delete_knowledge" ON knowledge_entries;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ai-documents', 'ai-documents', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON storage.objects FROM anon, authenticated;
