-- Migration: Create predictions table
-- Description: ML-generated predictions with confidence scores and reason codes
-- Created: 2026-01-21 17:00:00

-- ============================================================================
-- Predictions Table
-- ============================================================================
-- Stores ML-generated predictions for inventory items
-- Includes predicted state, confidence scores, time estimates, and explainable reason codes
-- Predictions are refreshed when inventory changes occur

CREATE TABLE IF NOT EXISTS predictions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    
    -- Link to inventory item
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    -- Predicted state
    predicted_state TEXT NOT NULL CHECK (predicted_state IN (
        'plenty',
        'ok',
        'low',
        'almost_out',
        'out'
    )),
    
    -- Confidence scoring
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    
    -- Time estimates
    days_to_low INTEGER CHECK (days_to_low >= 0),      -- Estimated days until state reaches 'low'
    days_to_out INTEGER CHECK (days_to_out >= 0),      -- Estimated days until state reaches 'out'
    
    -- Explainable AI: reason codes
    -- Stored as JSONB array: ["consistent_usage_pattern", "receipt_confirmed_2_days_ago"]
    reason_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Model metadata
    model_version TEXT NOT NULL,                        -- e.g., "rules-v1.0", "ml-v2.3"
    model_type TEXT NOT NULL DEFAULT 'rules' CHECK (model_type IN (
        'rules',        -- Rules-based prediction (MVP)
        'ml',           -- Machine learning model (future)
        'hybrid'        -- Combination of rules and ML (future)
    )),
    
    -- Prediction freshness
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),   -- When this prediction was generated
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,            -- True if prediction is >24 hours old
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_reason_codes CHECK (jsonb_typeof(reason_codes) = 'array'),
    CONSTRAINT valid_time_estimates CHECK (
        (days_to_low IS NULL OR days_to_out IS NULL) OR 
        (days_to_low <= days_to_out)
    ),
    -- Ensure one prediction per item
    CONSTRAINT unique_item_prediction UNIQUE (item_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Primary lookup: Get predictions for a household
CREATE INDEX idx_predictions_household_id ON predictions(household_id);

-- Lookup by item
CREATE INDEX idx_predictions_item_id ON predictions(item_id);

-- Filter by predicted state
CREATE INDEX idx_predictions_predicted_state ON predictions(predicted_state);

-- Filter by confidence (for confidence gating)
CREATE INDEX idx_predictions_confidence ON predictions(confidence);

-- Composite index for household + predicted state queries
CREATE INDEX idx_predictions_household_state ON predictions(household_id, predicted_state);

-- Composite index for household + confidence queries
CREATE INDEX idx_predictions_household_confidence ON predictions(household_id, confidence);

-- Stale prediction detection
CREATE INDEX idx_predictions_stale ON predictions(is_stale) WHERE is_stale = TRUE;

-- Freshness queries (find predictions needing refresh)
CREATE INDEX idx_predictions_predicted_at ON predictions(predicted_at);

-- Model version tracking (for A/B testing and rollback)
CREATE INDEX idx_predictions_model_version ON predictions(model_version);

-- GIN index for JSONB reason_codes (for searching within reason codes)
CREATE INDEX idx_predictions_reason_codes ON predictions USING GIN (reason_codes);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE predictions IS 'ML-generated predictions with confidence scores and reason codes';
COMMENT ON COLUMN predictions.id IS 'Unique identifier for the prediction';
COMMENT ON COLUMN predictions.household_id IS 'Reference to the household that owns this prediction';
COMMENT ON COLUMN predictions.item_id IS 'Reference to the item being predicted';
COMMENT ON COLUMN predictions.predicted_state IS 'Predicted future state: plenty, ok, low, almost_out, or out';
COMMENT ON COLUMN predictions.confidence IS 'Confidence score for the prediction (0.0 to 1.0)';
COMMENT ON COLUMN predictions.days_to_low IS 'Estimated days until item reaches low state';
COMMENT ON COLUMN predictions.days_to_out IS 'Estimated days until item runs out';
COMMENT ON COLUMN predictions.reason_codes IS 'JSONB array of explainable reason codes';
COMMENT ON COLUMN predictions.model_version IS 'Version of the prediction model used';
COMMENT ON COLUMN predictions.model_type IS 'Type of model: rules, ml, or hybrid';
COMMENT ON COLUMN predictions.predicted_at IS 'Timestamp when this prediction was generated';
COMMENT ON COLUMN predictions.is_stale IS 'True if prediction is older than 24 hours';
COMMENT ON COLUMN predictions.created_at IS 'Timestamp when the prediction record was created';
COMMENT ON COLUMN predictions.updated_at IS 'Timestamp when the prediction record was last updated';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to mark predictions as stale after 24 hours
-- This will be handled by application logic or a scheduled job
-- For now, we'll add a function that can be called periodically

CREATE OR REPLACE FUNCTION mark_stale_predictions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE predictions
    SET is_stale = TRUE,
        updated_at = NOW()
    WHERE predicted_at < NOW() - INTERVAL '24 hours'
      AND is_stale = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_stale_predictions() IS 'Marks predictions older than 24 hours as stale. Returns count of updated predictions.';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Users can view predictions from their households
CREATE POLICY predictions_select_policy ON predictions
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert predictions into their households
-- Note: In practice, predictions are typically generated by backend services
-- but we allow authenticated users to insert for flexibility
CREATE POLICY predictions_insert_policy ON predictions
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update predictions in their households
CREATE POLICY predictions_update_policy ON predictions
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

-- Users can delete predictions from their households
CREATE POLICY predictions_delete_policy ON predictions
    FOR DELETE
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );
