-- Comprehensive test for inventory table
-- Tests all constraints, triggers, and basic functionality

DO $$
DECLARE
    test_household_id UUID;
    test_item_id UUID;
    test_inventory_id UUID;
BEGIN
    RAISE NOTICE '=== Testing Inventory Table ===';
    
    -- Create a test household
    INSERT INTO households (name) VALUES ('Test Household')
    RETURNING id INTO test_household_id;
    
    -- Create a test item
    INSERT INTO items (household_id, name, category, location)
    VALUES (test_household_id, 'Test Milk', 'dairy', 'fridge')
    RETURNING id INTO test_item_id;
    
    -- Test 1: Create inventory record
    INSERT INTO inventory (household_id, item_id, state, confidence)
    VALUES (test_household_id, test_item_id, 'ok', 0.85)
    RETURNING id INTO test_inventory_id;
    
    IF EXISTS (SELECT 1 FROM inventory WHERE id = test_inventory_id) THEN
        RAISE NOTICE '✓ Test 1: Inventory record created successfully';
    ELSE
        RAISE EXCEPTION 'Test 1 FAILED: Could not create inventory record';
    END IF;
    
    -- Test 2: State constraint (should fail with invalid state)
    BEGIN
        INSERT INTO inventory (household_id, item_id, state, confidence)
        VALUES (test_household_id, test_item_id, 'invalid_state', 0.85);
        RAISE EXCEPTION 'Test 2 FAILED: Invalid state was accepted';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Test 2: State constraint working correctly';
    END;
    
    -- Test 3: Confidence constraint (should fail with value > 1.0)
    BEGIN
        INSERT INTO inventory (household_id, item_id, state, confidence)
        VALUES (test_household_id, test_item_id, 'ok', 1.5);
        RAISE EXCEPTION 'Test 3 FAILED: Invalid confidence was accepted';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE '✓ Test 3: Confidence constraint working correctly';
    END;
    
    -- Test 4: Unique item constraint (should fail with duplicate item)
    BEGIN
        INSERT INTO inventory (household_id, item_id, state, confidence)
        VALUES (test_household_id, test_item_id, 'low', 0.75);
        RAISE EXCEPTION 'Test 4 FAILED: Duplicate item was accepted';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '✓ Test 4: Unique item constraint working correctly';
    END;
    
    -- Test 5: Updated_at trigger
    PERFORM pg_sleep(0.1);
    UPDATE inventory SET state = 'low' WHERE id = test_inventory_id;
    
    IF (SELECT updated_at > created_at FROM inventory WHERE id = test_inventory_id) THEN
        RAISE NOTICE '✓ Test 5: Updated_at trigger working correctly';
    ELSE
        RAISE EXCEPTION 'Test 5 FAILED: Updated_at trigger not working';
    END IF;
    
    -- Test 6: All valid states
    UPDATE inventory SET state = 'plenty' WHERE id = test_inventory_id;
    UPDATE inventory SET state = 'ok' WHERE id = test_inventory_id;
    UPDATE inventory SET state = 'low' WHERE id = test_inventory_id;
    UPDATE inventory SET state = 'almost_out' WHERE id = test_inventory_id;
    UPDATE inventory SET state = 'out' WHERE id = test_inventory_id;
    RAISE NOTICE '✓ Test 6: All valid states accepted';
    
    -- Test 7: Cascade delete (item deletion should delete inventory)
    DELETE FROM items WHERE id = test_item_id;
    IF NOT EXISTS (SELECT 1 FROM inventory WHERE id = test_inventory_id) THEN
        RAISE NOTICE '✓ Test 7: Cascade delete working correctly';
    ELSE
        RAISE EXCEPTION 'Test 7 FAILED: Cascade delete not working';
    END IF;
    
    -- Clean up
    DELETE FROM households WHERE id = test_household_id;
    
    RAISE NOTICE '=== All inventory table tests passed! ===';
END
$$;
