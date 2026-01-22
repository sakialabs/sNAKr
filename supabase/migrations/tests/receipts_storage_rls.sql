-- Integration test for receipts storage bucket RLS policies
-- Task: 0.2.13 Set up Supabase Storage bucket for receipts
-- This test verifies that RLS policies correctly restrict access to household members

-- ============================================================================
-- Test Setup
-- ============================================================================

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alice@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'bob@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test households
INSERT INTO households (id, name, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alice & Bob Household', NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Charlie Household', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add household members
-- Alice and Bob are in Household A
-- Charlie is in Household B
INSERT INTO household_members (household_id, user_id, role, joined_at, created_at, updated_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin', NOW(), NOW(), NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member', NOW(), NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'admin', NOW(), NOW(), NOW())
ON CONFLICT (household_id, user_id) DO NOTHING;

-- Create test receipt records
INSERT INTO receipts (id, household_id, file_path, file_type, file_size_bytes, status, created_at, updated_at)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/receipt1.jpg', 'image/jpeg', 1024000, 'uploaded', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/receipt2.jpg', 'image/jpeg', 2048000, 'uploaded', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Simulate storage objects (files in the bucket)
-- Note: In a real scenario, these would be created via the Storage API
-- For testing RLS, we insert directly into storage.objects
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata)
VALUES 
    ('receipts', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/receipt1.jpg', '11111111-1111-1111-1111-111111111111', NOW(), NOW(), NOW(), '{"size": 1024000, "mimetype": "image/jpeg"}'::jsonb),
    ('receipts', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/receipt2.jpg', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW(), '{"size": 2048000, "mimetype": "image/jpeg"}'::jsonb)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- ============================================================================
-- Test 1: Alice can access her household's receipt
-- ============================================================================
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "11111111-1111-1111-1111-111111111111"}';

SELECT 
    'Test 1: Alice can access Household A receipt' as test_name,
    CASE 
        WHEN COUNT(*) = 1 THEN 'PASS'
        ELSE 'FAIL: Expected 1 row, got ' || COUNT(*)
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND name = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/receipt1.jpg';

-- ============================================================================
-- Test 2: Alice cannot access Charlie's household receipt
-- ============================================================================
SELECT 
    'Test 2: Alice cannot access Household B receipt' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL: Expected 0 rows, got ' || COUNT(*) || ' (security breach!)'
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND name = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/receipt2.jpg';

-- ============================================================================
-- Test 3: Bob (member) can access his household's receipt
-- ============================================================================
SET LOCAL request.jwt.claims TO '{"sub": "22222222-2222-2222-2222-222222222222"}';

SELECT 
    'Test 3: Bob can access Household A receipt' as test_name,
    CASE 
        WHEN COUNT(*) = 1 THEN 'PASS'
        ELSE 'FAIL: Expected 1 row, got ' || COUNT(*)
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND name = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/receipt1.jpg';

-- ============================================================================
-- Test 4: Charlie can only see his own household's receipt
-- ============================================================================
SET LOCAL request.jwt.claims TO '{"sub": "33333333-3333-3333-3333-333333333333"}';

SELECT 
    'Test 4: Charlie can access Household B receipt' as test_name,
    CASE 
        WHEN COUNT(*) = 1 THEN 'PASS'
        ELSE 'FAIL: Expected 1 row, got ' || COUNT(*)
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND name = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/receipt2.jpg';

SELECT 
    'Test 5: Charlie cannot access Household A receipt' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS'
        ELSE 'FAIL: Expected 0 rows, got ' || COUNT(*) || ' (security breach!)'
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND name = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/receipt1.jpg';

-- ============================================================================
-- Test 6: Verify file path structure enforces household isolation
-- ============================================================================
-- Reset to Alice's context
SET LOCAL request.jwt.claims TO '{"sub": "11111111-1111-1111-1111-111111111111"}';

SELECT 
    'Test 6: File path structure enforces household isolation' as test_name,
    CASE 
        WHEN COUNT(*) = 1 THEN 'PASS'
        ELSE 'FAIL: Expected 1 row, got ' || COUNT(*) || ' (path structure issue!)'
    END as result
FROM storage.objects
WHERE bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] IN (
      SELECT household_id::text
      FROM household_members
      WHERE user_id = '11111111-1111-1111-1111-111111111111'
  );

-- ============================================================================
-- Test Summary
-- ============================================================================
RESET role;

SELECT 
    '========================================' as summary;
SELECT 
    'RLS Policy Test Summary' as summary;
SELECT 
    '========================================' as summary;
SELECT 
    'All tests should show PASS' as summary;
SELECT 
    'If any test shows FAIL, there is a security issue!' as summary;
SELECT 
    '========================================' as summary;

-- ============================================================================
-- Cleanup (optional - comment out if you want to keep test data)
-- ============================================================================
-- DELETE FROM storage.objects WHERE bucket_id = 'receipts';
-- DELETE FROM receipts WHERE id IN ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');
-- DELETE FROM household_members WHERE household_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
-- DELETE FROM households WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
-- DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
