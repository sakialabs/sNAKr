"""
Restock list endpoints

This module will provide endpoints for:
- Generating restock lists with urgency grouping
- Dismissing items temporarily
- Exporting lists (text, JSON)
- Nimbly integration (Restock Intent generation)
- Receiving Action Options from Nimbly

Planned Endpoints:
- GET /api/v1/restock - Get restock list grouped by urgency
- POST /api/v1/restock/{item_id}/dismiss - Dismiss item from list
- GET /api/v1/restock/export - Export list (text or JSON)
- POST /api/v1/restock/intent - Generate Restock Intent for Nimbly
- POST /api/v1/restock/intent/{id}/handoff - Initiate Nimbly handoff
- POST /api/v1/restock/intent/{id}/response - Receive Action Options from Nimbly

Restock List Urgency Levels:
1. Need now: Items in Out or Almost out state
2. Need soon: Items in Low state or predicted Low within 3 days
3. Nice to top up: Items in OK state with consistent usage patterns

Prediction Logic (Rules-based MVP):
- Moving average usage rate per item
- Time since last restock
- Simple thresholds for state transitions
- Confidence scores (0.7-0.95 for rules)
- Explainable reason codes

Reason Codes:
- "recent_usage_events" - Multiple recent uses
- "receipt_confirmed_X_days_ago" - Recent restock
- "consistent_weekly_pattern" - Predictable usage
- "low_confidence" - Insufficient data

Dismissal:
- Duration options: 3, 7, 14, 30 days
- Household-scoped (affects all members)
- Items resurface after duration expires

Nimbly Integration (Phase 3):
- Restock Intent format follows integration contract v1
- Includes: metadata, item entries, constraints
- Each item has: name, category, state, confidence, reason codes, suggested quantity
- Constraints: partial fulfillment, local-first preference, budget sensitivity
- User must explicitly approve handoff
- No automatic purchases or forced automation

Export Formats:
- Plain text: Simple list for copy/paste
- JSON: Structured data with metadata
- Copy to clipboard: One-click copy
- System share sheet: Mobile sharing (future)

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
Multi-tenant: Filtered by household membership
"""
from fastapi import APIRouter

router = APIRouter(prefix="/restock", tags=["restock"])

# Endpoints will be implemented in Phase 3
