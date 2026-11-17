/*
# Add private document retrieval function

## Purpose
Provides the server-only text retrieval endpoint used by the AI agent for uploaded PDF and DOCX fragments.

## Function
- `search_document_chunks(search_query text, max_rows integer)` searches processed document chunks with Spanish full-text ranking and returns source filenames and pages.

## Security
- The function runs with a fixed public search path.
- Execute is revoked from PUBLIC, anon and authenticated; only the Edge Function service role can call it.
*/

CREATE OR REPLACE FUNCTION search_document_chunks(search_query text, max_rows integer DEFAULT 8)
RETURNS TABLE (
  content text,
  source_page integer,
  filename text,
  storage_path text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.content, c.source_page, d.filename, d.storage_path
  FROM ai_document_chunks c
  JOIN ai_documents d ON d.id = c.document_id
  WHERE d.status = 'completed'
    AND c.search_document @@ plainto_tsquery('spanish', search_query)
  ORDER BY ts_rank(c.search_document, plainto_tsquery('spanish', search_query)) DESC
  LIMIT LEAST(GREATEST(max_rows, 1), 20);
$$;

REVOKE EXECUTE ON FUNCTION search_document_chunks(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION search_document_chunks(text, integer) TO service_role;
