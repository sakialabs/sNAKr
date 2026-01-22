-- Create households table
-- This is the core table for shared household identity in sNAKr MVP
-- Each household represents a group of users sharing inventory tracking

CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on created_at for sorting/filtering
CREATE INDEX idx_households_created_at ON households(created_at);

-- Add comments for documentation
COMMENT ON TABLE households IS 'Shared household identity for multi-tenant inventory tracking';
COMMENT ON COLUMN households.id IS 'Unique identifier for the household';
COMMENT ON COLUMN households.name IS 'User-provided name for the household';
COMMENT ON COLUMN households.created_at IS 'Timestamp when the household was created';
COMMENT ON COLUMN households.updated_at IS 'Timestamp when the household was last updated';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_households_updated_at
    BEFORE UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on households table
-- Note: Policies will be added in subsequent migrations after household_members table is created
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- For now, allow authenticated users to create households
-- More restrictive policies will be added after household_members table exists
CREATE POLICY households_insert_policy ON households
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view households (will be restricted to member households later)
CREATE POLICY households_select_policy ON households
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to update households (will be restricted to admin members later)
CREATE POLICY households_update_policy ON households
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow users to delete households (will be restricted to admin members later)
CREATE POLICY households_delete_policy ON households
    FOR DELETE
    TO authenticated
    USING (true);
