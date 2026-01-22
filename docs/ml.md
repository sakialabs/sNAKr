# 🍇 sNAKr ML Groundwork
Revolutionary, but measurable.

This document locks the ML foundation for sNAKr: what we model, what we log, how we evaluate, and how we ship intelligence without turning the app into a black box.

sNAKr ML is built around a simple promise:

**Explainable signals that make households steadier.**  
Not hype. Not surveillance. Not vibes.

---

## North Star

### The outcomes we optimize
- Fewer stockouts on essentials
- Less food waste
- Fewer duplicate purchases
- Lower decision fatigue in shared households

### The ML principle
**Prediction is only useful if it is trusted.**  
Trust comes from:
- confidence scores
- clear explanations
- safe defaults and fallbacks
- user control

---

## Product-aligned ML pillars

### 1) Human-first states
We model fuzzy states because that is how households live.

Canonical states:
- `Plenty`
- `OK`
- `Low`
- `Almost out`
- `Out`

The model may use numeric estimates internally, but the product speaks human.

### 2) Receipts do the heavy lifting
Receipt ingestion is the highest leverage input:
- low friction for real households
- high signal for the system
- excellent training data for learning loops

### 3) Household-safe by design
No blame. No policing. No “who used what” features.
We do not build models that rank or expose household members.

### 4) Local-first resilience
Models should support steadier restocking and practical local-first preferences.
No preachy sustainability. Just better defaults, optional nudges, and less waste.

### 5) Awareness vs action
sNAKr provides **inventory truth** and **shortage prediction**.  
Nimbly handles **restocking action** (timing, options, savings, fulfillment).

---

## Pipelines and frameworks (locked)

sNAKr ML is organized into two pipelines:
- an **online inference pipeline** (runs during app use)
- an **offline training pipeline** (runs on schedules and produces improved models)

Everything is reproducible and containerized.

### Frameworks

**Backend and services**
- **FastAPI**: receipt processing and inference endpoints
- **Pydantic**: typed contracts for requests, responses, and events
- **PostgreSQL**: source of truth for events, receipts, items, predictions

**ML and data**
- **pandas + numpy**: feature building and dataset shaping
- **scikit-learn**: baselines, calibration, classical models
- **PyTorch**: optional for learned models when baselines hit limits
- **sentence-transformers**: embeddings for receipt item mapping to canonical items

**MLOps and reproducibility**
- **MLflow**: experiment tracking and model registry
- **DVC**: dataset versioning (synthetic + opt-in real receipts)
- **Docker**: repeatable environments for training and inference
- Optional orchestration later: **Prefect** (simple) or **Airflow** (heavier)

---

## Online inference pipeline (receipt → inventory)

This pipeline runs when a household uploads a receipt. It must be fast, safe, explainable, and confidence-aware.

### Stages

1) **Ingest**
- Store receipt file (image/PDF) and metadata
- Create `receipt.ingested` event

2) **OCR**
- Extract raw text and layout hints
- Persist raw output securely for debugging and evaluation

3) **Parse**
- Convert OCR output into candidate line items:
  - `raw_name`, `qty`, `unit`, `price`
- Assign per-line confidence

4) **Normalize**
- Clean names (remove noise, pack info, repeated tokens)
- Normalize units and quantities
- Detect store where possible

5) **Map**
- Map each line item to a canonical `item_id`
- Use embedding similarity + fuzzy matching
- Return top-k candidates with confidence

6) **Suggest**
- Generate proposed inventory updates (state changes and/or quantity deltas)
- Attach reason codes and confidence

7) **Confirm**
- User reviews and confirms updates
- Log edits as training signals
- Create `receipt.confirmed` event

8) **Apply**
- Apply updates to household inventory
- Refresh predictions and restock list

### Outputs
- `receipt_items[]` with confidences
- `inventory_update_suggestions[]` with reason codes
- Updated fuzzy states for affected items

---

## Offline training pipeline (learning loop)

This pipeline turns everyday household behavior into better models over time, without increasing user work.

### Stages

1) **Extract**
- Pull event traces and confirmed receipt mappings
- Build training datasets for each task:
  - receipt mapping
  - pantry state inference
  - depletion forecasting

2) **Transform**
- Feature engineering examples:
  - time since last restock
  - usage cadence and recency
  - receipt cadence
  - day-of-week and seasonality signals
  - category-level behavior (dairy vs produce vs staples)

3) **Train**
- Always beat baselines before shipping
- Train models per task, per version

4) **Evaluate**
- Run fixed test suites and regression checks
- Track:
  - mapping accuracy
  - macro F1 for fuzzy states
  - MAE for time-to-low/time-to-out
  - calibration and coverage

5) **Register**
- Log runs to MLflow
- Promote models only if they improve key metrics and do not regress safety

6) **Deploy**
- Inference service loads models by version
- Rollouts are gated behind confidence thresholds
- Deterministic fallbacks remain available

---

## Core ML tasks

### Task A: Receipt understanding (must ship early)
**Goal:** turn messy receipts into structured items and inventory updates.

**Inputs**
- receipt image/PDF
- store metadata (if detected)
- OCR text
- household item catalog

**Outputs**
- structured receipt line items: name, quantity, unit, price
- mapping to canonical items with confidence
- suggested inventory updates

**Approach**
- OCR as extraction layer
- parsing and normalization layer
- item mapping layer using embeddings + fuzzy matching
- store templates for repeated layouts (optional but powerful)

**Metrics**
- line item extraction precision/recall
- item mapping accuracy (top-1 and top-3)
- unit and quantity extraction accuracy
- confidence calibration

**Why this matters**
Receipts keep sNAKr accurate without turning households into data entry clerks.

---

### Task B: Pantry state inference (fuzzy state classifier)
**Goal:** infer the current state per item with confidence.

**Inputs**
- last known state
- inventory events: Used, Restocked, Ran out
- receipt updates
- time since last update
- category context

**Outputs**
- predicted state: Plenty/OK/Low/Almost out/Out
- confidence score
- reason codes (explainable factors)

**Metrics**
- macro F1 across 5 classes
- calibration score
- coverage at confidence thresholds
- realistic transitions (avoid weird jumps unless supported by data)

**Product rules**
- low confidence triggers soft UX, not strong nudges
- corrections become training signals, not punishments

---

### Task C: Depletion forecasting (time-to-low, time-to-out)
**Goal:** estimate when an item will become Low or Out.

**Inputs**
- event history
- receipt cadence
- seasonality patterns
- category patterns

**Outputs**
- predicted days-to-Low and days-to-Out
- uncertainty window (range)
- confidence

**Baselines**
- moving average usage rate
- exponential smoothing

**Models**
- gradient boosted trees with engineered features
- sequence models only if justified by clear gains

**Metrics**
- MAE for days-to-event
- interval coverage for uncertainty windows
- false alarm rate for “Need now” and “Need soon” recommendations

---

### Task D: Restock policy (decision layer)
**Goal:** recommend what to restock, when, and how urgently.

This is not full RL in V1. It is high quality decisioning with constraints.

**Inputs**
- inferred states + confidence
- forecasts + uncertainty
- thresholds
- local-first preferences (optional)
- budget preferences (optional)

**Outputs**
- restock buckets: Need now / Need soon / Nice to top up
- reason codes that are human readable

**Metrics**
- precision of “Need now” items
- dismiss rate (users ignoring nudges)
- correction rate (users overriding suggestions)
- stockout reduction over time

**Nimbly contract**
sNAKr decides **what** and **when**.  
Nimbly decides **where** and **how**.

---

## Data logging strategy (non-negotiable)

Everything ML needs is powered by an event log that is:
- minimal
- auditable
- privacy-conscious

### Event types
- `inventory.used`
- `inventory.restocked`
- `inventory.ran_out`
- `receipt.ingested`
- `receipt.confirmed`
- optional future:
  - `iot.door_opened`
  - `iot.weight_changed`
  - `iot.snapshot_available`

### Required fields (every event)
- `event_id`
- `household_id`
- `timestamp`
- `source` (manual, receipt, iot)
- `item_id` (or null for receipt events that map to multiple)
- `payload` (small, typed)
- `confidence` (0 to 1 when applicable)
- `app_version`

### Receipt logging (for ML and debugging)
Store:
- raw OCR text (secured)
- parsed lines
- mapping candidates and chosen mapping
- confidence scores
- user confirmations and edits

### Privacy posture
- no mandatory identity attribution per event in the product UI
- optional personalization can exist privately, never exposed as blame
- minimize retention of raw receipt data where possible

---

## Evaluation harness (so we do not lie to ourselves)

### Offline evaluation
- fixed test sets per store template
- mapping benchmark suite
- state inference benchmark suite
- forecasting benchmark suite
- regression checks on every model promotion

### Online evaluation (when app exists)
Measure:
- stockout rate
- dismiss rate
- correction rate
- duplicate purchase reduction proxy
- waste reduction proxy (optional signals)

---

## Explainability and safety

### Explanations must exist
Every prediction can surface reason codes like:
- “recent usage events”
- “receipt confirmed 3 days ago”
- “threshold reached”
- “consistent weekly pattern”

### Confidence gates
- low confidence means softer UX
- no auto actions without high confidence and explicit opt-in
- forecasts include uncertainty ranges

### Failure modes we design for
- messy receipts
- missing receipts
- shared household behavior shifts
- seasonal changes
- item name ambiguity

Deterministic fallbacks stay available.

---

## IoT and sensor fusion readiness

IoT is an optional signal stream, not a dependency.

### Principle
Receipts and user actions are primary.  
IoT signals adjust confidence, not reality.

### Example fusion logic
- door open patterns can raise likelihood of consumption
- weight change can strengthen a state transition
- snapshot availability can validate ambiguous cases

### Safety
IoT never triggers blame and never becomes required to use the app.

---

## What “revolutionary” means here

Not sci-fi. Not surveillance. Not “AI” stickers.

Revolutionary means:
- households stop doing invisible labor
- waste goes down without guilt
- restocking becomes calm and local-first
- the system stays open, explainable, and community-shaped

---

## Definition of done for ML groundwork

- Event schema implemented and stable
- Receipt pipeline returns structured items with confidence
- Evaluation harness exists with baseline metrics
- State inference produces fuzzy states with confidence
- Forecasting baseline exists with uncertainty windows
- Explanations are available for all predictions
- Privacy rules are enforced by design
- Deterministic fallbacks are always available
