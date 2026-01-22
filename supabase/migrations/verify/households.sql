-- Verification script for households table migration
-- Run this after applying the migration to verify everything is set up correctly

-- Check if households table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'households'
) AS households_table_exists;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'households'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'households';

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'households';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'households';

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'households';

-- Check if the update function exists
SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'update_updated_at_column'
) AS update_function_exists;

-- Test insert (will only work if authenticated)
-- Uncomment to test:
-- INSERT INTO households (name) VALUES ('Test Household');
-- SELECT * FROM households WHERE name = 'Test Household';
-- DELETE FROM households WHERE name = 'Test Household';
