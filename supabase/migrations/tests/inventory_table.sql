-- Test script for inventory table
-- This script tests the inventory table functionality with sample data

-- Start transaction for testing
BEGIN;

-- Test 1: Insert test data into households
INSERT INTO households (id, name) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Test Household 1'),
    ('22222222-2222-2222-2222-222222222222', 'Test Household 2')
ON CONFLICT (id) DO NOTHING;

-- Test 2: Insert test items
INSERT INTO items (id, household_id, name, category, location) VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Milk', 'dairy', 'fridge'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Eggs', 'dairy', 'fridge'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Bread', 'bakery', 'pantry'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Cheese', 'dairy', 'fridge')
ON CONFLICT (household_id, name) DO NOTHING;

-- Test 3: Insert inventory records with different states
INSERT INTO inventory (household_id, item_id, state, confidence, last_event_at) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'plenty', 0.95, NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ok', 0.85, NOW() - INTERVAL '2 days'),
    ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'low', 0.75, NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'almost_out', 0.90, NOW() - INTERVAL '4 days')
ON CONFLICT (item_id) DO NOTHING;

-- Test 4: Verify all states are valid
SELECT 'Test 4: Valid states' AS test_name,
    CASE 
        WHEN COUNT(*) = 4 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE state IN ('plenty', 'ok', 'low', 'almost_out', 'out');

-- Test 5: Verify confidence values are within range
SELECT 'Test 5: Confidence range' AS test_name,
    CASE 
        WHEN COUNT(*) = 4 AND MIN(confidence) >= 0.0 AND MAX(confidence) <= 1.0 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory;

-- Test 6: Verify unique constraint (one inventory per item)
DO $$
BEGIN
    BEGIN
        INSERT INTO inventory (household_id, item_id, state, confidence) 
        VALUES ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ok', 0.80);
        RAISE EXCEPTION 'Unique constraint failed - duplicate item_id allowed';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'Test 6: Unique constraint - PASS';
    END;
END $$;

-- Test 7: Verify foreign key to households
-- First insert a test item that doesn't have inventory yet
INSERT INTO items (id, household_id, name, category, location) VALUES 
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Test Item', 'other', 'pantry')
ON CONFLICT (household_id, name) DO NOTHING;

DO $$
BEGIN
    BEGIN
        INSERT INTO inventory (household_id, item_id, state) 
        VALUES ('99999999-9999-9999-9999-999999999999', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ok');
        RAISE EXCEPTION 'Foreign key constraint failed - invalid household_id allowed';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'Test 7: Foreign key to households - PASS';
    END;
END $$;

-- Test 8: Verify foreign key to items
DO $$
BEGIN
    BEGIN
        INSERT INTO inventory (household_id, item_id, state) 
        VALUES ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'ok');
        RAISE EXCEPTION 'Foreign key constraint failed - invalid item_id allowed';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'Test 8: Foreign key to items - PASS';
    END;
END $$;

-- Test 9: Verify invalid state is rejected
-- First insert another test item
INSERT INTO items (id, household_id, name, category, location) VALUES 
    ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Test Item 2', 'other', 'pantry')
ON CONFLICT (household_id, name) DO NOTHING;

DO $$
BEGIN
    BEGIN
        INSERT INTO inventory (household_id, item_id, state) 
        VALUES ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'invalid_state');
        RAISE EXCEPTION 'State constraint failed - invalid state allowed';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Test 9: State constraint - PASS';
    END;
END $$;

-- Test 10: Verify invalid confidence is rejected
-- First insert another test item
INSERT INTO items (id, household_id, name, category, location) VALUES 
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Test Item 3', 'other', 'pantry')
ON CONFLICT (household_id, name) DO NOTHING;

DO $$
BEGIN
    BEGIN
        INSERT INTO inventory (household_id, item_id, state, confidence) 
        VALUES ('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'ok', 1.5);
        RAISE EXCEPTION 'Confidence constraint failed - invalid confidence allowed';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Test 10: Confidence constraint - PASS';
    END;
END $$;

-- Test 11: Verify updated_at trigger works
UPDATE inventory 
SET state = 'low' 
WHERE item_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

SELECT 'Test 11: Updated_at trigger' AS test_name,
    CASE 
        WHEN updated_at > created_at THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE item_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Test 12: Verify cascade delete from households
DELETE FROM households WHERE id = '22222222-2222-2222-2222-222222222222';

SELECT 'Test 12: Cascade delete from households' AS test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE household_id = '22222222-2222-2222-2222-222222222222';

-- Test 13: Verify cascade delete from items
DELETE FROM items WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

SELECT 'Test 13: Cascade delete from items' AS test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE item_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Test 14: Query by state (for restock list)
SELECT 'Test 14: Query by state' AS test_name,
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE state IN ('low', 'almost_out', 'out');

-- Test 15: Query by household with state filter
SELECT 'Test 15: Household + state query' AS test_name,
    CASE 
        WHEN COUNT(*) >= 1 THEN 'PASS'
        ELSE 'FAIL'
    END AS result
FROM inventory
WHERE household_id = '11111111-1111-1111-1111-111111111111'
AND state = 'low';

-- Display final inventory state
SELECT 
    i.state,
    i.confidence,
    i.last_event_at,
    it.name AS item_name,
    it.category,
    it.location,
    h.name AS household_name
FROM inventory i
JOIN items it ON i.item_id = it.id
JOIN households h ON i.household_id = h.id
ORDER BY i.state, it.name;

-- Rollback to clean up test data
ROLLBACK;

-- Final message
SELECT '✓ All inventory table tests completed' AS status;
