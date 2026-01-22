"""
Receipt upload and processing endpoints

This module will provide endpoints for:
- Uploading receipt photos/PDFs
- OCR text extraction (async)
- Line item parsing and normalization
- Item mapping with confidence scores
- User review and confirmation
- Receipt management (list, delete)

Planned Endpoints:
- POST /api/v1/receipts - Upload receipt file
- GET /api/v1/receipts - List receipts with status
- GET /api/v1/receipts/{id} - Get receipt with parsed items
- POST /api/v1/receipts/{id}/confirm - Confirm and apply to inventory
- DELETE /api/v1/receipts/{id} - Delete receipt
- GET /api/v1/receipts/{id}/status - Check processing status

Receipt Processing Pipeline:
1. Upload: Store file in Supabase Storage (encrypted)
2. OCR: Extract text asynchronously (Tesseract)
3. Parse: Extract line items, store, date, total
4. Normalize: Clean names, normalize units/quantities
5. Map: Match to household items with confidence scores
6. Review: User confirms/edits mappings
7. Confirm: Apply to inventory, create events

Receipt Status Flow:
- uploaded → processing → parsed → confirmed
- uploaded → processing → failed (on error)

File Requirements:
- Formats: JPEG, PNG, PDF
- Max size: 10MB
- Encryption: At rest and in transit
- Retention: 90 days default (user-configurable)

Item Mapping:
- Uses embedding similarity + fuzzy string matching
- Returns top-3 candidates with match scores
- Confidence threshold: 0.7 for auto-suggestion
- Low confidence items flagged for user review

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
Multi-tenant: Filtered by household membership
Idempotency: Supported via Idempotency-Key header
"""
from fastapi import APIRouter

router = APIRouter(prefix="/receipts", tags=["receipts"])

# Endpoints will be implemented in Phase 2
