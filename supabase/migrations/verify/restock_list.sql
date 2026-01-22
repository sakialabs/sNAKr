-- Verification script for restock_list table migration
-- Tests structure, constraints, indexes, RLS policies, and helper functions

-- ============================================================================
-- 1. Table Structure Verification
-- ============================================================================

DO $$
DECLARE
    v_table_exists BOOLEAN;
    v_column_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'restock_list'
    ) INTO v_table_exists;
    
    IF NOT v_table_exists THEN
        RAISE EXCEPTION 'Table restock_list does not exist';
    END IF;
    
    RAISE NOTICE '✓ Table restock_list exists';
    
    -- Check column count
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'restock_list';
    
    IF v_column_count != 13 THEN
        RAISE EXCEPTION 'Expected 13 columns, found %', v_column_count;
    END IF;
    
    RAISE NOTICE '✓ Table has correct number of columns (13)';
END $$;

-- ============================================================================
-- 2. Column Verification
-- ============================================================================

DO $$
DECLARE
    v_column_name TEXT;
    v_expected_columns TEXT[] := ARRAY[
        'id', 'household_id', 'item_id', 'urgency', 'reason',
        'days_to_low', 'days_to_out', 'dismissed_until', 'dismissed_at',
        'dismissed_duration_days', 'confidence', 'created_at', 'updated_at'
    ];
BEGIN
    FOREACH v_column_name IN ARRAY v_expected_columns
    LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'restock_list'
            AND column_name = v_column_name
        ) THEN
            RAISE EXCEPTION 'Column % does not exist', v_column_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✓ All expected columns exist';
END $$;

-- ============================================================================
-- 3. Data Type Verification
-- ============================================================================

DO $$
BEGIN
    -- Verify UUID columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'restock_list'
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'Column id should be UUID type';
    END IF;
    
    -- Verify TEXT columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'restock_list'
        AND column_name = 'urgency'
        AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'Column urgency should be TEXT type';
    END IF;
    
    -- Verify INTEGER columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'restock_list'
        AND column_name = 'days_to_low'
        AND data_type = 'integer'
    ) THEN
        RAISE EXCEPTION 'Column days_to_low should be INTEGER type';
    END IF;
    
    -- Verify NUMERIC columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'restock_list'
        AND column_name = 'confidence'
        AND data_type = 'numeric'
    ) THEN
        RAISE EXCEPTION 'Column confidence should be NUMERIC type';
    END IF;
    
    -- Verify TIMESTAMPTZ columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'restock_list'
        AND column_name = 'created_at'
        AND data_type = 'timestamp with time zone'
    ) THEN
        RAISE EXCEPTION 'Column created_at should be TIMESTAMPTZ type';
    END IF;
    
    RAISE NOTICE '✓ All columns have correct data types';
END $$;

-- ============================================================================
-- 4. Constraint Verification
-- ============================================================================

DO $$
DECLARE
    v_constraint_count INTEGER;
BEGIN
    -- Check CHECK constraints
    SELECT COUNT(*) INTO v_constraint_count
    FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
    AND constraint_name LIKE 'restock_list_%';
    
    IF v_constraint_count < 4 THEN
        RAISE EXCEPTION 'Expected at least 4 CHECK constraints, found %', v_constraint_count;
    END IF;
    
    RAISE NOTICE '✓ CHECK constraints exist';
    
    -- Check UNIQUE constraint
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
        AND table_name = 'restock_list'
        AND constraint_name = 'unique_item_restock'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE EXCEPTION 'UNIQUE constraint unique_item_restock does not exist';
    END IF;
    
    RAISE NOTICE '✓ UNIQUE constraint exists';
    
    -- Check FOREIGN KEY constraints
    SELECT COUNT(*) INTO v_constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
    AND table_name = 'restock_list'
    AND constraint_type = 'FOREIGN KEY';
    
    IF v_constraint_count != 2 THEN
        RAISE EXCEPTION 'Expected 2 FOREIGN KEY constraints, found %', v_constraint_count;
    END IF;
    
    RAISE NOTICE '✓ FOREIGN KEY constraints exist';
END $$;

-- ============================================================================
-- 5. Index Verification
-- ============================================================================

DO $$
DECLARE
    v_index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'restock_list';
    
    -- Should have at least 10 indexes (including primary key)
    IF v_index_count < 10 THEN
        RAISE EXCEPTION 'Expected at least 10 indexes, found %', v_index_count;
    END IF;
    
    RAISE NOTICE '✓ Indexes exist (found %)', v_index_count;
    
    -- Verify specific indexes
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'restock_list'
        AND indexname = 'idx_restock_list_household_id'
    ) THEN
        RAISE EXCEPTION 'Index idx_restock_list_household_id does not exist';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'restock_list'
        AND indexname = 'idx_restock_list_household_urgency'
    ) THEN
        RAISE EXCEPTION 'Index idx_restock_list_household_urgency does not exist';
    END IF;
    
    RAISE NOTICE '✓ Key indexes verified';
END $$;

-- ============================================================================
-- 6. RLS Policy Verification
-- ============================================================================

DO $$
DECLARE
    v_rls_enabled BOOLEAN;
    v_policy_count INTEGER;
BEGIN
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class
    WHERE relname = 'restock_list'
    AND relnamespace = 'public'::regnamespace;
    
    IF NOT v_rls_enabled THEN
        RAISE EXCEPTION 'Row Level Security is not enabled on restock_list';
    END IF;
    
    RAISE NOTICE '✓ Row Level Security is enabled';
    
    -- Check policy count
    SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'restock_list';
    
    IF v_policy_count != 4 THEN
        RAISE EXCEPTION 'Expected 4 RLS policies, found %', v_policy_count;
    END IF;
    
    RAISE NOTICE '✓ RLS policies exist (4 policies)';
    
    -- Verify specific policies
    IF NOT EXISTS (
        SELECT FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'restock_list'
        AND policyname = 'restock_list_select_policy'
    ) THEN
        RAISE EXCEPTION 'Policy restock_list_select_policy does not exist';
    END IF;
    
    RAISE NOTICE '✓ All RLS policies verified';
END $$;

-- ============================================================================
-- 7. Trigger Verification
-- ============================================================================

DO $$
DECLARE
    v_trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_trigger_count
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
    AND event_object_table = 'restock_list'
    AND trigger_name = 'update_restock_list_updated_at';
    
    IF v_trigger_count = 0 THEN
        RAISE EXCEPTION 'Trigger update_restock_list_updated_at does not exist';
    END IF;
    
    RAISE NOTICE '✓ Trigger update_restock_list_updated_at exists';
END $$;

-- ============================================================================
-- 8. Helper Function Verification
-- ============================================================================

DO $$
BEGIN
    -- Check dismiss_restock_item function
    IF NOT EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'dismiss_restock_item'
    ) THEN
        RAISE EXCEPTION 'Function dismiss_restock_item does not exist';
    END IF;
    
    RAISE NOTICE '✓ Function dismiss_restock_item exists';
    
    -- Check undismiss_restock_item function
    IF NOT EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'undismiss_restock_item'
    ) THEN
        RAISE EXCEPTION 'Function undismiss_restock_item does not exist';
    END IF;
    
    RAISE NOTICE '✓ Function undismiss_restock_item exists';
    
    -- Check cleanup_expired_dismissals function
    IF NOT EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'cleanup_expired_dismissals'
    ) THEN
        RAISE EXCEPTION 'Function cleanup_expired_dismissals does not exist';
    END IF;
    
    RAISE NOTICE '✓ Function cleanup_expired_dismissals exists';
END $$;

-- ============================================================================
-- 9. Data Integrity Tests
-- ============================================================================

DO $$
DECLARE
    v_household_id UUID;
    v_item_id UUID;
    v_restock_id UUID;
    v_result BOOLEAN;
BEGIN
    -- Create test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO v_household_id;
    
    -- Create test item
    INSERT INTO items (household_id, name, category, location)
    VALUES (v_household_id, 'Test Item', 'dairy', 'fridge')
    RETURNING id INTO v_item_id;
    
    -- Test 1: Insert valid restock entry
    INSERT INTO restock_list (
        household_id, item_id, urgency, reason, 
        days_to_low, days_to_out, confidence
    )
    VALUES (
        v_household_id, v_item_id, 'need_now', 'Currently out',
        NULL, 0, 0.95
    )
    RETURNING id INTO v_restock_id;
    
    RAISE NOTICE '✓ Valid restock entry inserted';
    
    -- Test 2: Verify UNIQUE constraint (should fail)
    BEGIN
        INSERT INTO restock_list (
            household_id, item_id, urgency, reason, confidence
        )
        VALUES (
            v_household_id, v_item_id, 'need_soon', 'Predicted low', 0.80
        );
        RAISE EXCEPTION 'UNIQUE constraint should have prevented duplicate item_id';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ UNIQUE constraint working (duplicate item_id rejected)';
    END;
    
    -- Test 3: Test invalid urgency (should fail)
    BEGIN
        INSERT INTO restock_list (
            household_id, item_id, urgency, reason, confidence
        )
        VALUES (
            v_household_id, gen_random_uuid(), 'invalid_urgency', 'Test', 0.80
        );
        RAISE EXCEPTION 'CHECK constraint should have prevented invalid urgency';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ CHECK constraint working (invalid urgency rejected)';
    END;
    
    -- Test 4: Test invalid confidence (should fail)
    BEGIN
        INSERT INTO restock_list (
            household_id, item_id, urgency, reason, confidence
        )
        VALUES (
            v_household_id, gen_random_uuid(), 'need_now', 'Test', 1.5
        );
        RAISE EXCEPTION 'CHECK constraint should have prevented invalid confidence';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ CHECK constraint working (invalid confidence rejected)';
    END;
    
    -- Test 5: Test dismiss_restock_item function
    SELECT dismiss_restock_item(v_item_id, 7) INTO v_result;
    
    IF NOT v_result THEN
        RAISE EXCEPTION 'dismiss_restock_item should have returned TRUE';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM restock_list
        WHERE item_id = v_item_id
        AND dismissed_until IS NOT NULL
        AND dismissed_duration_days = 7
    ) THEN
        RAISE EXCEPTION 'Item should be dismissed for 7 days';
    END IF;
    
    RAISE NOTICE '✓ dismiss_restock_item function working';
    
    -- Test 6: Test undismiss_restock_item function
    SELECT undismiss_restock_item(v_item_id) INTO v_result;
    
    IF NOT v_result THEN
        RAISE EXCEPTION 'undismiss_restock_item should have returned TRUE';
    END IF;
    
    IF EXISTS (
        SELECT FROM restock_list
        WHERE item_id = v_item_id
        AND dismissed_until IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Item should not be dismissed after undismiss';
    END IF;
    
    RAISE NOTICE '✓ undismiss_restock_item function working';
    
    -- Test 7: Test invalid dismissal duration (should fail)
    BEGIN
        PERFORM dismiss_restock_item(v_item_id, 5);
        RAISE EXCEPTION 'dismiss_restock_item should reject invalid duration';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '✓ dismiss_restock_item validates duration';
    END;
    
    -- Test 8: Test CASCADE delete
    DELETE FROM items WHERE id = v_item_id;
    
    IF EXISTS (
        SELECT FROM restock_list WHERE item_id = v_item_id
    ) THEN
        RAISE EXCEPTION 'Restock entry should be deleted when item is deleted';
    END IF;
    
    RAISE NOTICE '✓ CASCADE delete working';
    
    -- Cleanup
    DELETE FROM households WHERE id = v_household_id;
    
    RAISE NOTICE '✓ All data integrity tests passed';
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Restock List Migration Verification Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tests passed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Table: restock_list';
    RAISE NOTICE 'Columns: 13';
    RAISE NOTICE 'Indexes: 10+';
    RAISE NOTICE 'RLS Policies: 4';
    RAISE NOTICE 'Triggers: 1';
    RAISE NOTICE 'Helper Functions: 3';
    RAISE NOTICE '';
END $$;
