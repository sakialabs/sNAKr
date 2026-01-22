-- Simple trigger test
DO $$
DECLARE
    test_household_id UUID;
    test_item_id UUID;
    test_inventory_id UUID;
    created_time TIMESTAMPTZ;
    updated_time TIMESTAMPTZ;
BEGIN
    -- Create test data
    INSERT INTO households (name) VALUES ('Trigger Test') RETURNING id INTO test_household_id;
    INSERT INTO items (household_id, name, category, location)
    VALUES (test_household_id, 'Test Item', 'dairy', 'fridge') RETURNING id INTO test_item_id;
    
    -- Create inventory
    INSERT INTO inventory (household_id, item_id, state, confidence)
    VALUES (test_household_id, test_item_id, 'ok', 0.85) RETURNING id INTO test_inventory_id;
    
    -- Get created_at
    SELECT created_at INTO created_time FROM inventory WHERE id = test_inventory_id;
    
    -- Wait a moment
    PERFORM pg_sleep(1);
    
    -- Update the record
    UPDATE inventory SET state = 'low' WHERE id = test_inventory_id;
    
    -- Get updated_at
    SELECT updated_at INTO updated_time FROM inventory WHERE id = test_inventory_id;
    
    -- Compare
    RAISE NOTICE 'Created at: %', created_time;
    RAISE NOTICE 'Updated at: %', updated_time;
    
    IF updated_time > created_time THEN
        RAISE NOTICE '✓ Trigger is working!';
    ELSE
        RAISE NOTICE '✗ Trigger is NOT working';
    END IF;
    
    -- Cleanup
    DELETE FROM households WHERE id = test_household_id;
END
$$;
