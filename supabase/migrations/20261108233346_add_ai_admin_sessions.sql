/*
# Add server-side administration sessions

## Purpose
Adds the hashed administrator credential and session records used by the private AI administration endpoint.

## New tables
- `ai_admin_credentials`: one username, PBKDF2 password hash, and forced-password-change flag.
- `ai_admin_sessions`: hashed short-lived admin bearer tokens.

## Security
- RLS is enabled and all Data API access is revoked from public roles.
- Only the Edge Function service role can read or write these records.
- Password values are never stored; only a salted hash is stored.
- The first credential is created through a server-only bootstrap route guarded by the `ADMIN_SETUP_TOKEN` secret.
*/

CREATE TABLE IF NOT EXISTS ai_admin_credentials (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '8 hours')
);

ALTER TABLE ai_admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_admin_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ai_admin_credentials, ai_admin_sessions FROM PUBLIC, anon, authenticated;
GRANT ALL ON ai_admin_credentials, ai_admin_sessions TO service_role;
