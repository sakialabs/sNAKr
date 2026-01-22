# sNAKr MVP Tasks

Implementation tasks for shared household inventory intelligence.

---

## Phase 0: Foundation (2-3 weeks)

### 0.1 Repository Setup
- [x] 0.1.1 Initialize Git repository with .gitignore
- [x] 0.1.2 Create directory structure (api/, web/, docs/, tests/)
- [x] 0.1.3 Set up Docker Compose for local development
- [x] 0.1.4 Update README with setup instructions
- [x] 0.1.5 Set up CI/CD pipeline (GitHub Actions)

### 0.2 Database Setup
- [x] 0.2.1 Create PostgreSQL Docker container
- [x] 0.2.2 Set up Supabase project (local + cloud)
- [x] 0.2.3 Create initial migration: households table
- [x] 0.2.4 Create migration: household_members table with RLS
- [x] 0.2.5 Create migration: items table with trigram indexes
- [x] 0.2.6 Create migration: inventory table
- [x] 0.2.7 Create migration: events table with indexes
- [x] 0.2.8 Create migration: receipts table
- [x] 0.2.9 Create migration: receipt_items table
- [x] 0.2.10 Create migration: predictions table
- [x] 0.2.11 Create migration: restock_list table
- [x] 0.2.12 Test RLS policies with multiple households
- [x] 0.2.13 Set up Supabase Storage bucket for receipts

### 0.3 API Foundation
- [x] 0.3.1 Set up FastAPI project structure
- [x] 0.3.2 Configure Pydantic models for requests/responses
- [x] 0.3.3 Set up Supabase client for database connection
- [x] 0.3.4 Implement Supabase JWT verification middleware
- [x] 0.3.5 Implement rate limiting middleware
- [x] 0.3.6 Set up error handling and logging
- [x] 0.3.7 Create API documentation with OpenAPI

### 0.4 Web App Foundation
- [x] 0.4.1 Set up Next.js project with TypeScript
- [x] 0.4.2 Configure Tailwind CSS with sNAKr color tokens
- [x] 0.4.3 Set up routing structure
- [x] 0.4.4 Set up Supabase client for Next.js
- [x] 0.4.5 Implement authentication flow (email/password, OAuth, magic links)
- [x] 0.4.6 Configure OAuth providers (Google, GitHub, Apple, Facebook)
- [x] 0.4.7 Create layout components (header, nav, footer)
- [x] 0.4.8 Set up API client with fetch
- [x] 0.4.9 Implement error boundary and toast notifications

### 0.5 Mobile App Foundation
- [x] 0.5.1 Set up React Native project with TypeScript
- [x] 0.5.2 Configure Tailwind CSS with sNAKr color tokens
- [x] 0.5.3 Set up navigation structure
- [x] 0.5.4 Set up Supabase client for React Native
- [x] 0.5.5 Implement authentication flow
- [x] 0.5.6 Configure push notifications
- [x] 0.5.7 Create core UI components (buttons, inputs, cards)
- [x] 0.5.8 Set up API client with axios
- [x] 0.5.9 Implement offline support with AsyncStorage

---

## Phase 1: Core Inventory (2-3 weeks)

### 1.1 Household Management
- [x] 1.1.1 Implement POST /households endpoint
- [x] 1.1.2 Implement GET /households endpoint
- [x] 1.1.3 Implement household creation UI
- [x] 1.1.4 Implement household selection UI
- [x] 1.1.5 Implement member invitation endpoint
- [-] 1.1.6 Implement member invitation UI
- [ ] 1.1.7 Implement invite acceptance flow
- [ ] 1.1.8 Test multi-tenant isolation with RLS

### 1.2 Item Management
- [ ] 1.2.1 Implement POST /items endpoint
- [ ] 1.2.2 Implement GET /items endpoint with filters
- [ ] 1.2.3 Implement PATCH /items/:id endpoint
- [ ] 1.2.4 Implement DELETE /items/:id endpoint
- [ ] 1.2.5 Create item creation UI
- [ ] 1.2.6 Create item edit UI
- [ ] 1.2.7 Implement category and location dropdowns
- [ ] 1.2.8 Test item CRUD operations

### 1.3 Inventory State Management
- [ ] 1.3.1 Implement state transition logic
- [ ] 1.3.2 Implement POST /items/:id/used endpoint
- [ ] 1.3.3 Implement POST /items/:id/restocked endpoint
- [ ] 1.3.4 Implement POST /items/:id/ran_out endpoint
- [ ] 1.3.5 Implement idempotency for quick actions
- [ ] 1.3.6 Create quick action buttons UI
- [ ] 1.3.7 Implement optimistic UI updates
- [ ] 1.3.8 Test state transitions with unit tests

### 1.4 Event Log
- [ ] 1.4.1 Implement event creation service
- [ ] 1.4.2 Implement GET /events endpoint with pagination
- [ ] 1.4.3 Create event log UI component
- [ ] 1.4.4 Implement event filtering by type and item
- [ ] 1.4.5 Test event immutability

### 1.5 Inventory View
- [ ] 1.5.1 Create inventory list UI with state badges
- [ ] 1.5.2 Implement location filter (All, Fridge, Pantry, Freezer)
- [ ] 1.5.3 Implement state filter (All, Low, Almost out, Out)
- [ ] 1.5.4 Implement sorting (name, state, last updated)
- [ ] 1.5.5 Create empty state with Fasoolya
- [ ] 1.5.6 Implement item detail view
- [ ] 1.5.7 Show recent events in item detail
- [ ] 1.5.8 Test inventory view with multiple items

---

## Phase 2: Receipt Pipeline (3-4 weeks)

### 2.1 Receipt Upload
- [ ] 2.1.1 Implement POST /receipts endpoint with file upload
- [ ] 2.1.2 Set up Supabase Storage bucket policies for receipts
- [ ] 2.1.3 Implement file validation (type, size)
- [ ] 2.1.4 Implement RLS policies for receipt access
- [ ] 2.1.5 Create receipt upload UI with drag-and-drop
- [ ] 2.1.6 Implement upload progress indicator
- [ ] 2.1.7 Implement idempotency with Idempotency-Key header
- [ ] 2.1.8 Test receipt upload with various file types

### 2.2 OCR Integration
- [ ] 2.2.1 Set up Tesseract OCR in Docker
- [ ] 2.2.2 Implement OCR extraction service
- [ ] 2.2.3 Implement async OCR processing with worker queue
- [ ] 2.2.4 Store raw OCR text in receipts table
- [ ] 2.2.5 Implement OCR error handling and retry logic
- [ ] 2.2.6 Test OCR with receipts from 5+ stores
- [ ] 2.2.7 Measure OCR accuracy and latency

### 2.3 Receipt Parsing
- [ ] 2.3.1 Implement line item extraction from OCR text
- [ ] 2.3.2 Implement store name detection
- [ ] 2.3.3 Implement receipt date detection
- [ ] 2.3.4 Implement total amount detection
- [ ] 2.3.5 Implement per-line confidence scoring
- [ ] 2.3.6 Create store-specific parsing rules (Whole Foods, Trader Joe's, etc.)
- [ ] 2.3.7 Test parsing accuracy with benchmark receipts
- [ ] 2.3.8 Achieve 80%+ line item extraction accuracy

### 2.4 Item Normalization
- [ ] 2.4.1 Implement name cleaning (remove noise, pack info)
- [ ] 2.4.2 Implement unit normalization (oz → ounce, lb → pound)
- [ ] 2.4.3 Implement quantity normalization (2x → 2)
- [ ] 2.4.4 Create normalization rules database
- [ ] 2.4.5 Test normalization with edge cases
- [ ] 2.4.6 Measure normalization accuracy

### 2.5 Item Mapping
- [ ] 2.5.1 Set up sentence-transformers for embeddings
- [ ] 2.5.2 Generate embeddings for household item catalog
- [ ] 2.5.3 Implement embedding similarity search
- [ ] 2.5.4 Implement fuzzy string matching with trigrams
- [ ] 2.5.5 Combine similarity scores (weighted average)
- [ ] 2.5.6 Return top-3 candidates with match scores
- [ ] 2.5.7 Implement confidence threshold (0.7)
- [ ] 2.5.8 Test mapping accuracy: 70%+ top-1, 90%+ top-3

### 2.6 Receipt Review UI
- [ ] 2.6.1 Implement GET /receipts/:id endpoint
- [ ] 2.6.2 Create receipt review UI with parsed items
- [ ] 2.6.3 Show suggested mappings with confidence indicators
- [ ] 2.6.4 Implement item name editing
- [ ] 2.6.5 Implement mapping selection from alternatives
- [ ] 2.6.6 Implement skip item functionality
- [ ] 2.6.7 Implement bulk confirm button
- [ ] 2.6.8 Add clear "what happens next" messaging

### 2.7 Receipt Confirmation
- [ ] 2.7.1 Implement POST /receipts/:id/confirm endpoint
- [ ] 2.7.2 Create inventory.restocked events per confirmed item
- [ ] 2.7.3 Store user edits as training signals
- [ ] 2.7.4 Update receipt status to "confirmed"
- [ ] 2.7.5 Implement confirmation idempotency
- [ ] 2.7.6 Test confirmation with various scenarios

### 2.8 Inventory Application
- [ ] 2.8.1 Implement state transition logic for restocked items
- [ ] 2.8.2 Update inventory states based on quantity
- [ ] 2.8.3 Trigger prediction refresh after confirmation
- [ ] 2.8.4 Trigger restock list refresh
- [ ] 2.8.5 Return updated inventory to client
- [ ] 2.8.6 Test end-to-end receipt flow

### 2.9 Receipt Management
- [ ] 2.9.1 Implement GET /receipts endpoint with pagination
- [ ] 2.9.2 Implement DELETE /receipts/:id endpoint
- [ ] 2.9.3 Create receipt list UI
- [ ] 2.9.4 Implement receipt deletion with confirmation
- [ ] 2.9.5 Implement 90-day retention policy
- [ ] 2.9.6 Test receipt data cleanup

---

## Phase 3: Restock List (1-2 weeks)

### 3.1 Rules-Based Prediction
- [ ] 3.1.1 Implement moving average usage rate calculation
- [ ] 3.1.2 Implement time since last restock calculation
- [ ] 3.1.3 Implement state transition thresholds
- [ ] 3.1.4 Implement days-to-low prediction
- [ ] 3.1.5 Implement days-to-out prediction
- [ ] 3.1.6 Implement confidence scoring (0.7-0.95)
- [ ] 3.1.7 Test prediction logic with unit tests

### 3.2 Reason Code Generation
- [ ] 3.2.1 Implement reason code logic
- [ ] 3.2.2 Add "recent_usage_events" reason
- [ ] 3.2.3 Add "receipt_confirmed_X_days_ago" reason
- [ ] 3.2.4 Add "consistent_weekly_pattern" reason
- [ ] 3.2.5 Test reason code generation

### 3.3 Prediction Service
- [ ] 3.3.1 Implement GET /predictions endpoint
- [ ] 3.3.2 Implement prediction refresh on inventory changes
- [ ] 3.3.3 Implement async prediction processing
- [ ] 3.3.4 Store predictions in predictions table
- [ ] 3.3.5 Implement stale prediction detection (>24 hours)
- [ ] 3.3.6 Test prediction refresh triggers

### 3.4 Restock List Generation
- [ ] 3.4.1 Implement restock list generation logic
- [ ] 3.4.2 Implement "Need now" urgency (Out, Almost out)
- [ ] 3.4.3 Implement "Need soon" urgency (Low, predicted Low)
- [ ] 3.4.4 Implement "Nice to top up" urgency (OK with pattern)
- [ ] 3.4.5 Implement GET /restock endpoint
- [ ] 3.4.6 Test restock list generation

### 3.5 Restock List UI
- [ ] 3.5.1 Create restock list view with three sections
- [ ] 3.5.2 Show item name, state, and reason per item
- [ ] 3.5.3 Show predicted days to Low/Out
- [ ] 3.5.4 Create empty state with Fasoolya
- [ ] 3.5.5 Implement restock list refresh on inventory changes
- [ ] 3.5.6 Test restock list UI with various scenarios

### 3.6 Restock Dismissal
- [ ] 3.6.1 Implement POST /restock/:id/dismiss endpoint
- [ ] 3.6.2 Implement dismissal duration selection (3, 7, 14, 30 days)
- [ ] 3.6.3 Update restock_list table with dismissed_until
- [ ] 3.6.4 Filter dismissed items from restock list
- [ ] 3.6.5 Create dismissal UI with duration picker
- [ ] 3.6.6 Test dismissal and re-surfacing logic

### 3.7 Restock Export
- [ ] 3.7.1 Implement restock list export as plain text
- [ ] 3.7.2 Implement restock list export as JSON
- [ ] 3.7.3 Create copy to clipboard button
- [ ] 3.7.4 Implement system share sheet integration
- [ ] 3.7.5 Test export functionality

### 3.8 Nimbly Integration Preparation
- [ ] 3.8.1 Create restock_intents table with RLS
- [ ] 3.8.2 Create action_options table with RLS
- [ ] 3.8.3 Implement Restock Intent data model (Pydantic)
- [ ] 3.8.4 Implement POST /restock/intent endpoint
- [ ] 3.8.5 Implement intent generation logic per contract
- [ ] 3.8.6 Validate intent format against integration contract
- [ ] 3.8.7 Test intent generation with various restock lists
- [ ] 3.8.8 Document Restock Intent schema in OpenAPI

---

## Phase 3.5: Nimbly Integration (Optional - Post-MVP) (1-2 weeks)

### 3.9 Nimbly Handoff Flow
- [ ] 3.9.1 Implement POST /restock/intent/:id/handoff endpoint
- [ ] 3.9.2 Implement Nimbly API client
- [ ] 3.9.3 Create handoff confirmation UI
- [ ] 3.9.4 Show intent preview before handoff
- [ ] 3.9.5 Implement user approval flow
- [ ] 3.9.6 Handle Nimbly unavailable gracefully
- [ ] 3.9.7 Test handoff with mock Nimbly responses

### 3.10 Action Options Display
- [ ] 3.10.1 Implement POST /restock/intent/:id/response endpoint
- [ ] 3.10.2 Create Action Options UI component
- [ ] 3.10.3 Display timing recommendations
- [ ] 3.10.4 Display expected benefits and confidence
- [ ] 3.10.5 Show reasoning for each option
- [ ] 3.10.6 Implement "Do nothing" option
- [ ] 3.10.7 Test Action Options display with various scenarios

### 3.11 Integration Safeguards
- [ ] 3.11.1 Implement fallback when Nimbly unavailable
- [ ] 3.11.2 Add timeout handling for Nimbly requests
- [ ] 3.11.3 Store intent audit trail
- [ ] 3.11.4 Implement intent versioning (v1, v2)
- [ ] 3.11.5 Test integration contract compliance
- [ ] 3.11.6 Document integration flow for developers

---

## Phase 4: Polish and Testing (1-2 weeks)

### 4.1 Error Handling
- [ ] 4.1.1 Implement consistent error response format
- [ ] 4.1.2 Add user-friendly error messages
- [ ] 4.1.3 Implement error logging with stack traces
- [ ] 4.1.4 Create error UI components (toast, modal)
- [ ] 4.1.5 Test error scenarios (network, validation, server)

### 4.2 Tone and Voice
- [ ] 4.2.1 Review all UI copy for tone consistency
- [ ] 4.2.2 Add Fasoolya to empty states
- [ ] 4.2.3 Add Fasoolya to confirmation screens
- [ ] 4.2.4 Remove any guilt or blame language
- [ ] 4.2.5 Test copy with user feedback

### 4.3 Notifications
- [ ] 4.3.1 Implement notification preferences endpoint
- [ ] 4.3.2 Implement daily restock reminder (batched)
- [ ] 4.3.3 Implement notification opt-out
- [ ] 4.3.4 Test notification batching (max 1 per day)
- [ ] 4.3.5 Ensure notifications are calm and factual

### 4.4 Performance Optimization
- [ ] 4.4.1 Add database query indexes
- [ ] 4.4.2 Implement API response caching
- [ ] 4.4.3 Optimize receipt processing pipeline
- [ ] 4.4.4 Implement lazy loading for inventory list
- [ ] 4.4.5 Measure and optimize API response times
- [ ] 4.4.6 Achieve <200ms p95 for GET requests

### 4.5 Security Audit
- [ ] 4.5.1 Review RLS policies for all tables
- [ ] 4.5.2 Test JWT token expiration and refresh
- [ ] 4.5.3 Test rate limiting enforcement
- [ ] 4.5.4 Review receipt file encryption
- [ ] 4.5.5 Test SQL injection prevention
- [ ] 4.5.6 Implement CORS policies
- [ ] 4.5.7 Run security scan with OWASP ZAP

### 4.6 Integration Testing
- [ ] 4.6.1 Write integration tests for household management
- [ ] 4.6.2 Write integration tests for inventory management
- [ ] 4.6.3 Write integration tests for receipt pipeline
- [ ] 4.6.4 Write integration tests for restock list
- [ ] 4.6.5 Write integration tests for multi-tenant isolation
- [ ] 4.6.6 Achieve 80%+ test coverage

### 4.7 E2E Testing
- [ ] 4.7.1 Write E2E test for household creation flow
- [ ] 4.7.2 Write E2E test for inventory tracking flow
- [ ] 4.7.3 Write E2E test for receipt upload flow
- [ ] 4.7.4 Write E2E test for restock list flow
- [ ] 4.7.5 Test on Chrome, Firefox, Safari
- [ ] 4.7.6 Test on mobile (responsive)

### 4.8 Documentation
- [ ] 4.8.1 Update README with setup instructions
- [ ] 4.8.2 Document API endpoints in OpenAPI
- [ ] 4.8.3 Create developer onboarding guide
- [ ] 4.8.4 Document deployment process
- [ ] 4.8.5 Create user guide for beta testers

### 4.9 Deployment
- [ ] 4.9.1 Set up staging environment
- [ ] 4.9.2 Set up production environment
- [ ] 4.9.3 Configure CI/CD pipeline for auto-deploy
- [ ] 4.9.4 Set up monitoring (Prometheus, Grafana)
- [ ] 4.9.5 Set up error tracking (Sentry)
- [ ] 4.9.6 Set up database backups
- [ ] 4.9.7 Deploy to staging and test
- [ ] 4.9.8 Deploy to production

### 4.10 Beta Testing
- [ ] 4.10.1 Recruit 10+ beta tester households
- [ ] 4.10.2 Onboard beta testers with user guide
- [ ] 4.10.3 Collect feedback via surveys
- [ ] 4.10.4 Monitor usage metrics
- [ ] 4.10.5 Fix critical bugs from beta feedback
- [ ] 4.10.6 Iterate on UX based on feedback

---

## Success Criteria

### Product Metrics
- [ ] 10+ households using sNAKr for 7+ consecutive days
- [ ] 3+ receipts uploaded per household per week
- [ ] 70%+ restock list engagement rate
- [ ] 50%+ reduction in self-reported stockouts

### Quality Metrics
- [ ] 80%+ receipt parsing accuracy (line item extraction)
- [ ] 70%+ item mapping accuracy (top-1)
- [ ] 90%+ item mapping accuracy (top-3)
- [ ] <10% user correction rate on predictions
- [ ] <5% error rate on API endpoints

### User Feedback
- [ ] "This actually helps" sentiment in user interviews
- [ ] <5% churn rate in first month
- [ ] Positive word-of-mouth and referrals

---

## Estimated Timeline

- **Phase 0: Foundation** - 2-3 weeks ✅ COMPLETE
- **Phase 1: Core Inventory** - 2-3 weeks
- **Phase 2: Receipt Pipeline** - 3-4 weeks
- **Phase 3: Restock List** - 1-2 weeks
- **Phase 3.5: Nimbly Integration** - 1-2 weeks (optional, post-MVP)
- **Phase 4: Polish and Testing** - 1-2 weeks

**Total MVP Timeline: 9-14 weeks**
**With Nimbly Integration: 10-16 weeks**

---

## Notes

- Tasks are ordered by dependency (complete earlier tasks before later ones)
- Each phase can have some parallel work (e.g., API and UI tasks)
- Testing tasks should be done alongside feature development
- Beta testing happens after Phase 4 deployment
- Success criteria are measured after 2-4 weeks of beta testing

### Nimbly Integration Notes
- **Phase 3.8** (Nimbly Integration Preparation) is part of MVP to ensure data format readiness
- **Phase 3.5** (Full Nimbly Integration) is optional post-MVP and can be deferred
- Restock Intent format follows the sNAKr-Nimbly integration contract (v1) in `docs/contract.md`
- sNAKr remains fully functional without Nimbly - no hard dependencies
- User must explicitly approve handoff - no automatic purchases
- Integration safeguards: fallback handling, timeout management, audit trail

---

## Integration Contract Compliance Checklist

When implementing Phase 3.8 and 3.5, ensure:

### Restock Intent Structure
- [ ] Intent metadata (ID, version, household_id, timestamp, overall_urgency)
- [ ] Item entries (canonical_name, category, current_state, confidence, reason_codes, suggested_quantity)
- [ ] Constraints (partial_fulfillment_allowed, local_first_preference, budget_sensitivity)

### Guarantees
- [ ] Every item includes confidence score (0-1)
- [ ] Every item includes explainable reason codes
- [ ] Quantities are suggestions, not requirements
- [ ] Intent never implies obligation to buy

### User Experience
- [ ] sNAKr asks permission before handoff
- [ ] Nimbly displays options, not commands
- [ ] User must explicitly confirm any action
- [ ] "Do nothing" is always valid

### Safety Constraints
- [ ] No household member attribution
- [ ] No cross-app identity leakage
- [ ] No surveillance features
- [ ] No forced automation
- [ ] Explicit opt-in for future autopilot


