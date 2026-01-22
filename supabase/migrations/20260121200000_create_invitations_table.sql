-- Create invitations table for household member invitations
-- This table stores pending invitations sent by household admins
-- Invitations expire after 7 days and can be accepted or declined

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    token TEXT NOT NULL UNIQUE, -- Unique token for the invitation link
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_expiration CHECK (expires_at > created_at),
    CONSTRAINT valid_email CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX idx_invitations_household_id ON invitations(household_id);
CREATE INDEX idx_invitations_invitee_email ON invitations(invitee_email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);

-- Create updated_at trigger
CREATE TRIGGER update_invitations_updated_at
    BEFORE UPDATE ON invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for households they are members of
CREATE POLICY invitations_select_policy ON invitations
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only admins can create invitations
CREATE POLICY invitations_insert_policy ON invitations
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy: Only admins can update invitations (e.g., to cancel)
CREATE POLICY invitations_update_policy ON invitations
    FOR UPDATE
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy: Only admins can delete invitations
CREATE POLICY invitations_delete_policy ON invitations
    FOR DELETE
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add comment to table
COMMENT ON TABLE invitations IS 'Stores pending household member invitations with 7-day expiration';
COMMENT ON COLUMN invitations.token IS 'Unique token used in the invitation link for security';
COMMENT ON COLUMN invitations.expires_at IS 'Invitation expiration timestamp (7 days from creation)';
COMMENT ON COLUMN invitations.status IS 'Invitation status: pending, accepted, declined, or expired';
