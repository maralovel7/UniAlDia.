/*
# Add semantic document retrieval

## Purpose
Adds the server-only vector similarity function used when OpenRouter returns an embedding for a user query.

## Function
- `match_document_chunks(query_embedding vector, match_count integer)` returns the closest completed document fragments with source metadata.

## Security
- Execute is revoked from PUBLIC, anon and authenticated; only the service role can call it.
*/

CREATE OR REPLACE FUNCTION match_document_chunks(query_embedding vector(1536), match_count integer DEFAULT 8)
RETURNS TABLE (
  content text,
  source_page integer,
  filename text,
  storage_path text,
  similarity real
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.content, c.source_page, d.filename, d.storage_path, (1 - (c.embedding <=> query_embedding))::real
  FROM ai_document_chunks c
  JOIN ai_documents d ON d.id = c.document_id
  WHERE d.status = 'completed' AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

REVOKE EXECUTE ON FUNCTION match_document_chunks(vector, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION match_document_chunks(vector, integer) TO service_role;
