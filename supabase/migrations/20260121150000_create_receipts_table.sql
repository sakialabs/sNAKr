-- Migration: Create receipts table
-- Description: Uploaded receipts and OCR processing status
-- Created: 2026-01-21 15:00:00

-- ============================================================================
-- Receipts Table
-- ============================================================================
-- Stores uploaded receipt files and their processing status
-- Status flow: uploaded → processing → parsed → confirmed (or failed)
-- Supports JPEG, PNG, and PDF file formats

CREATE TABLE IF NOT EXISTS receipts (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Multi-tenant isolation
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    
    -- File storage reference (Supabase Storage path)
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN (
        'image/jpeg',
        'image/png',
        'application/pdf'
    )),
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760), -- Max 10MB
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
        'uploaded',      -- File uploaded, waiting for OCR
        'processing',    -- OCR in progress
        'parsed',        -- OCR complete, items extracted
        'confirmed',     -- User confirmed and applied to inventory
        'failed'         -- Processing failed
    )),
    
    -- OCR results
    ocr_text TEXT,                    -- Raw OCR text for debugging
    ocr_confidence NUMERIC(3,2) CHECK (ocr_confidence >= 0.0 AND ocr_confidence <= 1.0),
    
    -- Extracted metadata
    store_name TEXT,                  -- Detected store name (e.g., "Whole Foods")
    receipt_date DATE,                -- Detected receipt date
    total_amount NUMERIC(10,2) CHECK (total_amount >= 0),  -- Total amount from receipt
    
    -- Item counts
    item_count INTEGER DEFAULT 0 CHECK (item_count >= 0),  -- Number of line items parsed
    confirmed_count INTEGER DEFAULT 0 CHECK (confirmed_count >= 0),  -- Number of items confirmed by user
    
    -- Error tracking
    error_message TEXT,               -- Error message if status = 'failed'
    error_code TEXT,                  -- Error code for programmatic handling
    
    -- Processing timestamps
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_started_at TIMESTAMPTZ,
    parsed_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_confirmed_count CHECK (confirmed_count <= item_count)
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Primary lookup: Get receipts for a household
CREATE INDEX idx_receipts_household_id ON receipts(household_id);

-- Filter by status
CREATE INDEX idx_receipts_status ON receipts(status);

-- Temporal queries (most recent receipts)
CREATE INDEX idx_receipts_uploaded_at ON receipts(uploaded_at DESC);

-- Composite index for household + status queries
CREATE INDEX idx_receipts_household_status ON receipts(household_id, status);

-- Composite index for household + time range queries
CREATE INDEX idx_receipts_household_uploaded ON receipts(household_id, uploaded_at DESC);

-- Store name lookup for analytics
CREATE INDEX idx_receipts_store_name ON receipts(store_name) WHERE store_name IS NOT NULL;

-- Receipt date lookup for analytics
CREATE INDEX idx_receipts_receipt_date ON receipts(receipt_date) WHERE receipt_date IS NOT NULL;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE receipts IS 'Uploaded receipts and OCR processing status';
COMMENT ON COLUMN receipts.id IS 'Unique identifier for the receipt';
COMMENT ON COLUMN receipts.household_id IS 'Reference to the household that owns this receipt';
COMMENT ON COLUMN receipts.file_path IS 'Path to the receipt file in Supabase Storage';
COMMENT ON COLUMN receipts.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN receipts.file_size_bytes IS 'Size of the uploaded file in bytes (max 10MB)';
COMMENT ON COLUMN receipts.status IS 'Processing status: uploaded, processing, parsed, confirmed, or failed';
COMMENT ON COLUMN receipts.ocr_text IS 'Raw OCR text extracted from the receipt';
COMMENT ON COLUMN receipts.ocr_confidence IS 'Overall OCR confidence score (0.0 to 1.0)';
COMMENT ON COLUMN receipts.store_name IS 'Detected store name from the receipt';
COMMENT ON COLUMN receipts.receipt_date IS 'Date on the receipt';
COMMENT ON COLUMN receipts.total_amount IS 'Total amount from the receipt';
COMMENT ON COLUMN receipts.item_count IS 'Number of line items parsed from the receipt';
COMMENT ON COLUMN receipts.confirmed_count IS 'Number of items confirmed by user';
COMMENT ON COLUMN receipts.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN receipts.error_code IS 'Error code for programmatic error handling';
COMMENT ON COLUMN receipts.uploaded_at IS 'Timestamp when the receipt was uploaded';
COMMENT ON COLUMN receipts.processing_started_at IS 'Timestamp when OCR processing started';
COMMENT ON COLUMN receipts.parsed_at IS 'Timestamp when OCR parsing completed';
COMMENT ON COLUMN receipts.confirmed_at IS 'Timestamp when user confirmed the receipt';
COMMENT ON COLUMN receipts.created_at IS 'Timestamp when the receipt record was created';
COMMENT ON COLUMN receipts.updated_at IS 'Timestamp when the receipt record was last updated';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Users can view receipts from their households
CREATE POLICY receipts_select_policy ON receipts
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can insert receipts into their households
CREATE POLICY receipts_insert_policy ON receipts
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update receipts in their households
CREATE POLICY receipts_update_policy ON receipts
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

-- Users can delete receipts from their households
CREATE POLICY receipts_delete_policy ON receipts
    FOR DELETE
    USING (
        household_id IN (
            SELECT household_id 
            FROM household_members 
            WHERE user_id = auth.uid()
        )
    );
