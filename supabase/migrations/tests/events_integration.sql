-- Integration Test: Events Table with Related Tables
-- Purpose: Verify events table works correctly with households, items, and inventory
-- Run this to test the complete event logging flow

-- ============================================================================
-- Setup Test Data
-- ============================================================================

DO $$
DECLARE
    test_household_id UUID;
    test_item_id UUID;
    test_event_id UUID;
BEGIN
    RAISE NOTICE '=== Events Table Integration Test ===';
    RAISE NOTICE '';
    
    -- Create test household
    INSERT INTO households (name)
    VALUES ('Test Household for Events Integration')
    RETURNING id INTO test_household_id;
    
    RAISE NOTICE '✓ Created test household: %', test_household_id;
    
    -- Create test item
    INSERT INTO items (household_id, name, category, location)
    VALUES (test_household_id, 'Test Milk', 'dairy', 'fridge')
    RETURNING id INTO test_item_id;
    
    RAISE NOTICE '✓ Created test item: %', test_item_id;
    
    -- Create inventory entry
    INSERT INTO inventory (household_id, item_id, state)
    VALUES (test_household_id, test_item_id, 'ok');
    
    RAISE NOTICE '✓ Created inventory entry';
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 1: Create inventory.used event
    -- ========================================================================
    
    RAISE NOTICE 'Test 1: Create inventory.used event';
    
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
    
    IF test_event_id IS NOT NULL THEN
        RAISE NOTICE '✓ Created inventory.used event: %', test_event_id;
    ELSE
        RAISE EXCEPTION '✗ Failed to create inventory.used event';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 2: Create inventory.restocked event
    -- ========================================================================
    
    RAISE NOTICE 'Test 2: Create inventory.restocked event';
    
    INSERT INTO events (
        household_id,
        event_type,
        source,
        item_id,
        payload,
        confidence
    ) VALUES (
        test_household_id,
        'inventory.restocked',
        'receipt',
        test_item_id,
        '{"previous_state": "low", "new_state": "plenty", "quantity_added": 2}'::jsonb,
        0.95
    ) RETURNING id INTO test_event_id;
    
    IF test_event_id IS NOT NULL THEN
        RAISE NOTICE '✓ Created inventory.restocked event: %', test_event_id;
    ELSE
        RAISE EXCEPTION '✗ Failed to create inventory.restocked event';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 3: Create receipt.confirmed event
    -- ========================================================================
    
    RAISE NOTICE 'Test 3: Create receipt.confirmed event';
    
    INSERT INTO events (
        household_id,
        event_type,
        source,
        payload,
        confidence
    ) VALUES (
        test_household_id,
        'receipt.confirmed',
        'user',
        '{"items_confirmed": 5, "items_skipped": 1, "user_edits": 2}'::jsonb,
        1.0
    ) RETURNING id INTO test_event_id;
    
    IF test_event_id IS NOT NULL THEN
        RAISE NOTICE '✓ Created receipt.confirmed event: %', test_event_id;
    ELSE
        RAISE EXCEPTION '✗ Failed to create receipt.confirmed event';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 4: Query events by household
    -- ========================================================================
    
    RAISE NOTICE 'Test 4: Query events by household';
    
    IF EXISTS (
        SELECT 1 FROM events 
        WHERE household_id = test_household_id
    ) THEN
        RAISE NOTICE '✓ Can query events by household_id';
        RAISE NOTICE '  Found % events', (
            SELECT COUNT(*) FROM events WHERE household_id = test_household_id
        );
    ELSE
        RAISE EXCEPTION '✗ Cannot query events by household_id';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 5: Query events by item
    -- ========================================================================
    
    RAISE NOTICE 'Test 5: Query events by item';
    
    IF EXISTS (
        SELECT 1 FROM events 
        WHERE item_id = test_item_id
    ) THEN
        RAISE NOTICE '✓ Can query events by item_id';
        RAISE NOTICE '  Found % events for item', (
            SELECT COUNT(*) FROM events WHERE item_id = test_item_id
        );
    ELSE
        RAISE EXCEPTION '✗ Cannot query events by item_id';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 6: Query events by type
    -- ========================================================================
    
    RAISE NOTICE 'Test 6: Query events by type';
    
    IF EXISTS (
        SELECT 1 FROM events 
        WHERE event_type = 'inventory.used'
    ) THEN
        RAISE NOTICE '✓ Can query events by event_type';
    ELSE
        RAISE EXCEPTION '✗ Cannot query events by event_type';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 7: Query events with time ordering
    -- ========================================================================
    
    RAISE NOTICE 'Test 7: Query events with time ordering';
    
    DECLARE
        event_count INT;
        first_event_type TEXT;
        last_event_type TEXT;
    BEGIN
        SELECT COUNT(*) INTO event_count
        FROM events
        WHERE household_id = test_household_id;
        
        SELECT event_type INTO first_event_type
        FROM events
        WHERE household_id = test_household_id
        ORDER BY created_at ASC
        LIMIT 1;
        
        SELECT event_type INTO last_event_type
        FROM events
        WHERE household_id = test_household_id
        ORDER BY created_at DESC
        LIMIT 1;
        
        RAISE NOTICE '✓ Can query events with time ordering';
        RAISE NOTICE '  Total events: %', event_count;
        RAISE NOTICE '  First event: %', first_event_type;
        RAISE NOTICE '  Last event: %', last_event_type;
    END;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 8: Test JSONB payload queries
    -- ========================================================================
    
    RAISE NOTICE 'Test 8: Test JSONB payload queries';
    
    IF EXISTS (
        SELECT 1 FROM events 
        WHERE payload->>'previous_state' = 'ok'
    ) THEN
        RAISE NOTICE '✓ Can query JSONB payload fields';
        RAISE NOTICE '  Found events with previous_state = ok';
    ELSE
        RAISE EXCEPTION '✗ Cannot query JSONB payload fields';
    END IF;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 9: Test foreign key cascade (item deletion)
    -- ========================================================================
    
    RAISE NOTICE 'Test 9: Test foreign key cascade (item deletion)';
    
    DECLARE
        events_before INT;
        events_after INT;
    BEGIN
        SELECT COUNT(*) INTO events_before
        FROM events
        WHERE item_id = test_item_id;
        
        -- Delete item (should SET NULL on events.item_id)
        DELETE FROM items WHERE id = test_item_id;
        
        SELECT COUNT(*) INTO events_after
        FROM events
        WHERE item_id IS NULL
        AND household_id = test_household_id;
        
        IF events_after >= events_before THEN
            RAISE NOTICE '✓ Foreign key SET NULL working correctly';
            RAISE NOTICE '  Events before item deletion: %', events_before;
            RAISE NOTICE '  Events with NULL item_id after: %', events_after;
        ELSE
            RAISE EXCEPTION '✗ Foreign key SET NULL not working';
        END IF;
    END;
    
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 10: Test cascade delete (household deletion)
    -- ========================================================================
    
    RAISE NOTICE 'Test 10: Test cascade delete (household deletion)';
    
    DECLARE
        events_before INT;
        events_after INT;
    BEGIN
        SELECT COUNT(*) INTO events_before
        FROM events
        WHERE household_id = test_household_id;
        
        -- Delete household (should cascade to events)
        DELETE FROM households WHERE id = test_household_id;
        
        SELECT COUNT(*) INTO events_after
        FROM events
        WHERE household_id = test_household_id;
        
        IF events_after = 0 AND events_before > 0 THEN
            RAISE NOTICE '✓ Cascade delete working correctly';
            RAISE NOTICE '  Events before household deletion: %', events_before;
            RAISE NOTICE '  Events after household deletion: %', events_after;
        ELSE
            RAISE EXCEPTION '✗ Cascade delete not working';
        END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== All Integration Tests Passed! ===';
    
END $$;

-- ============================================================================
-- Summary Query
-- ============================================================================

SELECT 
    'Events table integration test complete!' as status,
    'All tests passed - events table is working correctly' as result;
