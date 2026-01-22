-- sNAKr Database Initialization Script
-- This script is for local PostgreSQL development (non-Supabase fallback)
-- For Supabase development, use: supabase/migrations/ instead

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Fuzzy text search for item matching
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption functions

-- ============================================================================
-- CONFIGURATION
-- ============================================================================

-- Set timezone
SET timezone = 'UTC';

-- Grant privileges (if using custom user)
-- GRANT ALL PRIVILEGES ON DATABASE snakr TO snakr_user;

-- ============================================================================
-- LOGGING
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✓ sNAKr database initialized successfully';
    RAISE NOTICE '✓ Extensions enabled: uuid-ossp, pg_trgm, pgcrypto';
    RAISE NOTICE '→ Next: Run migrations from supabase/migrations/ or api/alembic/versions/';
END $$;
