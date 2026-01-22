"""
Event log endpoints

This module will provide endpoints for:
- Viewing immutable event history
- Filtering events by type, item, date range
- Exporting event history for audit/ML training
- Pagination for large event logs

Planned Endpoints:
- GET /api/v1/events - List events with pagination and filters
- GET /api/v1/events/{id} - Get event details
- GET /api/v1/items/{item_id}/events - Get events for specific item
- GET /api/v1/events/export - Export events as JSON

Event Types:
- inventory.used - Item marked as used
- inventory.restocked - Item restocked (manual or receipt)
- inventory.ran_out - Item marked as out
- receipt.ingested - Receipt uploaded and parsed
- receipt.confirmed - Receipt items confirmed and applied
- prediction.generated - Prediction created/updated
- iot.event - IoT device event (future)

Event Properties:
- Immutable (never updated or deleted)
- Chronologically ordered
- Include source (user, receipt, prediction, iot, system)
- Include confidence scores where applicable
- Household-scoped (no individual attribution)

Authentication: Required (Supabase JWT)
Rate Limit: 100 requests/minute per user
Multi-tenant: Filtered by household membership
"""
from fastapi import APIRouter

router = APIRouter(prefix="/events", tags=["events"])

# Endpoints will be implemented in task 1.4
