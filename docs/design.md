# sNAKr System Design

Architecture for shared household inventory intelligence.

---

## Design Principles

1. **Event-driven**: All state changes flow through an immutable event log
2. **Confidence-aware**: Predictions include confidence scores and fallbacks
3. **Explainable by default**: Every prediction has reason codes
4. **Household-safe**: No individual attribution in product features
5. **Hardware-agnostic**: Works without IoT, integrates when available
6. **Local-first ready**: Designed for offline-first sync (future)
7. **Integration-ready**: Restock Intent format prepared for Nimbly handoff

---

## Integration Philosophy (sNAKr ↔ Nimbly)

**sNAKr declares need. Nimbly evaluates options. The user decides.**

- **sNAKr** (Awareness layer): Detects what's needed, explains why, estimates urgency
- **Nimbly** (Optimization layer): Evaluates when/where to act, analyzes timing and deals
- **User** (Final authority): Always decides, no forced automation

### Integration Contract Compliance

This design follows `docs/contract.md` (sNAKr-Nimbly Integration Specification v1):

- **Restock Intent** is the handoff artifact from sNAKr to Nimbly
- Every item includes confidence scores and explainable reason codes
- Quantities are suggestions, never requirements
- sNAKr remains fully functional without Nimbly
- User must explicitly approve handoff
- No automatic purchases or cart additions

### Implementation Strategy

- **Phase 1-3 (MVP)**: Core sNAKr + data format preparation (Section 3.8 in tasks)
- **Phase 3.5 (Post-MVP)**: Full handoff UI and Action Options display
- **Principle**: sNAKr never depends on Nimbly for core functionality

---

## System Overview (Text Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Web App     │  │  Mobile App  │  │  Future IoT  │           │
│  │  (Next.js)   │  │  (React      │  │  Devices     │           │
│  │              │  │   Native)    │  │              │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                ┌───────────▼────────────┐
                │   Supabase Auth        │
                │   (OAuth, Magic Links) │
                └───────────┬────────────┘
                            │
                    ┌───────▼─────────┐
                    │   API Gateway   │
                    │   (FastAPI)     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼─────────────────┐
          │                  │                 │
┌─────────▼─────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│  Inventory        │ │  Receipt    │ │  Prediction     │
│  Service          │ │  Service    │ │  Service        │
└─────────┬─────────┘ └──────┬──────┘ └────────┬────────┘
          │                  │                 │
          └──────────────────┼─────────────────┘
                             │
                    ┌────────▼──────────────────────────┐
                    │      Event Bus (Supabase DB)      │
                    │  - inventory.used                 │
                    │  - inventory.restocked            │
                    │  - receipt.confirmed              │
                    └────────┬──────────────────────────┘
                             │
          ┌──────────────────┼─────────────────┐
          │                  │                 │
┌─────────▼─────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│  Restock          │ │  ML Training│ │  Supabase       │
│  Service          │ │  Pipeline   │ │  Storage        │
│                   │ │  (Offline)  │ │  (Receipts)     │
└───────────────────┘ └─────────────┘ └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase       │
                    │  PostgreSQL     │
                    │  (with RLS)     │
                    └─────────────────┘
```

---

## Component Responsibilities

### Client Layer

**Web App (Next.js)**
- Server-side rendering for fast initial load
- Optimistic UI updates for quick actions
- Receipt upload with progress tracking
- Real-time inventory state display
- Restock list with urgency grouping

**Mobile App (React Native, future)**
- Native camera integration for receipt capture
- Push notifications for restock reminders
- Offline-first data sync

**IoT Devices (future)**
- Fridge door sensors
- Weight sensors
- Camera snapshots
- Event emission to API

---

### API Gateway (FastAPI)

**Responsibilities**:
- Request routing and validation
- Supabase JWT verification
- Rate limiting and throttling
- Request/response logging
- Error handling and normalization

**Tech stack**:
- FastAPI (Python)
- Pydantic for request/response schemas
- Supabase client for auth verification
- Redis for rate limiting (future)

---

### Auth Service (Supabase)

**Responsibilities**:
- User registration and login
- OAuth providers (Google, GitHub, etc.)
- Magic link authentication
- JWT token generation and validation
- Session management
- Role-based access control (admin vs member)

**Tech stack**:
- Supabase Auth (built-in)
- OAuth integrations
- Magic link email delivery
- Supabase PostgreSQL for user and household_members tables
    
    # Predict days to low/out based on current state
    state_durations = {
        State.PLENTY: 7,
        State.OK: 5,
        State.LOW: 3,
        State.ALMOST_OUT: 1
    }
    
    days_to_low = state_durations[current_state] - 2
    days_to_out = state_durations[current_state]
    
    # Adjust for usage rate
    if usage_rate > 1.0:  # High usage
        days_to_low *= 0.7
        days_to_out *= 0.7
    
    # Generate reason codes
    reason_codes = []
    if len(usage_events) >= 3:
        reason_codes.append("consistent_usage_pattern")
    if restock_events and days_since_restock <= 3:
        reason_codes.append(f"receipt_confirmed_{days_since_restock}_days_ago")
    
    # Calculate confidence (0.7-0.95 for rules)
    confidence = 0.7
    if len(usage_events) >= 5:
        confidence += 0.1
    if restock_events:
        confidence += 0.1
    
    return Prediction(
        predicted_state=predicted_state,
        confidence=min(confidence, 0.95),
        days_to_low=days_to_low,
        days_to_out=days_to_out,
        reason_codes=reason_codes,
        model_version="rules-v1.0"
    )
```

---

### 6. Restock Service

**Urgency Logic**:
```python
async def generate_restock_list(household_id: UUID) -> dict:
    inventory = get_inventory(household_id)
    predictions = get_predictions(household_id)
    
    need_now = []
    need_soon = []
    nice_to_top_up = []
    
    for item in inventory:
        # Need now: Out or Almost out
        if item.state in [State.OUT, State.ALMOST_OUT]:
            need_now.append(item)
        
        # Need soon: Low or predicted Low within 3 days
        elif item.state == State.LOW:
            need_soon.append(item)
        elif prediction.predicted_state == State.LOW and prediction.confidence >= 0.7:
            need_soon.append(item)
        
        # Nice to top up: OK with consistent usage
        elif item.state == State.OK and "consistent_usage_pattern" in prediction.reason_codes:
            nice_to_top_up.append(item)
    
    return {
        'need_now': need_now,
        'need_soon': need_soon,
        'nice_to_top_up': nice_to_top_up
    }
```

**Restock Intent Generation (for Nimbly)**:
```python
async def generate_restock_intent(household_id: UUID) -> RestockIntent:
    """
    Generate a Restock Intent for Nimbly integration.
    Follows the sNAKr-Nimbly integration contract (v1).
    """
    restock_list = await generate_restock_list(household_id)
    
    # Calculate overall urgency
    overall_urgency = "low"
    if len(restock_list['need_now']) > 0:
        overall_urgency = "high"
    elif len(restock_list['need_soon']) > 3:
        overall_urgency = "medium"
    
    # Build item entries
    item_entries = []
    for item in restock_list['need_now'] + restock_list['need_soon'] + restock_list['nice_to_top_up']:
        prediction = get_prediction(item.id)
        
        item_entries.append({
            'canonical_name': item.name,
            'category': item.category,
            'current_state': item.state,
            'confidence': prediction.confidence if prediction else 0.5,
            'reason_codes': prediction.reason_codes if prediction else [],
            'suggested_quantity': estimate_quantity(item, prediction),
            'quantity_confidence': 0.7  # Rules-based estimate
        })
    
    # Build constraints (user preferences, future)
    constraints = {
        'partial_fulfillment_allowed': True,
        'local_first_preference': 'neutral',  # neutral, prefer, required
        'budget_sensitivity': 'medium'  # low, medium, high
    }
    
    return RestockIntent(
        intent_id=generate_uuid(),
        version='v1',
        household_id=household_id,
        generated_at=datetime.utcnow(),
        overall_urgency=overall_urgency,
        items=item_entries,
        constraints=constraints
    )
```

---

### 7. Nimbly Integration Service (Phase 3)

**Handoff Flow**:
```python
async def initiate_nimbly_handoff(household_id: UUID) -> dict:
    """
    Prepare and send Restock Intent to Nimbly.
    User must explicitly approve the handoff.
    """
    # Generate intent
    intent = await generate_restock_intent(household_id)
    
    # Store intent for audit trail
    await store_intent(intent)
    
    # Return intent for user review
    return {
        'intent': intent,
        'preview': format_intent_preview(intent),
        'handoff_url': f"{NIMBLY_BASE_URL}/intents/review?intent_id={intent.intent_id}"
    }

async def receive_nimbly_response(intent_id: UUID, action_options: dict) -> dict:
    """
    Receive Action Options from Nimbly.
    Store for user review, never auto-execute.
    """
    intent = await get_intent(intent_id)
    
    # Store action options
    await store_action_options(intent_id, action_options)
    
    # Notify household (optional, calm)
    await notify_household(
        intent.household_id,
        "Nimbly found some smart options for your restock list."
    )
    
    return {
        'status': 'received',
        'action_options': action_options
    }
```

**Integration Safeguards**:
- User must explicitly approve handoff to Nimbly
- sNAKr remains fully functional if Nimbly is unavailable
- No automatic purchases or cart additions
- Action Options are advisory, never commands
- User can dismiss or modify any suggestion

---

## Database Design

See `docs/data-model.md` for complete schema.

**Key tables**:
- `households` - Household identity
- `household_members` - Multi-tenant boundary
- `items` - Canonical item catalog
- `inventory` - Current state per item
- `events` - Immutable event log
- `receipts` - Receipt files and status
- `receipt_items` - Parsed line items
- `predictions` - ML predictions
- `restock_list` - Materialized restock view
- `restock_intents` - Nimbly handoff intents (Phase 3)
- `action_options` - Nimbly responses (Phase 3)

**RLS Policies**:
```sql
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventory_household_access ON inventory
  USING (household_id IN (
    SELECT household_id FROM household_members WHERE user_id = auth.uid()
  ));
```

---

## API Design

See `docs/api-contract.md` for complete API specification.

**Key endpoints**:
- `POST /households` - Create household
- `GET /households/:id/items` - List inventory
- `POST /items/:id/used` - Mark item as used
- `POST /receipts` - Upload receipt
- `GET /receipts/:id` - Get parsed items
- `POST /receipts/:id/confirm` - Confirm and apply
- `GET /restock` - Get restock list
- `POST /restock/intent` - Generate Restock Intent for Nimbly (Phase 3)
- `POST /restock/intent/:id/handoff` - Initiate Nimbly handoff (Phase 3)
- `POST /restock/intent/:id/response` - Receive Nimbly Action Options (Phase 3)

---

## Security Design

### Authentication (Supabase)
- JWT tokens managed by Supabase
- OAuth providers: Google, GitHub (configurable)
- Magic link authentication via email
- Session management with automatic refresh
- Email/password with secure hashing

### Authorization
- Supabase RLS policies enforce household boundaries
- API validates Supabase JWT tokens
- Role-based access control (admin vs member)
- auth.uid() function for user context in RLS

### Data Protection
- Receipt files stored in Supabase Storage with encryption
- TLS 1.3 for all API traffic
- 90-day receipt retention by default
- Supabase handles encryption at rest

---

## Performance Optimizations

### Database
- Indexes on household_id, state, created_at
- Trigram indexes for fuzzy item search
- Connection pooling (max 20)
- Query timeout: 30s

### API
- Pagination (limit 50)
- Async processing for OCR
- Rate limiting: 100 req/min per user

### Receipt Processing
- Async OCR with worker queue
- Batch embedding generation

---

## Monitoring

### Metrics
- API request latency (p50, p95, p99)
- Receipt processing success rate
- Prediction accuracy
- Database query performance

### Logging
- Structured logs with request IDs
- Error logs with stack traces
- Event log for audit trail

### Alerting
- High error rates (>5%)
- Receipt processing failures (>20%)
- Database connection issues
- API response time degradation (p95 >1s)

---

## Deployment

### Development
- Supabase local development (supabase start)
- Docker Compose for FastAPI services
- Hot reload for fast iteration

### Production
- Supabase hosted (managed PostgreSQL + Auth + Storage)
- FastAPI on Vercel/Railway/Fly.io
- Next.js on Vercel
- CDN for static assets (built-in with Vercel/Supabase)

---

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Target: 80%+ coverage

### Integration Tests
- API endpoints end-to-end
- Receipt pipeline stages
- Multi-tenant isolation (RLS)

### E2E Tests
- Critical user flows
- Cross-browser testing
- Mobile responsive testing

---

## Future Enhancements

### Phase 2: ML-Based Prediction
- Gradient boosted trees
- Feature engineering
- MLflow for model registry

### Phase 3: Nimbly Integration
- Restock Intent generation API
- Handoff flow UI
- Action Options display

### Phase 5: IoT Integration
- Device linking
- Sensor fusion
- Camera snapshot review

---

## Definition of Done

Design is complete when:
- All components have clear responsibilities
- Receipt pipeline stages are implementable
- Prediction logic is testable
- Database schema supports all features
- API endpoints are fully specified
- Security measures are documented
- Performance targets are defined
- Testing strategy is clear
