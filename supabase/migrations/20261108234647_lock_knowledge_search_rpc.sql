/*
# Lock the knowledge search RPC

## Purpose
The public web client no longer calls this SECURITY DEFINER function directly; the server agent uses the service role instead.

## Security
- Revoke EXECUTE from PUBLIC, anon and authenticated.
- Grant EXECUTE only to service_role.
*/

REVOKE EXECUTE ON FUNCTION search_knowledge(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge(text, integer) TO service_role;
