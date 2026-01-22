-- Migration: Create restock_list table
-- Description: Materialized restock recommendations with urgency levels and dismissal tracking
-- Created: 2026-01-21 18:00:00

-- ============================================================================
-- Restock List Table
-- ============================================================================
-- Stores materialized restock recommendations generated from inventory states and predictions
-- Includes urgency levels (need_now, need_soon, nice_to_top_up) and dismissal tracking
-- Refreshes automatically when inventory or predictions change

CREATE TABLE IF NOT EXISTS restock_list (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    
    -- Link to inventory item
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    -- Urgency level
    urgency TEXT NOT NULL CHECK (urgency IN (
        'need_now',         -- Items in Out or Almost out state
        'need_soon',        -- Items in Low state or predicted Low within 3 days
        'nice_to_top_up'    -- Items in OK state with consistent usage patterns
    )),
    
    -- Reason for inclusion in restock list
    -- Human-readable explanation: "Currently out", "Predicted low in 2 days", etc.
    reason TEXT NOT NULL,
    
    -- Predicted days until low/out (from predictions table)
    days_to_low INTEGER CHECK (days_to_low >= 0),
    days_to_out INTEGER CHECK (days_to_out >= 0),
    
    -- Dismissal tracking
    dismissed_until TIMESTAMPTZ,                        -- Item hidden from list until this timestamp
    dismissed_at TIMESTAMPTZ,                           -- When the item was dismissed
    dismissed_duration_days INTEGER CHECK (dismissed_duration_days > 0), -- Duration of dismissal (3, 7, 14, 30 days)
    
    -- Confidence score (inherited from prediction or inventory)
    confidence NUMERIC(3,2) CHECK (confidence >= 0.0 AND confidence <= 1.0),
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_estimates CHECK (
        (days_to_low IS NULL OR days_to_out IS NULL) OR 
        (days_to_low <= days_to_out)
    ),
    -- Ensure one restock entry per item
    CONSTRAINT unique_item_restock UNIQUE (item_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Primary lookup: Get restock list for a household
CREATE INDEX idx_restock_list_household_id ON restock_list(household_id);

-- Lookup by item
CREATE INDEX idx_restock_list_item_id ON restock_list(item_id);

-- Filter by urgency level
CREATE INDEX idx_restock_list_urgency ON restock_list(urgency);

-- Composite index for household + urgency queries (most common query pattern)
CREATE INDEX idx_restock_list_household_urgency ON restock_list(household_id, urgency);

-- Filter out dismissed items (WHERE dismissed_until IS NULL OR dismissed_until < NOW())
CREATE INDEX idx_restock_list_dismissed_until ON restock_list(dismissed_until) 
    WHERE dismissed_until IS NOT NULL;

-- Composite index for active (non-dismissed) items per household
-- Note: We can't use NOW() in index predicate as it's not immutable
-- Instead, we'll filter dismissed items at query time

-- Sort by confidence (for prioritization)
CREATE INDEX idx_restock_list_confidence ON restock_list(confidence);

-- Sort by days to out (for urgency sorting)
CREATE INDEX idx_restock_list_days_to_out ON restock_list(days_to_out) 
    WHERE days_to_out IS NOT NULL;

-- Composite index for household + days_to_out queries
CREATE INDEX idx_restock_list_household_days_to_out ON restock_list(household_id, days_to_out) 
    WHERE days_to_out IS NOT NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE restock_list IS 'Materialized restock recommendations with urgency levels and dismissal tracking';
COMMENT ON COLUMN restock_list.id IS 'Unique identifier for the restock list entry';
COMMENT ON COLUMN restock_list.household_id IS 'Reference to the household that owns this restock entry';
COMMENT ON COLUMN restock_list.item_id IS 'Reference to the item that needs restocking';
COMMENT ON COLUMN restock_list.urgency IS 'Urgency level: need_now, need_soon, or nice_to_top_up';
COMMENT ON COLUMN restock_list.reason IS 'Human-readable explanation for why this item is on the restock list';
COMMENT ON COLUMN restock_list.days_to_low IS 'Estimated days until item reaches low state (from predictions)';
COMMENT ON COLUMN restock_list.days_to_out IS 'Estimated days until item runs out (from predictions)';
COMMENT ON COLUMN restock_list.dismissed_until IS 'Item hidden from restock list until this timestamp';
COMMENT ON COLUMN restock_list.dismissed_at IS 'Timestamp when the item was dismissed';
COMMENT ON COLUMN restock_list.dismissed_duration_days IS 'Duration of dismissal in days (3, 7, 14, 30)';
COMMENT ON COLUMN restock_list.confidence IS 'Confidence score for the restock recommendation (0.0 to 1.0)';
COMMENT ON COLUMN restock_list.created_at IS 'Timestamp when the restock entry was created';
COMMENT ON COLUMN restock_list.updated_at IS 'Timestamp when the restock entry was last updated';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_restock_list_updated_at
    BEFORE UPDATE ON restock_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to dismiss an item from the restock list
CREATE OR REPLACE FUNCTION dismiss_restock_item(
    p_item_id UUID,
    p_duration_days INTEGER DEFAULT 7
)
RETURNS BOOLEAN AS $$
DECLARE
    v_dismissed INTEGER;
BEGIN
    -- Validate duration (must be 3, 7, 14, or 30 days)
    IF p_duration_days NOT IN (3, 7, 14, 30) THEN
        RAISE EXCEPTION 'Invalid dismissal duration. Must be 3, 7, 14, or 30 days.';
    END IF;
    
    -- Update the restock list entry
    UPDATE restock_list
    SET dismissed_until = NOW() + (p_duration_days || ' days')::INTERVAL,
        dismissed_at = NOW(),
        dismissed_duration_days = p_duration_days,
        updated_at = NOW()
    WHERE item_id = p_item_id;
    
    GET DIAGNOSTICS v_dismissed = ROW_COUNT;
    RETURN v_dismissed > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dismiss_restock_item(UUID, INTEGER) IS 'Dismisses an item from the restock list for the specified duration (3, 7, 14, or 30 days)';

-- Function to undismiss an item (make it visible again)
CREATE OR REPLACE FUNCTION undismiss_restock_item(p_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_undismissed INTEGER;
BEGIN
    UPDATE restock_list
    SET dismissed_until = NULL,
        dismissed_at = NULL,
        dismissed_duration_days = NULL,
        updated_at = NOW()
    WHERE item_id = p_item_id;
    
    GET DIAGNOSTICS v_undismissed = ROW_COUNT;
    RETURN v_undismissed > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION undismiss_restock_item(UUID) IS 'Removes dismissal from a restock item, making it visible again';

-- Function to clean up expired dismissals
CREATE OR REPLACE FUNCTION cleanup_expired_dismissals()
RETURNS INTEGER AS $$
DECLARE
    v_cleaned INTEGER;
BEGIN
    UPDATE restock_list
    SET dismissed_until = NULL,
        dismissed_at = NULL,
        dismissed_duration_days = NULL,
        updated_at = NOW()
    WHERE dismissed_until IS NOT NULL 
      AND dismissed_until < NOW();
    
    GET DIAGNOSTICS v_cleaned = ROW_COUNT;
    RETURN v_cleaned;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_dismissals() IS 'Cleans up expired dismissals by setting dismissed_until to NULL. Returns count of cleaned items.';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE restock_list ENABLE ROW LEVEL SECURITY;

-- Users can view restock list from their households
CREATE POLICY restock_list_select_policy ON restock_list
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert restock entries into their households
-- Note: In practice, restock list is typically generated by backend services
-- but we allow authenticated users to insert for flexibility
CREATE POLICY restock_list_insert_policy ON restock_list
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update restock entries in their households
-- This is primarily used for dismissal functionality
CREATE POLICY restock_list_update_policy ON restock_list
    FOR UPDATE
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

-- Users can delete restock entries from their households
CREATE POLICY restock_list_delete_policy ON restock_list
    FOR DELETE
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );
