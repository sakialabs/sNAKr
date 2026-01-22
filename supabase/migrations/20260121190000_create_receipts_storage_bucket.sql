-- Migration: Create Supabase Storage bucket for receipts
-- Description: Set up secure storage bucket with encryption and RLS policies
-- Created: 2026-01-21 19:00:00
-- Task: 0.2.13 Set up Supabase Storage bucket for receipts

-- ============================================================================
-- Storage Bucket Creation
-- ============================================================================
-- Create a storage bucket for receipt files
-- - Max file size: 10MB (configured in config.toml)
-- - Allowed file types: JPEG, PNG, PDF
-- - Encryption: Enabled by default in Supabase Storage
-- - Access: Restricted to household members via RLS

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    false,  -- Private bucket (not publicly accessible)
    10485760,  -- 10MB in bytes
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage RLS Policies
-- ============================================================================
-- Enable RLS on the storage.objects table for the receipts bucket
-- Note: Supabase Storage uses the storage.objects table to track files

-- Policy 1: Users can view (SELECT) receipt files from their households
-- File path format: {household_id}/{receipt_id}.{ext}
CREATE POLICY receipts_storage_select_policy ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] IN (
            SELECT household_id::text
            FROM household_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy 2: Users can upload (INSERT) receipt files to their households
-- Users can only upload to folders matching their household IDs
CREATE POLICY receipts_storage_insert_policy ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] IN (
            SELECT household_id::text
            FROM household_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy 3: Users can update receipt files in their households
-- This allows updating metadata or replacing files
CREATE POLICY receipts_storage_update_policy ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] IN (
            SELECT household_id::text
            FROM household_members
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] IN (
            SELECT household_id::text
            FROM household_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy 4: Users can delete receipt files from their households
CREATE POLICY receipts_storage_delete_policy ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'receipts'
        AND (storage.foldername(name))[1] IN (
            SELECT household_id::text
            FROM household_members
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- Comments
-- ============================================================================
-- Note: Policy comments are documented in the policy creation statements above
-- COMMENT ON POLICY is not supported for storage.objects in Supabase local dev

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries to verify the bucket and policies were created correctly

-- Verify bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'receipts';

-- Verify policies exist
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'receipts_storage%';

-- ============================================================================
-- Usage Notes
-- ============================================================================
-- File path structure: {household_id}/{receipt_id}.{ext}
-- Example: 550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000.jpg
--
-- Security features:
-- 1. Encryption at rest: Enabled by default in Supabase Storage
-- 2. Encryption in transit: TLS 1.3 for all API requests
-- 3. RLS policies: Only household members can access files
-- 4. Private bucket: Files not publicly accessible
-- 5. File type validation: Only JPEG, PNG, PDF allowed
-- 6. Size limit: 10MB maximum per file
--
-- Retention policy:
-- - Default: 90 days (to be implemented in application logic)
-- - Users can manually delete receipts at any time
-- - Household deletion cascades to receipts table, which should trigger file cleanup
