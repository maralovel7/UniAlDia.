/*
# Add full-text search function for knowledge_entries

1. New Functions
- `search_knowledge(search_query text, max_rows int default 5)`
  - Searches across title, content, and keywords using PostgreSQL full-text search (tsvector).
  - Returns matching rows ranked by relevance.
  - Falls back to ILIKE if no full-text matches, so partial word matches still work.

2. Security
- Function is SECURITY DEFINER so it can read the table even if the caller has restricted access.
- REVOKE EXECUTE from PUBLIC and anon; GRANT to authenticated and anon (the app uses anon key).
*/

CREATE OR REPLACE FUNCTION search_knowledge(search_query text, max_rows int DEFAULT 5)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  url text,
  file_url text,
  keywords text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.title,
    ke.content,
    ke.category,
    ke.url,
    ke.file_url,
    ke.keywords
  FROM knowledge_entries ke
  WHERE
    -- Full-text search across title, content, and keywords
    to_tsvector('spanish', ke.title || ' ' || ke.content || ' ' || COALESCE(ke.keywords, ''))
    @@ to_tsquery('spanish', plainto_tsquery('spanish', search_query)::text)
  ORDER BY
    ts_rank(
      to_tsvector('spanish', ke.title || ' ' || ke.content || ' ' || COALESCE(ke.keywords, '')),
      to_tsquery('spanish', plainto_tsquery('spanish', search_query)::text)
    ) DESC
  LIMIT max_rows;

  -- If no full-text results, fall back to ILIKE
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      ke.id,
      ke.title,
      ke.content,
      ke.category,
      ke.url,
      ke.file_url,
      ke.keywords
    FROM knowledge_entries ke
    WHERE
      ke.title ILIKE '%' || search_query || '%'
      OR ke.keywords ILIKE '%' || search_query || '%'
      OR ke.content ILIKE '%' || search_query || '%'
    ORDER BY ke.updated_at DESC
    LIMIT max_rows;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION search_knowledge(text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION search_knowledge(text, int) TO anon, authenticated;
