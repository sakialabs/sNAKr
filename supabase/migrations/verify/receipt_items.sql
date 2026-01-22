-- Verification script for receipt_items table migration
-- Run this after applying the migration to verify everything is set up correctly

\echo '========================================='
\echo 'Verifying receipt_items table migration'
\echo '========================================='
\echo ''

-- ============================================================================
-- 1. Verify table exists
-- ============================================================================
\echo '1. Checking if receipt_items table exists...'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'receipt_items'
) AS table_exists;

-- ============================================================================
-- 2. Verify column structure
-- ============================================================================
\echo ''
\echo '2. Checking column structure...'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'receipt_items'
ORDER BY ordinal_position;

\echo ''
\echo 'Expected columns: 19'
SELECT COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'receipt_items';

-- ============================================================================
-- 3. Verify foreign key constraints
-- ============================================================================
\echo ''
\echo '3. Checking foreign key constraints...'
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'receipt_items';

-- ============================================================================
-- 4. Verify check constraints
-- ============================================================================
\echo ''
\echo '4. Checking CHECK constraints...'
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'receipt_items'
AND con.contype = 'c'
ORDER BY con.conname;

-- ============================================================================
-- 5. Verify indexes
-- ============================================================================
\echo ''
\echo '5. Checking indexes...'
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'receipt_items'
ORDER BY indexname;

\echo ''
\echo 'Expected indexes: 9 (including primary key)'
SELECT COUNT(*) AS index_count
FROM pg_indexes
WHERE tablename = 'receipt_items';

-- ============================================================================
-- 6. Verify RLS is enabled
-- ============================================================================
\echo ''
\echo '6. Checking Row Level Security...'
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'receipt_items';

-- ============================================================================
-- 7. Verify RLS policies
-- ============================================================================
\echo ''
\echo '7. Checking RLS policies...'
SELECT
    policyname,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'receipt_items'
ORDER BY policyname;

\echo ''
\echo 'Expected policies: 4 (SELECT, INSERT, UPDATE, DELETE)'
SELECT COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename = 'receipt_items';

-- ============================================================================
-- 8. Verify triggers
-- ============================================================================
\echo ''
\echo '8. Checking triggers...'
SELECT
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'receipt_items'
ORDER BY trigger_name;

-- ============================================================================
-- 9. Test data integrity with sample inserts
-- ============================================================================
\echo ''
\echo '9. Testing data integrity...'

-- Create test household and receipt
DO $$
DECLARE
    test_household_id UUID;
    test_receipt_id UUID;
    test_item_id UUID;
    test_receipt_item_id UUID;
BEGIN
    -- Create test household
    INSERT INTO households (name)
    VALUES ('Test Household for Receipt Items')
    RETURNING id INTO test_household_id;
    
    RAISE NOTICE 'Created test household: %', test_household_id;
    
    -- Create test item
    INSERT INTO items (household_id, name, category, location)
    VALUES (test_household_id, 'Test Milk', 'dairy', 'fridge')
    RETURNING id INTO test_item_id;
    
    RAISE NOTICE 'Created test item: %', test_item_id;
    
    -- Create test receipt
    INSERT INTO receipts (
        household_id,
        file_path,
        file_type,
        file_size_bytes,
        status
    )
    VALUES (
        test_household_id,
        'test/receipt-001.jpg',
        'image/jpeg',
        1024000,
        'parsed'
    )
    RETURNING id INTO test_receipt_id;
    
    RAISE NOTICE 'Created test receipt: %', test_receipt_id;
    
    -- Test 1: Insert valid receipt item
    BEGIN
        INSERT INTO receipt_items (
            receipt_id,
            raw_name,
            normalized_name,
            quantity,
            unit,
            price,
            line_number,
            confidence,
            ocr_confidence,
            parsing_confidence,
            mapping_candidates,
            status
        )
        VALUES (
            test_receipt_id,
            'ORG MLK 2% 1GAL',
            'Milk 2%',
            1.0,
            'gallon',
            4.99,
            1,
            0.92,
            0.95,
            0.89,
            jsonb_build_array(
                jsonb_build_object(
                    'item_id', test_item_id::text,
                    'item_name', 'Test Milk',
                    'score', 0.92
                )
            ),
            'pending'
        )
        RETURNING id INTO test_receipt_item_id;
        
        RAISE NOTICE '✓ Successfully inserted valid receipt item: %', test_receipt_item_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Failed to insert valid receipt item: %', SQLERRM;
    END;
    
    -- Test 2: Verify invalid status is rejected
    BEGIN
        INSERT INTO receipt_items (
            receipt_id,
            raw_name,
            status
        )
        VALUES (
            test_receipt_id,
            'Test Item',
            'invalid_status'
        );
        
        RAISE NOTICE '✗ Should have rejected invalid status';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Correctly rejected invalid status';
    END;
    
    -- Test 3: Verify negative quantity is rejected
    BEGIN
        INSERT INTO receipt_items (
            receipt_id,
            raw_name,
            quantity
        )
        VALUES (
            test_receipt_id,
            'Test Item',
            -1.0
        );
        
        RAISE NOTICE '✗ Should have rejected negative quantity';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Correctly rejected negative quantity';
    END;
    
    -- Test 4: Verify confidence out of range is rejected
    BEGIN
        INSERT INTO receipt_items (
            receipt_id,
            raw_name,
            confidence
        )
        VALUES (
            test_receipt_id,
            'Test Item',
            1.5
        );
        
        RAISE NOTICE '✗ Should have rejected confidence > 1.0';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE '✓ Correctly rejected confidence > 1.0';
    END;
    
    -- Test 5: Verify updated_at trigger works
    BEGIN
        PERFORM pg_sleep(0.1);
        
        UPDATE receipt_items
        SET normalized_name = 'Updated Milk 2%'
        WHERE id = test_receipt_item_id;
        
        IF EXISTS (
            SELECT 1 FROM receipt_items
            WHERE id = test_receipt_item_id
            AND updated_at > created_at
        ) THEN
            RAISE NOTICE '✓ updated_at trigger working correctly';
        ELSE
            RAISE NOTICE '✗ updated_at trigger not working';
        END IF;
    END;
    
    -- Test 6: Verify mapping_candidates JSONB structure
    BEGIN
        UPDATE receipt_items
        SET mapping_candidates = jsonb_build_array(
            jsonb_build_object(
                'item_id', test_item_id::text,
                'item_name', 'Test Milk',
                'score', 0.92
            ),
            jsonb_build_object(
                'item_id', gen_random_uuid()::text,
                'item_name', 'Other Milk',
                'score', 0.75
            )
        )
        WHERE id = test_receipt_item_id;
        
        RAISE NOTICE '✓ Successfully stored JSONB mapping candidates';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Failed to store JSONB mapping candidates: %', SQLERRM;
    END;
    
    -- Test 7: Verify CASCADE delete from receipts
    BEGIN
        DELETE FROM receipts WHERE id = test_receipt_id;
        
        IF NOT EXISTS (SELECT 1 FROM receipt_items WHERE receipt_id = test_receipt_id) THEN
            RAISE NOTICE '✓ CASCADE delete working correctly';
        ELSE
            RAISE NOTICE '✗ CASCADE delete not working';
        END IF;
    END;
    
    -- Cleanup
    DELETE FROM households WHERE id = test_household_id;
    
    RAISE NOTICE 'Cleaned up test data';
END $$;

-- ============================================================================
-- Summary
-- ============================================================================
\echo ''
\echo '========================================='
\echo 'Verification complete!'
\echo '========================================='
\echo ''
\echo 'Review the output above to ensure:'
\echo '  - Table exists with 19 columns'
\echo '  - Foreign keys: receipt_id (CASCADE), item_id (SET NULL)'
\echo '  - 9 indexes created (including primary key)'
\echo '  - RLS enabled with 4 policies'
\echo '  - updated_at trigger working'
\echo '  - All data integrity tests passed'
\echo ''
