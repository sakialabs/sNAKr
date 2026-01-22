# 🥭 sNAKr Roadmap

This roadmap exists to keep shipping focused. No fluff, no side quests.

---

## Phase 0: Foundation (2-3 weeks)

**Goal:** Clean repo, clean dev loop, clean data model.

- [ ] Web app scaffold (Next.js)
- [ ] API scaffold (FastAPI)
- [x] **Supabase setup (auth + database + storage)**
- [x] **OAuth providers (Google, GitHub) and magic links**
- [x] PostgreSQL schema + migrations (households, household_members, items, inventory, events)
- [x] Household + members + roles
- [x] Baseline inventory tables (items, inventory)
- [x] Event log table
- [x] Local dev setup (Docker + Supabase CLI)
- [x] Trigram fuzzy search for receipt item mapping

**Done when:** a new dev can run the project locally without pain.

---

## Phase 1: MVP (Shared household + receipts) (2-3 weeks)

**Goal:** A household can use sNAKr for a week and it actually helps.

- [ ] Shared inventory list (fridge + pantry)
- [ ] Fuzzy states: `Plenty`, `OK`, `Low`, `Almost out`, `Out`
- [ ] Quick actions: Used / Restocked / Ran out
- [ ] Receipt upload (photo/PDF)
- [ ] Receipt parsing + confirmation screen
- [ ] Apply receipt updates to inventory
- [ ] Restock list: Need now / Need soon

**Done when:** receipts keep inventory fresh and the restock list feels trustworthy.

---

## Phase 2: Prediction (Explainable, then ML-ready) (1-2 weeks)

**Goal:** Calm early warnings that make sense.

- [ ] Rules-based shortage prediction
- [ ] Confidence scoring per item
- [ ] Simple "why" explanations
- [ ] Evaluation harness (accuracy + calibration)
- [ ] Data logging standards for ML training

**Done when:** prediction helps without spamming or guessing wildly.

---

## Phase 3: Nimbly integration (2-3 weeks)

**Goal:** sNAKr decides *what* you need, Nimbly decides *how* to restock smart.

- [ ] Integration contract (restock list export format)
- [ ] Handoff flow from sNAKr → Nimbly
- [ ] Optional timing suggestions returned from Nimbly

**Done when:** it feels like one system, not two apps taped together.

---

## Phase 4: Local-first resilience (2-3 weeks)

**Goal:** Solarpunk in practice.

- [ ] Local-first preferences (optional, non-preachy)
- [ ] Seasonal and practical swaps (light touch)
- [ ] "Pantry stability" presets for staples

**Done when:** local-first choices feel easier, not harder.

---

## Phase 5: IoT readiness (3-4 weeks)

**Goal:** Hardware-agnostic event intake.

- [ ] Device event ingestion (door, weight, snapshot availability)
- [ ] Sensor signals influence inventory with confidence
- [ ] Household device linking

**Done when:** IoT improves the system but never becomes required.

---

## Data Model

### Core Tables

**households** - Shared home identity
- id, name, created_at, updated_at

**household_members** - Multi-tenant boundary with roles
- id, household_id, user_id, role (admin/member), joined_at

**items** - Canonical item catalog per household
- id, household_id, name, category, location (fridge/pantry/freezer)

**inventory** - Current state per item
- id, household_id, item_id, state (plenty/ok/low/almost_out/out), confidence, last_event_at

**events** - Immutable event log
- id, household_id, event_type, source, item_id, payload, confidence, created_at
- Types: inventory.used, inventory.restocked, inventory.ran_out, receipt.ingested, receipt.confirmed

**receipts** - Uploaded receipts and processing status
- id, household_id, file_path, status, store_name, receipt_date, ocr_text

**receipt_items** - Parsed line items from receipts
- id, receipt_id, item_id, raw_name, quantity, unit, price, confidence, mapping_candidates

**predictions** - ML-generated predictions
- id, household_id, item_id, predicted_state, confidence, days_to_low, days_to_out, reason_codes

**restock_list** - Materialized restock recommendations
- id, household_id, item_id, urgency (need_now/need_soon/nice_to_top_up), reason, dismissed_until

### RLS Policies

All tables with `household_id` enforce row-level security:
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventory_household_access ON inventory
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));
```

---

## API Contract

### Key Endpoints

**Households**
- `POST /households` - Create household
- `GET /households` - List user's households
- `POST /households/:id/members` - Invite member

**Items & Inventory**
- `GET /households/:id/items` - List inventory
- `POST /items` - Create item
- `POST /items/:id/used` - Mark as used
- `POST /items/:id/restocked` - Mark as restocked
- `POST /items/:id/ran_out` - Mark as out

**Receipts**
- `POST /households/:id/receipts` - Upload receipt
- `GET /receipts/:id` - Get parsed items
- `POST /receipts/:id/confirm` - Confirm and apply

**Restock**
- `GET /households/:id/restock` - Get restock list
- `POST /restock/:id/dismiss` - Dismiss item

**Events & Predictions**
- `GET /households/:id/events` - Get event history
- `GET /households/:id/predictions` - Get predictions

### Error Patterns

All errors follow this structure:
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Receipt file type must be image/jpeg, image/png, or application/pdf",
    "details": {"field": "file", "received_type": "text/plain"}
  }
}
```

---

## Privacy & Security

### Data Minimization
- No individual attribution for inventory actions
- Receipt files deleted after 90 days
- No location data, device IDs, or browsing history

### Household Safety
- No blame features
- No "who used it" tracking
- Events are household-scoped, not user-scoped

### Security Measures
- **Supabase Auth with OAuth and magic links**
- **Supabase Storage for encrypted receipt files**
- RLS policies enforce household boundaries
- TLS 1.3 for all API traffic
- Rate limiting: 100 req/min per user

### Compliance
- GDPR: Right to access, erasure, rectification, portability
- CCPA: Right to know, delete, opt-out
- Receipt retention: 90 days default, user-configurable

---

## IoT Readiness (Phase 5)

### Event Types
- `iot.door_opened` - Fridge door sensor
- `iot.weight_changed` - Weight sensor
- `iot.snapshot_available` - Camera snapshot

### Sensor Fusion Principle
IoT signals adjust confidence, never replace user actions.

**Example**: Door open at 7am increases likelihood of milk usage, but doesn't auto-mark as used.

### Safety Constraints
- No surveillance vibe (no facial recognition, no person tracking)
- No blame features (no "who opened the fridge")
- Always optional (sNAKr works without devices)

---

## Success Metrics

### Product Metrics
- 10+ households using sNAKr for 7+ consecutive days
- 3+ receipts uploaded per household per week
- 70%+ restock list engagement rate
- 50%+ reduction in self-reported stockouts

### Quality Metrics
- 80%+ receipt parsing accuracy
- 70%+ item mapping accuracy (top-1)
- 90%+ item mapping accuracy (top-3)
- <10% user correction rate on predictions

### User Feedback
- "This actually helps" sentiment in user interviews
- <5% churn rate in first month
- Positive word-of-mouth and referrals
