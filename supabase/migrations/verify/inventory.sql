-- Verification script for inventory table migration
-- This script tests the inventory table structure, constraints, indexes, and RLS policies

-- Test 1: Verify table exists
SELECT 'Test 1: Table exists' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 2: Verify all required columns exist with correct types
SELECT 'Test 2: Required columns' AS test_name,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'inventory' 
            AND column_name IN ('id', 'household_id', 'item_id', 'state', 'confidence', 'last_event_at', 'created_at', 'updated_at')
        ) = 8 THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 3: Verify state CHECK constraint exists
SELECT 'Test 3: State CHECK constraint' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name LIKE '%state%' 
            AND constraint_schema = 'public'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 4: Verify confidence CHECK constraint exists
SELECT 'Test 4: Confidence CHECK constraint' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name LIKE '%confidence%' 
            AND constraint_schema = 'public'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 5: Verify unique constraint on item_id
SELECT 'Test 5: Unique item_id constraint' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'inventory' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name = 'unique_item_inventory'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 6: Verify foreign key to households
SELECT 'Test 6: Foreign key to households' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'inventory' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'household_id'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 7: Verify foreign key to items
SELECT 'Test 7: Foreign key to items' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'inventory' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'item_id'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 8: Verify indexes exist
SELECT 'Test 8: Required indexes' AS test_name,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_indexes 
            WHERE tablename = 'inventory' 
            AND indexname IN (
                'idx_inventory_household_id',
                'idx_inventory_item_id',
                'idx_inventory_state',
                'idx_inventory_last_event_at',
                'idx_inventory_household_state',
                'idx_inventory_household_last_event'
            )
        ) >= 6 THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 9: Verify RLS is enabled
SELECT 'Test 9: RLS enabled' AS test_name,
    CASE 
        WHEN (
            SELECT relrowsecurity FROM pg_class 
            WHERE relname = 'inventory'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 10: Verify RLS policies exist
SELECT 'Test 10: RLS policies' AS test_name,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_policies 
            WHERE tablename = 'inventory'
            AND policyname IN (
                'inventory_select_policy',
                'inventory_insert_policy',
                'inventory_update_policy',
                'inventory_delete_policy'
            )
        ) = 4 THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 11: Verify updated_at trigger exists
SELECT 'Test 11: Updated_at trigger' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_table = 'inventory' 
            AND trigger_name = 'update_inventory_updated_at'
        ) THEN 'PASS'
        ELSE 'FAIL'
    END AS result;

-- Test 12: Verify state values are valid (insert test)
-- This test will be skipped if no test data exists
-- To run this test, you need to have test households and items

-- Summary
SELECT 
    COUNT(*) FILTER (WHERE result = 'PASS') AS passed_tests,
    COUNT(*) FILTER (WHERE result = 'FAIL') AS failed_tests,
    COUNT(*) AS total_tests
FROM (
    -- Repeat all tests above in a UNION
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'inventory'
        ) THEN 'PASS' ELSE 'FAIL' END AS result
    UNION ALL
    SELECT CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'inventory' 
            AND column_name IN ('id', 'household_id', 'item_id', 'state', 'confidence', 'last_event_at', 'created_at', 'updated_at')
        ) = 8 THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name LIKE '%state%' 
            AND constraint_schema = 'public'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints 
            WHERE constraint_name LIKE '%confidence%' 
            AND constraint_schema = 'public'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'inventory' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name = 'unique_item_inventory'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'inventory' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'household_id'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'inventory' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'item_id'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_indexes 
            WHERE tablename = 'inventory' 
            AND indexname IN (
                'idx_inventory_household_id',
                'idx_inventory_item_id',
                'idx_inventory_state',
                'idx_inventory_last_event_at',
                'idx_inventory_household_state',
                'idx_inventory_household_last_event'
            )
        ) >= 6 THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN (
            SELECT relrowsecurity FROM pg_class 
            WHERE relname = 'inventory'
        ) THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_policies 
            WHERE tablename = 'inventory'
            AND policyname IN (
                'inventory_select_policy',
                'inventory_insert_policy',
                'inventory_update_policy',
                'inventory_delete_policy'
            )
        ) = 4 THEN 'PASS' ELSE 'FAIL' END
    UNION ALL
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE event_object_table = 'inventory' 
            AND trigger_name = 'update_inventory_updated_at'
        ) THEN 'PASS' ELSE 'FAIL' END
) AS test_results;
