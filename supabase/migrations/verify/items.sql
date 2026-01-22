-- Verification script for items table migration
-- This script tests the items table structure, indexes, and RLS policies

-- Test 1: Verify table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'items') THEN
        RAISE EXCEPTION 'items table does not exist';
    END IF;
    RAISE NOTICE 'Test 1 PASSED: items table exists';
END $$;

-- Test 2: Verify columns exist with correct types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'items.id column missing or wrong type';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'household_id' AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'items.household_id column missing or wrong type';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'name' AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'items.name column missing or wrong type';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'category' AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'items.category column missing or wrong type';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' AND column_name = 'location' AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'items.location column missing or wrong type';
    END IF;
    
    RAISE NOTICE 'Test 2 PASSED: All columns exist with correct types';
END $$;

-- Test 3: Verify foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'items' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%household%'
    ) THEN
        RAISE EXCEPTION 'Foreign key constraint on household_id missing';
    END IF;
    RAISE NOTICE 'Test 3 PASSED: Foreign key constraint exists';
END $$;

-- Test 4: Verify unique constraint on household_id + name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'items' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'unique_item_name_per_household'
    ) THEN
        RAISE EXCEPTION 'Unique constraint on household_id + name missing';
    END IF;
    RAISE NOTICE 'Test 4 PASSED: Unique constraint exists';
END $$;

-- Test 5: Verify check constraints for category and location
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%category%'
    ) THEN
        RAISE EXCEPTION 'Check constraint on category missing';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%location%'
    ) THEN
        RAISE EXCEPTION 'Check constraint on location missing';
    END IF;
    
    RAISE NOTICE 'Test 5 PASSED: Check constraints exist';
END $$;

-- Test 6: Verify indexes exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'items' AND indexname = 'idx_items_household_id'
    ) THEN
        RAISE EXCEPTION 'Index idx_items_household_id missing';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'items' AND indexname = 'idx_items_category'
    ) THEN
        RAISE EXCEPTION 'Index idx_items_category missing';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'items' AND indexname = 'idx_items_location'
    ) THEN
        RAISE EXCEPTION 'Index idx_items_location missing';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'items' AND indexname = 'idx_items_name_trgm'
    ) THEN
        RAISE EXCEPTION 'Trigram index idx_items_name_trgm missing';
    END IF;
    
    RAISE NOTICE 'Test 6 PASSED: All indexes exist including trigram index';
END $$;

-- Test 7: Verify pg_trgm extension is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
    ) THEN
        RAISE EXCEPTION 'pg_trgm extension not enabled';
    END IF;
    RAISE NOTICE 'Test 7 PASSED: pg_trgm extension is enabled';
END $$;

-- Test 8: Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'items' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on items table';
    END IF;
    RAISE NOTICE 'Test 8 PASSED: RLS is enabled';
END $$;

-- Test 9: Verify RLS policies exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'items';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Expected at least 4 RLS policies, found %', policy_count;
    END IF;
    
    RAISE NOTICE 'Test 9 PASSED: % RLS policies exist', policy_count;
END $$;

-- Test 10: Verify trigger exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_items_updated_at'
    ) THEN
        RAISE EXCEPTION 'Trigger update_items_updated_at missing';
    END IF;
    RAISE NOTICE 'Test 10 PASSED: updated_at trigger exists';
END $$;

-- Test 11: Test trigram similarity search functionality
DO $$
DECLARE
    test_household_id UUID;
BEGIN
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household') RETURNING id INTO test_household_id;
    
    -- Insert test items
    INSERT INTO items (household_id, name, category, location) VALUES
        (test_household_id, 'Whole Milk 2%', 'dairy', 'fridge'),
        (test_household_id, 'Organic Milk', 'dairy', 'fridge'),
        (test_household_id, 'Almond Milk', 'dairy', 'fridge'),
        (test_household_id, 'Bread', 'bakery', 'pantry');
    
    -- Test similarity search
    IF NOT EXISTS (
        SELECT 1 FROM items 
        WHERE household_id = test_household_id 
        AND similarity(name, 'milk') > 0.3
    ) THEN
        RAISE EXCEPTION 'Trigram similarity search not working';
    END IF;
    
    -- Clean up test data
    DELETE FROM items WHERE household_id = test_household_id;
    DELETE FROM households WHERE id = test_household_id;
    
    RAISE NOTICE 'Test 11 PASSED: Trigram similarity search works';
END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'ALL TESTS PASSED: items table migration verified successfully';
    RAISE NOTICE '===========================================';
END $$;
