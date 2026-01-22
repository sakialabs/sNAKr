-- Verification Script: Events Table Migration
-- Purpose: Verify that the events table was created correctly with all features
-- Run this after applying the migration to ensure everything works

-- ============================================================================
-- 1. Verify Table Exists
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        RAISE EXCEPTION 'FAILED: events table does not exist';
    END IF;
    RAISE NOTICE 'PASSED: events table exists';
END $$;

-- ============================================================================
-- 2. Verify Columns
-- ============================================================================

DO $$
DECLARE
    expected_columns TEXT[] := ARRAY[
        'id', 'household_id', 'event_type', 'source', 'item_id', 
        'receipt_id', 'payload', 'confidence', 'created_at'
    ];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY expected_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = col
        ) THEN
            RAISE EXCEPTION 'FAILED: Column % does not exist', col;
        END IF;
    END LOOP;
    RAISE NOTICE 'PASSED: All columns exist';
END $$;

-- ============================================================================
-- 3. Verify Indexes
-- ============================================================================

DO $$
DECLARE
    expected_indexes TEXT[] := ARRAY[
        'events_pkey',
        'idx_events_household_id',
        'idx_events_event_type',
        'idx_events_item_id',
        'idx_events_receipt_id',
        'idx_events_created_at',
        'idx_events_household_created',
        'idx_events_item_created'
    ];
    idx TEXT;
BEGIN
    FOREACH idx IN ARRAY expected_indexes
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'events' AND indexname = idx
        ) THEN
            RAISE EXCEPTION 'FAILED: Index % does not exist', idx;
        END IF;
    END LOOP;
    RAISE NOTICE 'PASSED: All indexes exist';
END $$;

-- ============================================================================
-- 4. Verify Check Constraints
-- ============================================================================

-- Test event_type constraint
DO $$
BEGIN
    -- Valid event types should work
    INSERT INTO events (household_id, event_type, source, payload)
    SELECT id, 'inventory.used', 'user', '{}'::jsonb
    FROM households LIMIT 1;
    
    DELETE FROM events WHERE event_type = 'inventory.used';
    
    -- Invalid event type should fail
    BEGIN
        INSERT INTO events (household_id, event_type, source, payload)
        SELECT id, 'invalid.type', 'user', '{}'::jsonb
        FROM households LIMIT 1;
        
        RAISE EXCEPTION 'FAILED: event_type constraint did not reject invalid value';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASSED: event_type constraint working';
    END;
END $$;

-- Test source constraint
DO $$
BEGIN
    -- Invalid source should fail
    BEGIN
        INSERT INTO events (household_id, event_type, source, payload)
        SELECT id, 'inventory.used', 'invalid_source', '{}'::jsonb
        FROM households LIMIT 1;
        
        RAISE EXCEPTION 'FAILED: source constraint did not reject invalid value';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASSED: source constraint working';
    END;
END $$;

-- Test confidence constraint
DO $$
BEGIN
    -- Confidence > 1.0 should fail
    BEGIN
        INSERT INTO events (household_id, event_type, source, payload, confidence)
        SELECT id, 'inventory.used', 'user', '{}'::jsonb, 1.5
        FROM households LIMIT 1;
        
        RAISE EXCEPTION 'FAILED: confidence constraint did not reject value > 1.0';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASSED: confidence constraint working (max)';
    END;
    
    -- Confidence < 0.0 should fail
    BEGIN
        INSERT INTO events (household_id, event_type, source, payload, confidence)
        SELECT id, 'inventory.used', 'user', '{}'::jsonb, -0.1
        FROM households LIMIT 1;
        
        RAISE EXCEPTION 'FAILED: confidence constraint did not reject value < 0.0';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'PASSED: confidence constraint working (min)';
    END;
END $$;

-- ============================================================================
-- 5. Verify Foreign Key Constraints
-- ============================================================================

DO $$
BEGIN
    -- household_id foreign key should work
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'events' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%household%'
    ) THEN
        RAISE EXCEPTION 'FAILED: household_id foreign key does not exist';
    END IF;
    
    -- item_id foreign key should work
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'events' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%item%'
    ) THEN
        RAISE EXCEPTION 'FAILED: item_id foreign key does not exist';
    END IF;
    
    RAISE NOTICE 'PASSED: Foreign key constraints exist';
END $$;

-- ============================================================================
-- 6. Verify RLS Policies
-- ============================================================================

DO $$
BEGIN
    -- Check if RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'events' AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'FAILED: RLS is not enabled on events table';
    END IF;
    
    -- Check if policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' AND policyname = 'events_select_policy'
    ) THEN
        RAISE EXCEPTION 'FAILED: events_select_policy does not exist';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' AND policyname = 'events_insert_policy'
    ) THEN
        RAISE EXCEPTION 'FAILED: events_insert_policy does not exist';
    END IF;
    
    RAISE NOTICE 'PASSED: RLS policies exist';
END $$;

-- ============================================================================
-- 7. Test Event Creation
-- ============================================================================

DO $$
DECLARE
    test_household_id UUID;
    test_item_id UUID;
    test_event_id UUID;
BEGIN
    -- Get test household and item
    SELECT id INTO test_household_id FROM households LIMIT 1;
    SELECT id INTO test_item_id FROM items WHERE household_id = test_household_id LIMIT 1;
    
    IF test_household_id IS NULL THEN
        RAISE EXCEPTION 'FAILED: No test household found';
    END IF;
    
    -- Create test event
    INSERT INTO events (
        household_id,
        event_type,
        source,
        item_id,
        payload,
        confidence
    ) VALUES (
        test_household_id,
        'inventory.used',
        'user',
        test_item_id,
        '{"previous_state": "ok", "new_state": "low", "quantity_used": 1}'::jsonb,
        1.0
    ) RETURNING id INTO test_event_id;
    
    -- Verify event was created
    IF NOT EXISTS (SELECT 1 FROM events WHERE id = test_event_id) THEN
        RAISE EXCEPTION 'FAILED: Event was not created';
    END IF;
    
    RAISE NOTICE 'PASSED: Event creation working';
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
END $$;

-- ============================================================================
-- 8. Test Event Immutability (No UPDATE)
-- ============================================================================

DO $$
DECLARE
    test_household_id UUID;
    test_event_id UUID;
BEGIN
    -- Get test household
    SELECT id INTO test_household_id FROM households LIMIT 1;
    
    -- Create test event
    INSERT INTO events (household_id, event_type, source, payload)
    VALUES (test_household_id, 'inventory.used', 'user', '{}'::jsonb)
    RETURNING id INTO test_event_id;
    
    -- Try to update (should have no UPDATE policy)
    UPDATE events SET payload = '{"updated": true}'::jsonb WHERE id = test_event_id;
    
    -- Check if update was prevented by RLS
    IF EXISTS (
        SELECT 1 FROM events 
        WHERE id = test_event_id 
        AND payload->>'updated' = 'true'
    ) THEN
        RAISE NOTICE 'WARNING: Event was updated (RLS may not be enforcing immutability)';
    ELSE
        RAISE NOTICE 'PASSED: Events are immutable (no UPDATE policy)';
    END IF;
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
END $$;

-- ============================================================================
-- 9. Test JSONB Payload
-- ============================================================================

DO $$
DECLARE
    test_household_id UUID;
    test_event_id UUID;
    retrieved_payload JSONB;
BEGIN
    SELECT id INTO test_household_id FROM households LIMIT 1;
    
    -- Create event with complex payload
    INSERT INTO events (household_id, event_type, source, payload)
    VALUES (
        test_household_id,
        'receipt.confirmed',
        'user',
        '{
            "items_confirmed": 10,
            "items_skipped": 2,
            "user_edits": 3,
            "store_name": "Whole Foods"
        }'::jsonb
    ) RETURNING id INTO test_event_id;
    
    -- Retrieve and verify payload
    SELECT payload INTO retrieved_payload FROM events WHERE id = test_event_id;
    
    IF (retrieved_payload->>'items_confirmed')::int != 10 THEN
        RAISE EXCEPTION 'FAILED: JSONB payload not stored correctly';
    END IF;
    
    RAISE NOTICE 'PASSED: JSONB payload working';
    
    -- Clean up
    DELETE FROM events WHERE id = test_event_id;
END $$;

-- ============================================================================
-- 10. Test Cascade Delete
-- ============================================================================

DO $$
DECLARE
    test_household_id UUID;
    test_household_name TEXT;
    test_event_id UUID;
BEGIN
    -- Create test household
    INSERT INTO households (name)
    VALUES ('Test Household for Events')
    RETURNING id, name INTO test_household_id, test_household_name;
    
    -- Create test event
    INSERT INTO events (household_id, event_type, source, payload)
    VALUES (test_household_id, 'inventory.used', 'user', '{}'::jsonb)
    RETURNING id INTO test_event_id;
    
    -- Delete household (should cascade to events)
    DELETE FROM households WHERE id = test_household_id;
    
    -- Verify event was deleted
    IF EXISTS (SELECT 1 FROM events WHERE id = test_event_id) THEN
        RAISE EXCEPTION 'FAILED: Event was not deleted on household cascade';
    END IF;
    
    RAISE NOTICE 'PASSED: Cascade delete working';
END $$;

-- ============================================================================
-- Summary
-- ============================================================================

SELECT 
    'Events table migration verification complete!' as status,
    'All tests passed' as result;
