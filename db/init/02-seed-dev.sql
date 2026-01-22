-- sNAKr Development Seed Data
-- This script creates sample data for local development and testing
-- WARNING: Only run in development environments!

-- ============================================================================
-- SEED DATA TOGGLE
-- ============================================================================
-- Set this to false to skip seed data
DO $$
DECLARE
    load_seed_data BOOLEAN := true;
BEGIN
    IF NOT load_seed_data THEN
        RAISE NOTICE '⊘ Seed data loading skipped';
        RETURN;
    END IF;

    RAISE NOTICE '→ Loading development seed data...';

    -- Add seed data here after migrations are run
    -- Example:
    -- INSERT INTO households (id, name) VALUES 
    --   ('00000000-0000-0000-0000-000000000001', 'Test Household');

    RAISE NOTICE '✓ Seed data loaded successfully';
END $$;
