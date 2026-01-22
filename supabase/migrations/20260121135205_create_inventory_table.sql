-- Create inventory table
-- This table stores the current state per item in household inventory
-- Tracks fuzzy states (Plenty, OK, Low, Almost out, Out) with confidence scores

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    state TEXT NOT NULL CHECK (state IN (
        'plenty',
        'ok',
        'low',
        'almost_out',
        'out'
    )),
    confidence DECIMAL(3, 2) CHECK (confidence >= 0.0 AND confidence <= 1.0),
    last_event_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one inventory record per item
    CONSTRAINT unique_item_inventory UNIQUE (item_id)
);

-- Add indexes for common queries
CREATE INDEX idx_inventory_household_id ON inventory(household_id);
CREATE INDEX idx_inventory_item_id ON inventory(item_id);
CREATE INDEX idx_inventory_state ON inventory(state);
CREATE INDEX idx_inventory_last_event_at ON inventory(last_event_at);

-- Add composite index for household-scoped state queries
CREATE INDEX idx_inventory_household_state ON inventory(household_id, state);

-- Add composite index for household-scoped queries with last event
CREATE INDEX idx_inventory_household_last_event ON inventory(household_id, last_event_at);

-- Add comments for documentation
COMMENT ON TABLE inventory IS 'Current state per item in household inventory with fuzzy states';
COMMENT ON COLUMN inventory.id IS 'Unique identifier for the inventory record';
COMMENT ON COLUMN inventory.household_id IS 'Reference to the household that owns this inventory';
COMMENT ON COLUMN inventory.item_id IS 'Reference to the item being tracked';
COMMENT ON COLUMN inventory.state IS 'Current fuzzy state: plenty, ok, low, almost_out, or out';
COMMENT ON COLUMN inventory.confidence IS 'Confidence score for the current state (0.0 to 1.0)';
COMMENT ON COLUMN inventory.last_event_at IS 'Timestamp of the last event that affected this item';
COMMENT ON COLUMN inventory.created_at IS 'Timestamp when the inventory record was created';
COMMENT ON COLUMN inventory.updated_at IS 'Timestamp when the inventory record was last updated';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on inventory table
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view inventory from households they belong to
CREATE POLICY inventory_select_policy ON inventory
    FOR SELECT
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can insert inventory into households they belong to
CREATE POLICY inventory_insert_policy ON inventory
    FOR INSERT
    TO authenticated
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can update inventory in households they belong to
CREATE POLICY inventory_update_policy ON inventory
    FOR UPDATE
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Only admins can delete inventory records
CREATE POLICY inventory_delete_policy ON inventory
    FOR DELETE
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
