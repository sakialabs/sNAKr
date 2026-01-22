-- Create items table
-- This table stores the canonical item catalog per household
-- Items represent products tracked in household inventory (e.g., milk, eggs, bread)

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'dairy',
        'produce',
        'meat',
        'bakery',
        'pantry_staple',
        'beverage',
        'snack',
        'condiment',
        'other'
    )),
    location TEXT NOT NULL CHECK (location IN (
        'fridge',
        'pantry',
        'freezer'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique item names per household
    CONSTRAINT unique_item_name_per_household UNIQUE (household_id, name)
);

-- Add indexes for common queries
CREATE INDEX idx_items_household_id ON items(household_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_location ON items(location);
CREATE INDEX idx_items_created_at ON items(created_at);

-- Add trigram indexes for fuzzy text search on item names
-- This enables fast similarity searches for receipt item mapping
CREATE INDEX idx_items_name_trgm ON items USING gin (name gin_trgm_ops);

-- Add composite index for household-scoped searches
CREATE INDEX idx_items_household_name ON items(household_id, name);

-- Add comments for documentation
COMMENT ON TABLE items IS 'Canonical item catalog per household for inventory tracking';
COMMENT ON COLUMN items.id IS 'Unique identifier for the item';
COMMENT ON COLUMN items.household_id IS 'Reference to the household that owns this item';
COMMENT ON COLUMN items.name IS 'User-provided name for the item (household-specific)';
COMMENT ON COLUMN items.category IS 'Item category: dairy, produce, meat, bakery, pantry_staple, beverage, snack, condiment, other';
COMMENT ON COLUMN items.location IS 'Storage location: fridge, pantry, or freezer';
COMMENT ON COLUMN items.created_at IS 'Timestamp when the item was created';
COMMENT ON COLUMN items.updated_at IS 'Timestamp when the item was last updated';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on items table
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view items from households they belong to
CREATE POLICY items_select_policy ON items
    FOR SELECT
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can insert items into households they belong to
CREATE POLICY items_insert_policy ON items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policy: Users can update items in households they belong to
CREATE POLICY items_update_policy ON items
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

-- RLS Policy: Only admins can delete items
CREATE POLICY items_delete_policy ON items
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
