-- Verification script for receipts table migration
-- Run this after applying the migration to verify everything is set up correctly

-- ============================================================================
-- Table Structure Verification
-- ============================================================================

-- Check if receipts table exists
SELECT 
    'receipts table exists' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'receipts'
        ) THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result;

-- Check column count
SELECT 
    'receipts has correct number of columns' AS check_name,
    CASE 
        WHEN COUNT(*) = 21 THEN '✓ PASS'
        ELSE '✗ FAIL (expected 21, got ' || COUNT(*) || ')'
    END AS result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'receipts';

-- Check required columns exist
SELECT 
    'receipts has all required columns' AS check_name,
    CASE 
        WHEN COUNT(*) = 21 THEN '✓ PASS'
        ELSE '✗ FAIL (missing columns)'
    END AS result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'receipts'
AND column_name IN (
    'id', 'household_id', 'file_path', 'file_type', 'file_size_bytes',
    'status', 'ocr_text', 'ocr_confidence', 'store_name', 'receipt_date',
    'total_amount', 'item_count', 'confirmed_count', 'error_message',
    'error_code', 'uploaded_at', 'processing_started_at', 'parsed_at',
    'confirmed_at', 'created_at', 'updated_at'
);

-- ============================================================================
-- Constraints Verification
-- ============================================================================

-- Check foreign key constraint
SELECT 
    'receipts has household_id foreign key' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'receipts'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%household%'
        ) THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result;

-- Check status constraint
SELECT 
    'receipts has status check constraint' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_schema = 'public'
            AND constraint_name LIKE '%status%'
        ) THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result;

-- Check file_type constraint
SELECT 
    'receipts has file_type check constraint' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_schema = 'public'
            AND constraint_name LIKE '%file_type%'
        ) THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result;

-- ============================================================================
-- Indexes Verification
-- ============================================================================

-- Check if all required indexes exist
SELECT 
    'receipts has all required indexes' AS check_name,
    CASE 
        WHEN COUNT(*) >= 7 THEN '✓ PASS'
        ELSE '✗ FAIL (expected at least 7, got ' || COUNT(*) || ')'
    END AS result
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'receipts'
AND indexname LIKE 'idx_receipts%';

-- List all indexes
SELECT 
    'Index: ' || indexname AS check_name,
    '✓ EXISTS' AS result
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'receipts'
ORDER BY indexname;

-- ============================================================================
-- RLS Policies Verification
-- ============================================================================

-- Check if RLS is enabled
SELECT 
    'receipts has RLS enabled' AS check_name,
    CASE 
        WHEN relrowsecurity THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result
FROM pg_class
WHERE relname = 'receipts'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if policies exist
SELECT 
    'receipts has RLS policies' AS check_name,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✓ PASS (found ' || COUNT(*) || ' policies)'
        ELSE '✗ FAIL (expected at least 4, got ' || COUNT(*) || ')'
    END AS result
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'receipts';

-- List all policies
SELECT 
    'Policy: ' || policyname || ' (' || cmd || ')' AS check_name,
    '✓ EXISTS' AS result
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'receipts'
ORDER BY policyname;

-- ============================================================================
-- Trigger Verification
-- ============================================================================

-- Check if updated_at trigger exists
SELECT 
    'receipts has updated_at trigger' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers
            WHERE event_object_schema = 'public'
            AND event_object_table = 'receipts'
            AND trigger_name = 'update_receipts_updated_at'
        ) THEN '✓ PASS'
        ELSE '✗ FAIL'
    END AS result;

-- ============================================================================
-- Data Integrity Tests
-- ============================================================================

-- Test: Insert a valid receipt (will be rolled back)
DO $$
DECLARE
    test_household_id UUID;
    test_receipt_id UUID;
BEGIN
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO test_household_id;
    
    -- Insert a test receipt
    INSERT INTO receipts (
        household_id,
        file_path,
        file_type,
        file_size_bytes,
        status
    ) VALUES (
        test_household_id,
        'receipts/test-receipt.jpg',
        'image/jpeg',
        1024000,
        'uploaded'
    ) RETURNING id INTO test_receipt_id;
    
    -- Verify the insert worked
    IF test_receipt_id IS NOT NULL THEN
        RAISE NOTICE '✓ PASS: Can insert valid receipt';
    ELSE
        RAISE NOTICE '✗ FAIL: Could not insert valid receipt';
    END IF;
    
    -- Clean up
    DELETE FROM receipts WHERE id = test_receipt_id;
    DELETE FROM households WHERE id = test_household_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ FAIL: Error inserting receipt: %', SQLERRM;
        ROLLBACK;
END $$;

-- Test: Try to insert receipt with invalid status (should fail)
DO $$
DECLARE
    test_household_id UUID;
BEGIN
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO test_household_id;
    
    -- Try to insert with invalid status
    BEGIN
        INSERT INTO receipts (
            household_id,
            file_path,
            file_type,
            file_size_bytes,
            status
        ) VALUES (
            test_household_id,
            'receipts/test-receipt.jpg',
            'image/jpeg',
            1024000,
            'invalid_status'
        );
        
        RAISE NOTICE '✗ FAIL: Should not allow invalid status';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ PASS: Correctly rejects invalid status';
    END;
    
    -- Clean up
    DELETE FROM households WHERE id = test_household_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ FAIL: Unexpected error: %', SQLERRM;
        ROLLBACK;
END $$;

-- Test: Try to insert receipt with invalid file_type (should fail)
DO $$
DECLARE
    test_household_id UUID;
BEGIN
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO test_household_id;
    
    -- Try to insert with invalid file_type
    BEGIN
        INSERT INTO receipts (
            household_id,
            file_path,
            file_type,
            file_size_bytes,
            status
        ) VALUES (
            test_household_id,
            'receipts/test-receipt.txt',
            'text/plain',
            1024000,
            'uploaded'
        );
        
        RAISE NOTICE '✗ FAIL: Should not allow invalid file_type';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ PASS: Correctly rejects invalid file_type';
    END;
    
    -- Clean up
    DELETE FROM households WHERE id = test_household_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ FAIL: Unexpected error: %', SQLERRM;
        ROLLBACK;
END $$;

-- Test: Try to insert receipt with file size > 10MB (should fail)
DO $$
DECLARE
    test_household_id UUID;
BEGIN
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO test_household_id;
    
    -- Try to insert with file size > 10MB
    BEGIN
        INSERT INTO receipts (
            household_id,
            file_path,
            file_type,
            file_size_bytes,
            status
        ) VALUES (
            test_household_id,
            'receipts/test-receipt.jpg',
            'image/jpeg',
            11000000,  -- 11MB
            'uploaded'
        );
        
        RAISE NOTICE '✗ FAIL: Should not allow file size > 10MB';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ PASS: Correctly rejects file size > 10MB';
    END;
    
    -- Clean up
    DELETE FROM households WHERE id = test_household_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ FAIL: Unexpected error: %', SQLERRM;
        ROLLBACK;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

SELECT 
    '============================================' AS summary,
    'Receipts Table Migration Verification Complete' AS status;
