-- Migration: Create receipt_items table
-- Description: Parsed line items from receipts with mapping candidates
-- Created: 2026-01-21 16:00:00

-- ============================================================================
-- Receipt Items Table
-- ============================================================================
-- Stores parsed line items extracted from receipts during OCR processing
-- Each line item represents a product found on the receipt with its details
-- Includes mapping candidates to link receipt items to household inventory

CREATE TABLE IF NOT EXISTS receipt_items (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to receipts table
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    
    -- Optional link to household items (after user confirmation)
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    
    -- Parsed line item data
    raw_name TEXT NOT NULL,                -- Original text from receipt (e.g., "ORG MLK 2% 1GAL")
    normalized_name TEXT,                  -- Cleaned/normalized name (e.g., "Milk 2%")
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.0 CHECK (quantity > 0),
    unit TEXT,                             -- Normalized unit (e.g., "gallon", "ounce", "pound")
    price NUMERIC(10,2) CHECK (price >= 0),  -- Price per item
    
    -- Line item position on receipt
    line_number INTEGER CHECK (line_number > 0),  -- Position on receipt for debugging
    
    -- Confidence scoring
    confidence NUMERIC(3,2) CHECK (confidence >= 0.0 AND confidence <= 1.0),  -- Overall confidence (0.0-1.0)
    ocr_confidence NUMERIC(3,2) CHECK (ocr_confidence >= 0.0 AND ocr_confidence <= 1.0),  -- OCR quality
    parsing_confidence NUMERIC(3,2) CHECK (parsing_confidence >= 0.0 AND parsing_confidence <= 1.0),  -- Parsing quality
    
    -- Mapping candidates (top-3 matches to household items)
    -- Stored as JSONB array: [{"item_id": "uuid", "item_name": "Milk", "score": 0.92}, ...]
    mapping_candidates JSONB DEFAULT '[]'::jsonb,
    
    -- User actions
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Awaiting user review
        'confirmed',    -- User confirmed and mapped to item
        'skipped',      -- User chose to skip this item
        'auto_mapped'   -- Automatically mapped with high confidence
    )),
    
    -- User edits (for ML training)
    user_edited_name TEXT,                 -- If user edited the normalized name
    user_selected_item_id UUID,            -- If user selected different mapping
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,              -- When user confirmed this item
    
    -- Constraints
    CONSTRAINT valid_mapping_candidates CHECK (jsonb_typeof(mapping_candidates) = 'array')
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Primary lookup: Get all items for a receipt
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);

-- Lookup by household item (after mapping)
CREATE INDEX idx_receipt_items_item_id ON receipt_items(item_id) WHERE item_id IS NOT NULL;

-- Filter by status
CREATE INDEX idx_receipt_items_status ON receipt_items(status);

-- Composite index for receipt + status queries
CREATE INDEX idx_receipt_items_receipt_status ON receipt_items(receipt_id, status);

-- Line number ordering for display
CREATE INDEX idx_receipt_items_line_number ON receipt_items(receipt_id, line_number) 
    WHERE line_number IS NOT NULL;

-- Confidence-based queries (for ML training)
CREATE INDEX idx_receipt_items_confidence ON receipt_items(confidence) 
    WHERE confidence IS NOT NULL;

-- User edits for ML training signals
CREATE INDEX idx_receipt_items_user_edited ON receipt_items(receipt_id) 
    WHERE user_edited_name IS NOT NULL OR user_selected_item_id IS NOT NULL;

-- GIN index for JSONB mapping_candidates (for searching within candidates)
CREATE INDEX idx_receipt_items_mapping_candidates ON receipt_items USING GIN (mapping_candidates);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE receipt_items IS 'Parsed line items from receipts with mapping candidates';
COMMENT ON COLUMN receipt_items.id IS 'Unique identifier for the receipt item';
COMMENT ON COLUMN receipt_items.receipt_id IS 'Reference to the parent receipt';
COMMENT ON COLUMN receipt_items.item_id IS 'Reference to household item (after user confirmation)';
COMMENT ON COLUMN receipt_items.raw_name IS 'Original text from receipt OCR';
COMMENT ON COLUMN receipt_items.normalized_name IS 'Cleaned and normalized item name';
COMMENT ON COLUMN receipt_items.quantity IS 'Quantity of items (default 1.0)';
COMMENT ON COLUMN receipt_items.unit IS 'Normalized unit (gallon, ounce, pound, etc.)';
COMMENT ON COLUMN receipt_items.price IS 'Price per item from receipt';
COMMENT ON COLUMN receipt_items.line_number IS 'Position on receipt for debugging and display';
COMMENT ON COLUMN receipt_items.confidence IS 'Overall confidence score (0.0-1.0)';
COMMENT ON COLUMN receipt_items.ocr_confidence IS 'OCR quality confidence score';
COMMENT ON COLUMN receipt_items.parsing_confidence IS 'Parsing quality confidence score';
COMMENT ON COLUMN receipt_items.mapping_candidates IS 'JSONB array of top-3 mapping candidates with scores';
COMMENT ON COLUMN receipt_items.status IS 'Processing status: pending, confirmed, skipped, or auto_mapped';
COMMENT ON COLUMN receipt_items.user_edited_name IS 'User-edited name (for ML training)';
COMMENT ON COLUMN receipt_items.user_selected_item_id IS 'User-selected item mapping (for ML training)';
COMMENT ON COLUMN receipt_items.created_at IS 'Timestamp when the receipt item was created';
COMMENT ON COLUMN receipt_items.updated_at IS 'Timestamp when the receipt item was last updated';
COMMENT ON COLUMN receipt_items.confirmed_at IS 'Timestamp when user confirmed this item';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_receipt_items_updated_at
    BEFORE UPDATE ON receipt_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Users can view receipt items from their households
-- Note: receipt_items doesn't have household_id, so we join through receipts
CREATE POLICY receipt_items_select_policy ON receipt_items
    FOR SELECT
    USING (
        receipt_id IN (
            SELECT id FROM receipts
            WHERE household_id IN (
                SELECT household_id 
                FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can insert receipt items for their household receipts
CREATE POLICY receipt_items_insert_policy ON receipt_items
    FOR INSERT
    WITH CHECK (
        receipt_id IN (
            SELECT id FROM receipts
            WHERE household_id IN (
                SELECT household_id 
                FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can update receipt items in their households
CREATE POLICY receipt_items_update_policy ON receipt_items
    FOR UPDATE
    USING (
        receipt_id IN (
            SELECT id FROM receipts
            WHERE household_id IN (
                SELECT household_id 
                FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        receipt_id IN (
            SELECT id FROM receipts
            WHERE household_id IN (
                SELECT household_id 
                FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Users can delete receipt items from their households
CREATE POLICY receipt_items_delete_policy ON receipt_items
    FOR DELETE
    USING (
        receipt_id IN (
            SELECT id FROM receipts
            WHERE household_id IN (
                SELECT household_id 
                FROM household_members 
                WHERE user_id = auth.uid()
            )
        )
    );
