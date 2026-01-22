# sNAKr MVP Requirements

Shared household inventory intelligence with receipt ingestion and explainable predictions.

---

## 1. Shared Household Management

### 1.1 Household Creation
A user can create a household with a name so they can start tracking shared inventory.

**Acceptance Criteria**:
- User provides household name during creation
- User becomes admin by default
- Household ID is generated and stored
- User can create multiple households

### 1.2 Member Invitations
A household admin can invite members via email so the household can share inventory tracking.

**Acceptance Criteria**:
- Only admins can send invites
- Invite includes household name and expiration (7 days)
- Invitee receives email with join link (via Supabase Auth)
- Invitee can accept or decline
- All members notified when new member joins
- Invites leverage Supabase magic links for seamless onboarding

### 1.3 Member Roles
Household members have roles (admin or member) to control permissions.

**Acceptance Criteria**:
- Admin can: invite members, remove members, delete household
- Member can: view inventory, update inventory, upload receipts
- At least one admin must exist per household
- Admin can promote member to admin

### 1.4 Multi-Tenant Isolation
Users only see data for households they belong to.

**Acceptance Criteria**:
- RLS policies enforce household boundaries
- API validates user membership before queries
- Attempting to access other household data returns 403
- No cross-household data leakage

---

## 2. Inventory Management

### 2.1 Item Catalog
A household maintains a catalog of items with names, categories, and locations.

**Acceptance Criteria**:
- Items have: name, category, location (fridge/pantry/freezer)
- Categories: dairy, produce, meat, bakery, pantry_staple, beverage, snack, condiment, other
- Item names are household-specific (same item can have different names across households)
- Items can be added manually or via receipt confirmation

### 2.2 Fuzzy States
Every item has a fuzzy state that represents current stock level.

**Acceptance Criteria**:
- States: Plenty, OK, Low, Almost out, Out
- States are human-readable (never numeric in UI)
- Only one state per item at a time
- State changes are triggered by user actions or receipt updates

### 2.3 Quick Actions
Users can quickly update item states with one-tap actions.

**Acceptance Criteria**:
- "Used" action: transitions state toward depletion (OK → Low, Low → Almost out)
- "Restocked" action: transitions state toward plenty (Low → OK, Almost out → Plenty)
- "Ran out" action: sets state to Out
- Each action creates an event in the event log
- Actions are idempotent (duplicate taps within 5 seconds are deduplicated)

### 2.4 Inventory View
Users can view all household items with current states.

**Acceptance Criteria**:
- List shows: item name, state badge, location
- Filter by location: All, Fridge, Pantry, Freezer
- Filter by state: All, Low, Almost out, Out
- Sort by: name, state, last updated
- Empty state shows Fasoolya prompt to upload first receipt

### 2.5 Item Detail
Users can view item history and predictions.

**Acceptance Criteria**:
- Shows: current state, confidence score, last updated
- Shows recent events: Used, Restocked, Ran out with timestamps
- Shows prediction if available: predicted state, days to low/out, reason codes
- User can manually override state
- User can edit item name or location

---

## 3. Receipt Ingestion

### 3.1 Receipt Upload
Users can upload receipt photos or PDFs to update inventory automatically.

**Acceptance Criteria**:
- Accepts: JPEG, PNG, PDF
- Max file size: 10MB
- Upload shows progress indicator
- Receipt stored securely with encryption
- Receipt status: uploaded → processing → parsed → confirmed

### 3.2 OCR Extraction
System extracts text from receipt images and PDFs.

**Acceptance Criteria**:
- OCR runs asynchronously (doesn't block user)
- Raw OCR text stored for debugging
- Store name detected if possible
- Receipt date detected if possible
- Total amount detected if possible
- OCR failures update status to "failed" with error message

### 3.3 Line Item Parsing
System parses OCR text into structured line items.

**Acceptance Criteria**:
- Each line item has: raw_name, quantity, unit, price
- Confidence score assigned per line item
- Store-specific parsing rules applied when store detected
- Parsing handles common receipt formats (vertical lists, multi-column)
- Low confidence items flagged for user review

### 3.4 Item Normalization
System cleans and normalizes parsed line items.

**Acceptance Criteria**:
- Remove noise: pack info, repeated tokens, special characters
- Normalize units: oz → ounce, lb → pound, gal → gallon
- Normalize quantities: "2x" → 2, "1 CT" → 1
- Example: "ORG MLK 2% 1GAL" → "Milk 2%", quantity=1, unit="gallon"

### 3.5 Item Mapping
System maps normalized line items to canonical household items.

**Acceptance Criteria**:
- Uses embedding similarity + fuzzy string matching
- Returns top-3 candidates with match scores
- Confidence threshold: 0.7 for auto-suggestion
- Items below threshold flagged for user review
- New items suggested for addition to catalog

### 3.6 Receipt Review
Users review and confirm parsed receipt items before applying updates.

**Acceptance Criteria**:
- Shows: parsed items with suggested mappings and confidence
- User can: confirm, edit name/mapping, skip item
- Shows alternative mappings for low-confidence items
- Bulk confirm button for high-confidence items
- Clear messaging: "Review before applying to inventory"

### 3.7 Receipt Confirmation
User-confirmed receipt items update inventory.

**Acceptance Criteria**:
- Creates "inventory.restocked" event per confirmed item
- Updates item states based on quantity and current state
- Skipped items are ignored (not applied)
- User edits stored as training signals for ML
- Receipt status updated to "confirmed"
- Confirmation is idempotent (safe to retry)

### 3.8 Inventory Application
Confirmed receipt items update inventory states.

**Acceptance Criteria**:
- State transitions: Out/Almost out → Plenty, Low → OK/Plenty
- Transition logic considers quantity restocked
- Events trigger prediction refresh
- Restock list refreshes automatically
- User sees updated inventory immediately

---

## 4. Restock List

### 4.1 Restock Generation
System generates a restock list from inventory states and predictions.

**Acceptance Criteria**:
- "Need now": items in Out or Almost out state
- "Need soon": items in Low state or predicted Low within 3 days
- "Nice to top up": items in OK state with consistent usage patterns
- List refreshes when inventory changes
- List is household-scoped (all members see same list)

### 4.2 Restock View
Users can view the restock list grouped by urgency.

**Acceptance Criteria**:
- Three sections: Need now, Need soon, Nice to top up
- Each item shows: name, current state, reason
- Predicted items show: days until Low/Out
- Empty state: "Looking steady. No surprises today."
- Fasoolya appears in empty state

### 4.3 Restock Dismissal
Users can dismiss items from the restock list temporarily.

**Acceptance Criteria**:
- Dismiss button per item
- Default dismissal: 7 days
- User can choose dismissal duration: 3, 7, 14, 30 days
- Dismissed items hidden from list until duration expires
- Dismissal is household-scoped (affects all members)

### 4.4 Restock Export
Users can export the restock list for external use.

**Acceptance Criteria**:
- Export as plain text or JSON
- Includes: item names, urgency, predicted days to out
- Copy to clipboard button
- Share via system share sheet (mobile)
- Future: handoff to Nimbly integration

### 4.5 Nimbly Integration Readiness (Phase 3)
System prepares restock data for Nimbly handoff.

**Acceptance Criteria**:
- Restock Intent format matches integration contract
- Intent includes: metadata, item entries, constraints
- Each item has: name, category, state, confidence, reason codes, suggested quantity
- Constraints include: partial fulfillment flag, local-first preference, budget sensitivity
- Intent generation is idempotent
- Intent versioning supported (v1, v2, etc.)

---

## 5. Predictions

### 5.1 Rules-Based Prediction (MVP)
System predicts item states using simple rules.

**Acceptance Criteria**:
- Moving average usage rate per item
- Time since last restock
- Simple thresholds for state transitions
- Predictions include confidence scores (0-1)
- Predictions include reason codes

### 5.2 Reason Codes
Every prediction includes explainable reason codes.

**Acceptance Criteria**:
- Example codes: "recent usage events", "receipt confirmed 3 days ago", "consistent weekly pattern"
- Reason codes are human-readable
- Multiple reason codes can apply to one prediction
- Reason codes visible in item detail view

### 5.3 Confidence Gating
Low confidence predictions trigger softer UX.

**Acceptance Criteria**:
- High confidence (0.8+): show in restock list
- Medium confidence (0.6-0.8): show with "might" language
- Low confidence (<0.6): don't show, log for ML training
- Confidence scores visible in item detail
- Users can always override predictions

### 5.4 Prediction Refresh
Predictions refresh when inventory changes.

**Acceptance Criteria**:
- Refresh triggered by: Used, Restocked, Ran out actions
- Refresh triggered by: receipt confirmation
- Refresh runs asynchronously (doesn't block user)
- Stale predictions (>24 hours) are marked as outdated

---

## 6. Event Log

### 6.1 Event Creation
All inventory changes create immutable events.

**Acceptance Criteria**:
- Event types: inventory.used, inventory.restocked, inventory.ran_out, receipt.ingested, receipt.confirmed
- Every event has: event_id, household_id, timestamp, source, item_id, payload, confidence
- Events are immutable (never updated or deleted)
- Events stored in chronological order

### 6.2 Event History
Users can view event history per item.

**Acceptance Criteria**:
- Shows last 50 events per item
- Events show: type, timestamp, payload summary
- Events grouped by date
- Pagination for older events
- Export event history as JSON

---

## 7. Privacy and Security

### 7.1 Authentication Options
Users can sign in using multiple methods for convenience.

**Acceptance Criteria**:
- Email/password authentication
- OAuth providers: Google, GitHub (minimum)
- Magic link authentication (passwordless)
- Session persistence across devices
- Secure token refresh handled by Supabase

### 7.2 No Blame Features
System does not track individual member behavior.

**Acceptance Criteria**:
- Events are household-scoped, not user-scoped
- No "who used it" tracking in product features
- No member rankings or comparisons
- No notifications that expose individual behavior

### 7.3 Receipt Data Security
Receipt files and OCR text are stored securely.

**Acceptance Criteria**:
- Files stored in Supabase Storage with encryption
- Files encrypted in transit (TLS 1.3)
- Access restricted to household members only via RLS
- Files deleted after 90 days by default
- Users can delete receipts manually at any time

### 7.4 Data Minimization
System collects only necessary data.

**Acceptance Criteria**:
- No location data (GPS, IP geolocation)
- No device identifiers (unless IoT explicitly linked)
- No browsing history or external activity
- No payment information (handled by payment processor)

### 7.5 User Control
Users can export and delete their data.

**Acceptance Criteria**:
- Admins can export all household data as JSON
- Users can delete their account (via Supabase Auth)
- Admins can delete household (irreversible)
- Users can delete individual receipts
- Export link expires after 7 days

---

## 8. User Experience

### 8.1 Tone and Voice
UI copy follows sNAKr tone guidelines.

**Acceptance Criteria**:
- In-app: playful, warm, a little cheeky
- Notifications: calm, minimal, factual
- Errors: respectful and helpful
- No guilt language: "You should have tracked this"
- No nagging: "Reminder!!!"

### 8.2 Fasoolya Integration
Fasoolya appears in key moments for warmth.

**Acceptance Criteria**:
- Empty states: "I found a few updates from your receipt. Want me to apply them?"
- Confirmation screens: "We're looking steady. No surprises today."
- Gentle celebrations: "Heads up: a couple essentials are trending Low."
- Never in: notifications, serious errors, blame contexts

### 8.3 Notification Policy
Notifications are calm, batched, and optional.

**Acceptance Criteria**:
- Max 1 push per day by default
- Batch multiple items into one message
- No jokes, no sass, no guilt
- Example: "Essentials trending Low: milk, eggs."
- Users can disable notifications entirely

### 8.4 Error Handling
Errors provide clear next steps.

**Acceptance Criteria**:
- Structure: What happened, Why it matters (optional), What to do next
- Example: "Receipt upload failed. Try again, or choose a clearer photo."
- No technical jargon in user-facing errors
- Errors logged with stack traces for debugging

---

## 9. Performance

### 9.1 API Response Times
API endpoints respond quickly.

**Acceptance Criteria**:
- GET requests: <200ms p95
- POST requests: <500ms p95
- Receipt upload: <2s for file storage (OCR runs async)
- Inventory view: <300ms p95

### 9.2 Receipt Processing
Receipt processing completes in reasonable time.

**Acceptance Criteria**:
- OCR: <30s for typical receipt
- Parsing + mapping: <10s
- Total time to "parsed" status: <60s
- User can navigate away and return to check status

### 9.3 Database Performance
Database queries are optimized.

**Acceptance Criteria**:
- Inventory queries use indexes (household_id, state)
- Event queries use indexes (item_id, created_at)
- Fuzzy item search uses trigram indexes
- RLS policies use indexed joins on household_members

---

## 10. Testing

### 10.1 Receipt Parsing Accuracy
Receipt parsing meets accuracy targets.

**Acceptance Criteria**:
- Line item extraction: 80%+ precision and recall
- Item mapping: 70%+ top-1 accuracy, 90%+ top-3 accuracy
- Store detection: 60%+ accuracy
- Tested with receipts from 5+ common grocery stores

### 10.2 State Transition Logic
State transitions are correct and consistent.

**Acceptance Criteria**:
- Used action: Plenty → OK → Low → Almost out → Out
- Restocked action: Out → Plenty, Almost out → Plenty, Low → OK/Plenty
- Ran out action: any state → Out
- Transitions validated with unit tests

### 10.3 Multi-Tenant Isolation
RLS policies prevent cross-household access.

**Acceptance Criteria**:
- User A cannot access User B's household data
- API returns 403 for unauthorized household access
- Database queries automatically filtered by household
- Tested with integration tests

---

## Non-Functional Requirements

### Scalability
- Support 1000+ households in MVP
- Support 10+ members per household
- Support 100+ items per household
- Support 10 receipt uploads per hour per household

### Availability
- 99.9% uptime via Supabase SLA
- Graceful degradation if OCR service fails
- Offline-first web app (future)

### Security
- Supabase JWT authentication with automatic refresh
- OAuth providers (Google, GitHub)
- Magic link authentication
- Rate limiting: 100 requests/min per user
- SQL injection prevention via Supabase client
- CORS policies for web app
- RLS policies on all tables

### Compliance
- GDPR: Right to access, erasure, rectification, portability
- CCPA: Right to know, delete, opt-out
- Receipt data retention: 90 days default, user-configurable

---

## Out of Scope (MVP)

- ML-based prediction (Phase 2)
- Full Nimbly integration UI (Phase 3.5 - but data format is prepared in Phase 3)
- IoT device integration (Phase 5)
- Barcode scanning
- Price tracking or budget features (Nimbly's responsibility)
- Store recommendations (Nimbly's responsibility)
- Meal planning or recipe features
- Multi-location households
- Expiration date tracking
- Mobile app (web-first)

---

## Nimbly Integration Strategy

### What's Included in MVP (Phase 3.8)
- Restock Intent data model and generation logic
- Database tables for intents and action options
- API endpoint for intent generation
- Format validation against integration contract
- Documentation in OpenAPI

### What's Deferred to Post-MVP (Phase 3.5)
- Handoff UI with user approval flow
- Nimbly API client implementation
- Action Options display UI
- Full integration testing with live Nimbly

### Key Guarantees
- sNAKr works fully without Nimbly (export, manual actions always available)
- User must explicitly approve any handoff
- No automatic purchases or forced automation
- Restock Intent follows `docs/contract.md` specification (v1)

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
- <10% user correction rate on predictions
- <5% error rate on API endpoints

### User Feedback
- "This actually helps" sentiment in user interviews
- <5% churn rate in first month
- Positive word-of-mouth and referrals
