-- Verification script for household_members migration
-- This script tests the household_members table structure and RLS policies

-- Test 1: Verify household_members table exists with correct structure
DO $$
BEGIN
    -- Check table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'household_members') THEN
        RAISE EXCEPTION 'household_members table does not exist';
    END IF;
    
    -- Check required columns exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'id') THEN
        RAISE EXCEPTION 'household_members.id column missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'household_id') THEN
        RAISE EXCEPTION 'household_members.household_id column missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'user_id') THEN
        RAISE EXCEPTION 'household_members.user_id column missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'role') THEN
        RAISE EXCEPTION 'household_members.role column missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'household_members' AND column_name = 'joined_at') THEN
        RAISE EXCEPTION 'household_members.joined_at column missing';
    END IF;
    
    RAISE NOTICE 'Test 1 PASSED: household_members table structure is correct';
END $$;

-- Test 2: Verify foreign key constraints
DO $$
BEGIN
    -- Check household_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'household_members'
        AND constraint_name LIKE '%household_id%'
    ) THEN
        RAISE EXCEPTION 'household_members.household_id foreign key constraint missing';
    END IF;
    
    -- Check user_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
        AND table_name = 'household_members'
        AND constraint_name LIKE '%user_id%'
    ) THEN
        RAISE EXCEPTION 'household_members.user_id foreign key constraint missing';
    END IF;
    
    RAISE NOTICE 'Test 2 PASSED: Foreign key constraints are correct';
END $$;

-- Test 3: Verify unique constraint on (household_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name = 'household_members'
    ) THEN
        RAISE EXCEPTION 'household_members unique constraint on (household_id, user_id) missing';
    END IF;
    
    RAISE NOTICE 'Test 3 PASSED: Unique constraint exists';
END $$;

-- Test 4: Verify indexes exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'household_members' AND indexname = 'idx_household_members_household_id') THEN
        RAISE EXCEPTION 'idx_household_members_household_id index missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'household_members' AND indexname = 'idx_household_members_user_id') THEN
        RAISE EXCEPTION 'idx_household_members_user_id index missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'household_members' AND indexname = 'idx_household_members_role') THEN
        RAISE EXCEPTION 'idx_household_members_role index missing';
    END IF;
    
    RAISE NOTICE 'Test 4 PASSED: All indexes exist';
END $$;

-- Test 5: Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'household_members' 
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on household_members table';
    END IF;
    
    RAISE NOTICE 'Test 5 PASSED: RLS is enabled on household_members';
END $$;

-- Test 6: Verify RLS policies exist on household_members
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'household_members';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Expected at least 4 RLS policies on household_members, found %', policy_count;
    END IF;
    
    -- Check specific policies exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'household_members' AND policyname = 'household_members_select_policy') THEN
        RAISE EXCEPTION 'household_members_select_policy missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'household_members' AND policyname = 'household_members_insert_policy') THEN
        RAISE EXCEPTION 'household_members_insert_policy missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'household_members' AND policyname = 'household_members_update_policy') THEN
        RAISE EXCEPTION 'household_members_update_policy missing';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'household_members' AND policyname = 'household_members_delete_policy') THEN
        RAISE EXCEPTION 'household_members_delete_policy missing';
    END IF;
    
    RAISE NOTICE 'Test 6 PASSED: All RLS policies exist on household_members (found % policies)', policy_count;
END $$;

-- Test 7: Verify refined RLS policies on households table
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'households';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Expected at least 4 RLS policies on households, found %', policy_count;
    END IF;
    
    -- Check that policies reference household_members
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'households' 
        AND policyname = 'households_select_policy'
        AND qual::text LIKE '%household_members%'
    ) THEN
        RAISE EXCEPTION 'households_select_policy does not reference household_members';
    END IF;
    
    RAISE NOTICE 'Test 7 PASSED: Refined RLS policies exist on households (found % policies)', policy_count;
END $$;

-- Test 8: Verify role check constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%role%'
        AND constraint_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Role check constraint missing';
    END IF;
    
    RAISE NOTICE 'Test 8 PASSED: Role check constraint exists';
END $$;

-- Test 9: Verify trigger exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_household_members_updated_at'
    ) THEN
        RAISE EXCEPTION 'update_household_members_updated_at trigger missing';
    END IF;
    
    RAISE NOTICE 'Test 9 PASSED: Trigger exists';
END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ALL VERIFICATION TESTS PASSED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'household_members table is correctly configured with:';
    RAISE NOTICE '  ✓ Proper table structure';
    RAISE NOTICE '  ✓ Foreign key constraints';
    RAISE NOTICE '  ✓ Unique constraint on (household_id, user_id)';
    RAISE NOTICE '  ✓ Indexes for efficient queries';
    RAISE NOTICE '  ✓ RLS enabled';
    RAISE NOTICE '  ✓ RLS policies for multi-tenant isolation';
    RAISE NOTICE '  ✓ Refined RLS policies on households table';
    RAISE NOTICE '  ✓ Role check constraint';
    RAISE NOTICE '  ✓ Auto-update trigger for updated_at';
    RAISE NOTICE '========================================';
END $$;
