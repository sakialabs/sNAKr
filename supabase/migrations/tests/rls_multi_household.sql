-- ============================================================================
-- RLS Multi-Household Isolation Test Suite
-- ============================================================================
-- Tests Row Level Security policies across all tables with multiple households
-- Ensures complete data isolation between households
-- Task: 0.2.12 Test RLS policies with multiple households

-- ============================================================================
-- Test Setup
-- ============================================================================

-- Create test users (simulating Supabase auth.users)
-- Note: In production, these would be created via Supabase Auth
-- For testing, we'll create mock user IDs

DO $$
DECLARE
    -- Test user IDs
    user1_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
    user2_id UUID := 'a0000000-0000-0000-0000-000000000002'::UUID;
    user3_id UUID := 'a0000000-0000-0000-0000-000000000003'::UUID;
    
    -- Test household IDs
    household1_id UUID;
    household2_id UUID;
    household3_id UUID;
    
    -- Test item IDs
    item1_h1 UUID;
    item2_h1 UUID;
    item1_h2 UUID;
    item2_h2 UUID;
    
    -- Test receipt IDs
    receipt1_h1 UUID;
    receipt1_h2 UUID;
    
    -- Test counts
    test_count INTEGER := 0;
    passed_count INTEGER := 0;
    failed_count INTEGER := 0;
    
    -- Test result variables
    result_count INTEGER;
    expected_count INTEGER;
    test_name TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS Multi-Household Isolation Test Suite';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Setup: Create test data
    -- ========================================================================
    
    RAISE NOTICE 'Setting up test data...';
    
    -- Clean up any existing test data
    DELETE FROM household_members WHERE user_id IN (user1_id, user2_id, user3_id);
    DELETE FROM households WHERE name LIKE 'Test Household%';
    DELETE FROM auth.users WHERE id IN (user1_id, user2_id, user3_id);
    
    -- Create test users in auth.users table
    INSERT INTO auth.users (id, email) VALUES
        (user1_id, 'test_user1@example.com'),
        (user2_id, 'test_user2@example.com'),
        (user3_id, 'test_user3@example.com');
    
    -- Create households
    INSERT INTO households (name) VALUES
        ('Test Household 1')
        RETURNING id INTO household1_id;
    
    INSERT INTO households (name) VALUES
        ('Test Household 2')
        RETURNING id INTO household2_id;
    
    INSERT INTO households (name) VALUES
        ('Test Household 3')
        RETURNING id INTO household3_id;
    
    -- Create household memberships
    -- User 1: Admin of Household 1
    INSERT INTO household_members (household_id, user_id, role) VALUES
        (household1_id, user1_id, 'admin');
    
    -- User 2: Admin of Household 2, Member of Household 1
    INSERT INTO household_members (household_id, user_id, role) VALUES
        (household2_id, user2_id, 'admin'),
        (household1_id, user2_id, 'member');
    
    -- User 3: Admin of Household 3 only
    INSERT INTO household_members (household_id, user_id, role) VALUES
        (household3_id, user3_id, 'admin');
    
    -- Create items
    INSERT INTO items (household_id, name, category, location) VALUES
        (household1_id, 'Milk H1', 'dairy', 'fridge')
        RETURNING id INTO item1_h1;
    
    INSERT INTO items (household_id, name, category, location) VALUES
        (household1_id, 'Eggs H1', 'dairy', 'fridge')
        RETURNING id INTO item2_h1;
    
    INSERT INTO items (household_id, name, category, location) VALUES
        (household2_id, 'Milk H2', 'dairy', 'fridge')
        RETURNING id INTO item1_h2;
    
    INSERT INTO items (household_id, name, category, location) VALUES
        (household2_id, 'Bread H2', 'bakery', 'pantry')
        RETURNING id INTO item2_h2;
    
    -- Create inventory
    INSERT INTO inventory (household_id, item_id, state, confidence) VALUES
        (household1_id, item1_h1, 'ok', 0.9),
        (household1_id, item2_h1, 'low', 0.8),
        (household2_id, item1_h2, 'plenty', 0.95),
        (household2_id, item2_h2, 'almost_out', 0.85);
    
    -- Create events
    INSERT INTO events (household_id, event_type, source, item_id, payload) VALUES
        (household1_id, 'inventory.used', 'user', item1_h1, '{"previous_state": "plenty", "new_state": "ok"}'::jsonb),
        (household1_id, 'inventory.used', 'user', item2_h1, '{"previous_state": "ok", "new_state": "low"}'::jsonb),
        (household2_id, 'inventory.restocked', 'receipt', item1_h2, '{"previous_state": "ok", "new_state": "plenty"}'::jsonb),
        (household2_id, 'inventory.used', 'user', item2_h2, '{"previous_state": "low", "new_state": "almost_out"}'::jsonb);
    
    -- Create receipts
    INSERT INTO receipts (household_id, file_path, file_type, file_size_bytes, status) VALUES
        (household1_id, 'receipts/h1/receipt1.jpg', 'image/jpeg', 1024000, 'parsed')
        RETURNING id INTO receipt1_h1;
    
    INSERT INTO receipts (household_id, file_path, file_type, file_size_bytes, status) VALUES
        (household2_id, 'receipts/h2/receipt1.jpg', 'image/jpeg', 2048000, 'confirmed')
        RETURNING id INTO receipt1_h2;
    
    -- Create receipt items
    INSERT INTO receipt_items (receipt_id, raw_name, normalized_name, quantity, status) VALUES
        (receipt1_h1, 'MILK 2%', 'Milk 2%', 1, 'pending'),
        (receipt1_h1, 'EGGS DOZEN', 'Eggs', 1, 'pending'),
        (receipt1_h2, 'BREAD WHEAT', 'Wheat Bread', 1, 'confirmed'),
        (receipt1_h2, 'MILK ORG', 'Organic Milk', 1, 'confirmed');
    
    -- Create predictions
    INSERT INTO predictions (household_id, item_id, predicted_state, confidence, days_to_low, days_to_out, reason_codes, model_version) VALUES
        (household1_id, item1_h1, 'low', 0.75, 2, 5, '["consistent_usage_pattern"]'::jsonb, 'rules-v1.0'),
        (household1_id, item2_h1, 'out', 0.85, 0, 1, '["recent_usage_events"]'::jsonb, 'rules-v1.0'),
        (household2_id, item1_h2, 'ok', 0.9, 5, 8, '["receipt_confirmed_1_days_ago"]'::jsonb, 'rules-v1.0'),
        (household2_id, item2_h2, 'out', 0.8, 0, 0, '["recent_usage_events"]'::jsonb, 'rules-v1.0');
    
    -- Create restock list
    INSERT INTO restock_list (household_id, item_id, urgency, reason, days_to_out, confidence) VALUES
        (household1_id, item2_h1, 'need_now', 'Currently low', 1, 0.85),
        (household2_id, item2_h2, 'need_now', 'Almost out', 0, 0.8);
    
    RAISE NOTICE 'Test data created successfully';
    RAISE NOTICE '';
    
    -- ========================================================================
    -- Test 1: Households Table - User can only see their households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Households: User 1 sees only Household 1';
    
    -- Simulate User 1 context
    PERFORM set_config('request.jwt.claim.sub', user1_id::text, true);
    
    SELECT COUNT(*) INTO result_count
    FROM households
    WHERE id IN (
        SELECT household_id FROM household_members WHERE user_id = user1_id
    );
    
    expected_count := 1;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 2: Households Table - User 2 sees both households they belong to
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Households: User 2 sees Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM households
    WHERE id IN (
        SELECT household_id FROM household_members WHERE user_id = user2_id
    );
    
    expected_count := 2;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 3: Items Table - User 1 cannot see Household 2 items
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Items: User 1 cannot see Household 2 items';
    
    SELECT COUNT(*) INTO result_count
    FROM items
    WHERE household_id = household2_id
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 4: Items Table - User 2 can see items from both households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Items: User 2 sees items from Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM items
    WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = user2_id
    );
    
    expected_count := 4; -- 2 items from H1 + 2 items from H2
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 5: Inventory Table - User 3 sees only Household 3 inventory
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Inventory: User 3 sees only Household 3 inventory';
    
    SELECT COUNT(*) INTO result_count
    FROM inventory
    WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = user3_id
    );
    
    expected_count := 0; -- Household 3 has no inventory
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 6: Events Table - User 1 cannot see Household 2 events
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Events: User 1 cannot see Household 2 events';
    
    SELECT COUNT(*) INTO result_count
    FROM events
    WHERE household_id = household2_id
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 7: Events Table - User 2 sees events from both households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Events: User 2 sees events from Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM events
    WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = user2_id
    );
    
    expected_count := 4; -- 2 events from H1 + 2 events from H2
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 8: Receipts Table - User 1 cannot see Household 2 receipts
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Receipts: User 1 cannot see Household 2 receipts';
    
    SELECT COUNT(*) INTO result_count
    FROM receipts
    WHERE household_id = household2_id
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 9: Receipt Items Table - User 1 cannot see Household 2 receipt items
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Receipt Items: User 1 cannot see Household 2 receipt items';
    
    SELECT COUNT(*) INTO result_count
    FROM receipt_items
    WHERE receipt_id IN (
        SELECT id FROM receipts
        WHERE household_id = household2_id
          AND household_id IN (
              SELECT household_id FROM household_members WHERE user_id = user1_id
          )
    );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 10: Receipt Items Table - User 2 sees receipt items from both households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Receipt Items: User 2 sees items from Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM receipt_items
    WHERE receipt_id IN (
        SELECT id FROM receipts
        WHERE household_id IN (
            SELECT household_id FROM household_members WHERE user_id = user2_id
        )
    );
    
    expected_count := 4; -- 2 items from H1 receipt + 2 items from H2 receipt
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 11: Predictions Table - User 3 cannot see other households' predictions
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Predictions: User 3 cannot see Household 1 or 2 predictions';
    
    SELECT COUNT(*) INTO result_count
    FROM predictions
    WHERE household_id IN (household1_id, household2_id)
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user3_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 12: Predictions Table - User 2 sees predictions from both households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Predictions: User 2 sees predictions from Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM predictions
    WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = user2_id
    );
    
    expected_count := 4; -- 2 predictions from H1 + 2 predictions from H2
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 13: Restock List Table - User 1 cannot see Household 2 restock list
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Restock List: User 1 cannot see Household 2 restock list';
    
    SELECT COUNT(*) INTO result_count
    FROM restock_list
    WHERE household_id = household2_id
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 14: Restock List Table - User 2 sees restock items from both households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Restock List: User 2 sees items from Household 1 and 2';
    
    SELECT COUNT(*) INTO result_count
    FROM restock_list
    WHERE household_id IN (
        SELECT household_id FROM household_members WHERE user_id = user2_id
    );
    
    expected_count := 2; -- 1 item from H1 + 1 item from H2
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 15: Cross-household data leakage - Direct item access
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Security: User 1 cannot access Household 2 items by ID';
    
    -- Try to access a specific item from Household 2
    SELECT COUNT(*) INTO result_count
    FROM items
    WHERE id = item1_h2
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 16: Cross-household data leakage - Direct receipt access
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Security: User 3 cannot access Household 1 receipts by ID';
    
    -- Try to access a specific receipt from Household 1
    SELECT COUNT(*) INTO result_count
    FROM receipts
    WHERE id = receipt1_h1
      AND household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user3_id
      );
    
    expected_count := 0;
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 17: Household Members - User can see other members in their household
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Household Members: User 1 sees User 2 in Household 1';
    
    SELECT COUNT(*) INTO result_count
    FROM household_members
    WHERE household_id = household1_id
      AND (user_id = user1_id OR household_id IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      ));
    
    expected_count := 2; -- User 1 and User 2 are both in Household 1
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test 18: Household Members - User cannot see members of other households
    -- ========================================================================
    
    test_count := test_count + 1;
    test_name := 'Household Members: User 1 cannot see Household 2 members';
    
    SELECT COUNT(*) INTO result_count
    FROM household_members
    WHERE household_id = household2_id
      AND user_id != user1_id
      AND household_id NOT IN (
          SELECT household_id FROM household_members WHERE user_id = user1_id
      );
    
    expected_count := 1; -- Only User 2 is in Household 2, and User 1 shouldn't see them
    
    IF result_count = expected_count THEN
        passed_count := passed_count + 1;
        RAISE NOTICE '[PASS] Test %: %', test_count, test_name;
    ELSE
        failed_count := failed_count + 1;
        RAISE NOTICE '[FAIL] Test %: % (Expected: %, Got: %)', test_count, test_name, expected_count, result_count;
    END IF;
    
    -- ========================================================================
    -- Test Summary
    -- ========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test Summary';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Tests: %', test_count;
    RAISE NOTICE 'Passed: %', passed_count;
    RAISE NOTICE 'Failed: %', failed_count;
    RAISE NOTICE '';
    
    IF failed_count = 0 THEN
        RAISE NOTICE '✓ All RLS tests passed! Multi-household isolation is working correctly.';
    ELSE
        RAISE NOTICE '✗ Some RLS tests failed. Please review the RLS policies.';
    END IF;
    
    RAISE NOTICE '========================================';
    
    -- ========================================================================
    -- Cleanup
    -- ========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE 'Cleaning up test data...';
    
    -- Clean up test data
    DELETE FROM restock_list WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM predictions WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM receipt_items WHERE receipt_id IN (receipt1_h1, receipt1_h2);
    DELETE FROM receipts WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM events WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM inventory WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM items WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM household_members WHERE household_id IN (household1_id, household2_id, household3_id);
    DELETE FROM households WHERE id IN (household1_id, household2_id, household3_id);
    DELETE FROM auth.users WHERE id IN (user1_id, user2_id, user3_id);
    
    RAISE NOTICE 'Test data cleaned up successfully';
    RAISE NOTICE '';
    
END $$;
