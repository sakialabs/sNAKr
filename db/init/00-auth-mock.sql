-- Mock Supabase Auth Schema for Local Development
-- This script creates a minimal auth schema to support RLS policies
-- that reference auth.users and auth.uid()

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table (minimal version for local dev)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create authenticated role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
        GRANT USAGE ON SCHEMA auth TO authenticated;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        GRANT SELECT ON auth.users TO authenticated;
    END IF;
END
$$;

-- Create auth.uid() function to return current user ID
-- In local dev, this will return NULL unless we set a session variable
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
    SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
$$;

-- Grant execute permission on auth.uid()
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon, public;

-- Create anon role (for unauthenticated access)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon;
        GRANT USAGE ON SCHEMA public TO anon;
    END IF;
END
$$;

-- Logging
DO $$
BEGIN
    RAISE NOTICE '✓ Mock auth schema created for local development';
    RAISE NOTICE '✓ auth.users table created';
    RAISE NOTICE '✓ auth.uid() function created';
    RAISE NOTICE '✓ authenticated and anon roles created';
END $$;
