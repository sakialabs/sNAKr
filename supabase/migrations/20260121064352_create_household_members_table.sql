-- Create household_members table
-- This table establishes the multi-tenant boundary for sNAKr MVP
-- Links users to households with role-based access control (admin/member)

CREATE TABLE IF NOT EXISTS household_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a user can only be a member of a household once
    UNIQUE(household_id, user_id)
);

-- Add indexes for efficient queries
CREATE INDEX idx_household_members_household_id ON household_members(household_id);
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_role ON household_members(role);

-- Add comments for documentation
COMMENT ON TABLE household_members IS 'Multi-tenant boundary linking users to households with roles';
COMMENT ON COLUMN household_members.id IS 'Unique identifier for the membership record';
COMMENT ON COLUMN household_members.household_id IS 'Reference to the household';
COMMENT ON COLUMN household_members.user_id IS 'Reference to the user (from Supabase Auth)';
COMMENT ON COLUMN household_members.role IS 'User role in the household: admin or member';
COMMENT ON COLUMN household_members.joined_at IS 'Timestamp when the user joined the household';
COMMENT ON COLUMN household_members.created_at IS 'Timestamp when the membership record was created';
COMMENT ON COLUMN household_members.updated_at IS 'Timestamp when the membership record was last updated';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_household_members_updated_at
    BEFORE UPDATE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on household_members table
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view memberships for households they belong to
CREATE POLICY household_members_select_policy ON household_members
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR household_id IN (
            SELECT household_id FROM household_members WHERE user_id = auth.uid()
        )
    );

-- Policy: Only admins can insert new members (for invitations)
-- Note: The initial household creator will be added via a separate mechanism
CREATE POLICY household_members_insert_policy ON household_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Allow if user is an admin of the household
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
        -- OR if this is the first member (household creator)
        OR NOT EXISTS (
            SELECT 1 FROM household_members WHERE household_id = household_members.household_id
        )
    );

-- Policy: Only admins can update member roles
CREATE POLICY household_members_update_policy ON household_members
    FOR UPDATE
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can remove members, or users can remove themselves
CREATE POLICY household_members_delete_policy ON household_members
    FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Now refine the RLS policies on the households table
-- Drop the temporary permissive policies
DROP POLICY IF EXISTS households_select_policy ON households;
DROP POLICY IF EXISTS households_update_policy ON households;
DROP POLICY IF EXISTS households_delete_policy ON households;

-- Policy: Users can only view households they are members of
CREATE POLICY households_select_policy ON households
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT household_id FROM household_members WHERE user_id = auth.uid()
        )
    );

-- Policy: Only admins can update households
CREATE POLICY households_update_policy ON households
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can delete households
CREATE POLICY households_delete_policy ON households
    FOR DELETE
    TO authenticated
    USING (
        id IN (
            SELECT household_id FROM household_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Note: The households_insert_policy remains unchanged
-- Users can create new households, and they will be added as admin via application logic
