-- Migration: Create events table with indexes
-- Description: Immutable event log for all inventory changes
-- Created: 2026-01-21 14:23:10

-- ============================================================================
-- Events Table
-- ============================================================================
-- Immutable event log for all state changes in the system
-- Event types: inventory.used, inventory.restocked, inventory.ran_out,
--              receipt.ingested, receipt.confirmed
-- Events are never updated or deleted (append-only)

CREATE TABLE IF NOT EXISTS events (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    
    -- Event metadata
    event_type TEXT NOT NULL CHECK (event_type IN (
        'inventory.used',
        'inventory.restocked',
        'inventory.ran_out',
        'receipt.ingested',
        'receipt.confirmed',
        'prediction.generated',
        'iot.door_opened',
        'iot.weight_changed',
        'iot.snapshot_available'
    )),
    
    -- Event source (who/what triggered this event)
    source TEXT NOT NULL CHECK (source IN (
        'user',
        'receipt',
        'prediction',
        'iot',
        'system'
    )),
    
    -- Related entities
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    receipt_id UUID,  -- Will reference receipts table (created in next migration)
    
    -- Event data
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Confidence score (0.0-1.0)
    -- High for user actions (1.0), lower for predictions/IoT
    confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    
    -- Timestamp (immutable, set once)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Primary lookup: Get events for a household
CREATE INDEX idx_events_household_id ON events(household_id);

-- Filter by event type
CREATE INDEX idx_events_event_type ON events(event_type);

-- Get events for a specific item
CREATE INDEX idx_events_item_id ON events(item_id) WHERE item_id IS NOT NULL;

-- Get events for a specific receipt
CREATE INDEX idx_events_receipt_id ON events(receipt_id) WHERE receipt_id IS NOT NULL;

-- Temporal queries (most recent events)
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Composite index for household + time range queries
CREATE INDEX idx_events_household_created ON events(household_id, created_at DESC);

-- Composite index for item history queries
CREATE INDEX idx_events_item_created ON events(item_id, created_at DESC) WHERE item_id IS NOT NULL;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can view events from their households
CREATE POLICY events_select_policy ON events
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can create events in their households
CREATE POLICY events_insert_policy ON events
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Events are immutable - no UPDATE or DELETE policies

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE events IS 'Immutable event log for all inventory changes and system events';
COMMENT ON COLUMN events.event_type IS 'Type of event: inventory.*, receipt.*, prediction.*, iot.*';
COMMENT ON COLUMN events.source IS 'Event source: user, receipt, prediction, iot, system';
COMMENT ON COLUMN events.payload IS 'Flexible JSON payload for event-specific data';
COMMENT ON COLUMN events.confidence IS 'Confidence score 0.0-1.0 (1.0 for user actions, lower for predictions)';
COMMENT ON COLUMN events.created_at IS 'Event timestamp (immutable, append-only)';

-- ============================================================================
-- Example Payloads
-- ============================================================================

-- inventory.used:
-- {
--   "previous_state": "ok",
--   "new_state": "low",
--   "quantity_used": 1
-- }

-- inventory.restocked:
-- {
--   "previous_state": "low",
--   "new_state": "plenty",
--   "quantity_added": 2,
--   "receipt_id": "uuid"
-- }

-- inventory.ran_out:
-- {
--   "previous_state": "almost_out",
--   "new_state": "out"
-- }

-- receipt.ingested:
-- {
--   "store_name": "Whole Foods",
--   "receipt_date": "2026-01-20",
--   "total_amount": 45.67,
--   "item_count": 12
-- }

-- receipt.confirmed:
-- {
--   "items_confirmed": 10,
--   "items_skipped": 2,
--   "user_edits": 3
-- }

-- prediction.generated:
-- {
--   "predicted_state": "low",
--   "days_to_low": 3,
--   "days_to_out": 5,
--   "reason_codes": ["consistent_usage_pattern", "receipt_confirmed_2_days_ago"]
-- }

-- iot.door_opened:
-- {
--   "device_id": "fridge-sensor-01",
--   "duration_seconds": 15,
--   "location": "fridge"
-- }

-- iot.weight_changed:
-- {
--   "device_id": "scale-01",
--   "weight_delta_grams": -250,
--   "location": "pantry"
-- }
