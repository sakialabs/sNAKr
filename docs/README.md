# sNAKr Documentation

Complete documentation for shared household inventory intelligence.

---

## 📋 MVP Specification

**sNAKr** helps shared households stay stocked and waste less through:
- Fuzzy inventory states (Plenty, OK, Low, Almost out, Out)
- Receipt ingestion with OCR and smart item mapping
- Explainable predictions with confidence scores
- Calm, household-safe UX with no blame features

### Specification Documents

The complete MVP spec is in `.kiro/specs/snakr/`:

- **[Requirements](requirements.md)** - User stories and acceptance criteria
- **[Design](design.md)** - System architecture and technical design
- **[Tasks](tasks.md)** - Detailed implementation tasks by phase

### Success Criteria

**Product Metrics:**
- 10+ households using sNAKr for 7+ consecutive days
- 3+ receipts uploaded per household per week
- 70%+ restock list engagement rate
- 50%+ reduction in self-reported stockouts

**Quality Metrics:**
- 80%+ receipt parsing accuracy
- 70%+ item mapping accuracy (top-1), 90%+ (top-3)
- <10% user correction rate on predictions
- <5% error rate on API endpoints

**Timeline:** 9-14 weeks total (Phase 0 complete, Phase 1 in progress)

---

## Quick Links

### Getting Started
- **[Quick Start](SETUP.md)** - Get running in 10 minutes
- **[Production Setup](PRODUCTION_SETUP.md)** - Deploy to production
- **[Contributing](../CONTRIBUTING.md)** - How to contribute

### Project Vision
- **[Vision & Mission](vision.md)** - Why sNAKr exists
- **[Voice & Tone](tone.md)** - How sNAKr speaks
- **[Design System](styles.md)** - Visual identity

### Technical Docs
- **[Requirements](requirements.md)** - Complete user stories and acceptance criteria
- **[Design](design.md)** - System architecture and technical decisions
- **[Tasks](tasks.md)** - Implementation tasks organized by phase
- **[API Documentation](api.md)** - Complete API reference and guide
- **[Database](database.md)** - Schema, migrations, RLS policies, storage
- **[Roadmap](roadmap.md)** - Phases, architecture, API contract
- **[ML Strategy](ml.md)** - ML pipelines and evaluation
- **[Testing Guide](TESTING.md)** - Testing strategy
- **[CI/CD](ci-cd.md)** - Pipeline documentation
- **[Deployment](deployment.md)** - Production deployment

### Development
- **[Changelog](CHANGELOG.md)** - Version history and progress

---

## Documentation Structure

### MVP Specification

**[requirements.md](requirements.md)** - Complete user stories and acceptance criteria
- Shared household management with roles
- Inventory tracking with fuzzy states
- Receipt ingestion pipeline (upload → OCR → parse → map → confirm)
- Restock list with urgency grouping
- Rules-based predictions with explainability
- Privacy and security constraints

**Key principles:**
- No blame features (no "who used it" tracking)
- Fuzzy states over precision
- Explainable predictions with reason codes
- Household-safe by design

**[design.md](design.md)** - System architecture and technical design
- Component responsibilities (API, services, database)
- Receipt pipeline stages with algorithms
- Prediction logic (rules-based for MVP)
- Database schema with RLS policies
- API endpoints and contracts
- Security and performance considerations

**Key decisions:**
- Event-driven architecture with immutable event log
- Multi-tenant with PostgreSQL RLS
- Async OCR processing with worker queue
- Embedding similarity + fuzzy matching for item mapping
- Confidence-aware predictions with fallbacks

**[tasks.md](tasks.md)** - Detailed implementation tasks organized by phase
- **Phase 0: Foundation** (2-3 weeks) ✅ COMPLETE
- **Phase 1: Core Inventory** (2-3 weeks) - In Progress
- **Phase 2: Receipt Pipeline** (3-4 weeks) - Planned
- **Phase 3: Restock List** (1-2 weeks) - Planned
- **Phase 4: Polish and Testing** (1-2 weeks) - Planned

---

### Vision & Philosophy

**[vision.md](vision.md)** - The why behind sNAKr
- Vision: Everyday essentials handled calmly, locally, with dignity
- Mission: Open, local-first inventory intelligence
- Manifesto: 8 principles (human-first, no shame, household-safe, explainable, local-first, open-source)

**[tone.md](tone.md)** - How sNAKr speaks
- Voice pillars: Human first, calm confidence, mischief with restraint
- Tone by surface: In-app (playful), notifications (calm), errors (helpful)
- Fasoolya guidelines: When and how to use the in-app buddy
- Microcopy patterns: Fuzzy states, restock labels, predictions

**[styles.md](styles.md)** - How sNAKr looks
- Brand anchors: 🦝 🍇 🍎 🍓
- Color system: Grape-forward with apple and strawberry accents
- Typography: Inter, modern and friendly
- Component styling: Buttons, chips, cards, lists
- Accessibility: 4.5:1 contrast, focus rings, 44px tap targets

---

### Technical Documentation

**[API Documentation](api.md)** - Complete API reference and guide
- Authentication (JWT, OAuth, magic links)
- Rate limiting and error handling
- All endpoints with examples
- Request/response schemas
- Pagination, filtering, sorting
- Idempotency and Nimbly integration
- Interactive docs at `/docs` and `/redoc`

**[database.md](database.md)** - Complete database documentation
- Schema overview (9 tables, 1 storage bucket)
- Migration history and verification
- RLS policies and multi-tenant isolation
- Storage configuration for receipts
- Helper functions and triggers
- Query examples and best practices

**[roadmap.md](roadmap.md)** - Phases, architecture, and contracts
- **Phase 0**: Foundation ✅ COMPLETE
- **Phase 1**: MVP with receipts (In Progress)
- **Phase 2**: Prediction (Planned)
- **Phase 3**: Nimbly integration (Planned)
- **Phase 4**: Local-first resilience (Planned)
- **Phase 5**: IoT readiness (Planned)
- Data model, API contract, privacy & security
- Success metrics

**[ml.md](ml.md)** - ML foundation and pipelines
- North Star: Explainable signals that make households steadier
- Product-aligned pillars: Human-first states, receipts as leverage, household-safe
- Online inference pipeline: Receipt → inventory (8 stages)
- Offline training pipeline: Learning loop (6 stages)
- Core ML tasks: Receipt understanding, state inference, depletion forecasting, restock policy
- Evaluation harness: Offline and online metrics
- Explainability: Reason codes, confidence gates, failure modes

---

### Development Guides

**[SETUP.md](SETUP.md)** - Local development setup
- Prerequisites: Docker, Node.js, Git
- Quick start: Clone, Supabase setup, Docker Compose
- Environment variables, database setup, testing setup
- Development workflow, troubleshooting, IDE setup

**[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production deployment guide
- Environment files structure and naming conventions
- Linking local to production Supabase
- Deploying database migrations
- Deploying API, web, and mobile apps
- Security best practices and monitoring

**[TESTING.md](TESTING.md)** - Testing strategy
- Testing philosophy: Behavior, not implementation
- Test types: Unit, integration, E2E
- Receipt parsing tests, multi-tenant isolation tests
- Performance tests, test data, CI, coverage

**[ci-cd.md](ci-cd.md)** - CI/CD pipeline
- GitHub Actions workflows
- Code quality tools (Black, isort, Flake8, ESLint)
- Security scanning (Trivy, Bandit)
- Deployment process
- Best practices

**[deployment.md](deployment.md)** - Production deployment
- Frontend: Netlify (Next.js)
- Backend: Railway/Fly.io (FastAPI)
- Database: Supabase Cloud
- Environment variables, monitoring, troubleshooting

**[CHANGELOG.md](CHANGELOG.md)** - Version history and progress
- Phase 0: Foundation ✅ COMPLETE
- Phase 1: MVP (In Progress)
- Detailed completion status
- Breaking changes

---

## Tech Stack

**Backend:**
- FastAPI (Python) with Pydantic
- PostgreSQL with Row Level Security
- Supabase for auth, database, and storage
- Tesseract OCR for receipt processing
- sentence-transformers for item mapping

**Frontend:**
- Next.js 14 with TypeScript and App Router
- React Native with Expo for mobile
- Tailwind CSS with sNAKr design tokens
- Supabase client for auth and data

**Infrastructure:**
- Docker Compose for local development
- Supabase Cloud for production database
- Vercel/Netlify for web hosting
- Railway/Fly.io for API hosting

---

## Key Features

### Fuzzy States
- Plenty, OK, Low, Almost out, Out
- Human-readable, never numeric in UI
- State transitions via quick actions (Used, Restocked, Ran out)

### Receipt Pipeline
1. **Upload** - Photo or PDF receipt
2. **OCR** - Extract text with Tesseract
3. **Parse** - Extract line items (name, quantity, unit, price)
4. **Normalize** - Clean names and units
5. **Map** - Match to household items with confidence
6. **Review** - User confirms or edits mappings
7. **Confirm** - Create inventory events
8. **Apply** - Update inventory states

### Restock List
- **Need now**: Out or Almost out items
- **Need soon**: Low items or predicted Low within 3 days
- **Nice to top up**: OK items with consistent usage patterns
- Dismissal with configurable duration (3, 7, 14, 30 days)

### Predictions
- Rules-based for MVP (moving average, time since restock)
- Confidence scores (0.7-0.95)
- Reason codes: "recent_usage_events", "receipt_confirmed_3_days_ago", "consistent_weekly_pattern"
- Low confidence triggers softer UX

---

## Privacy & Security

### Data Minimization
- No individual attribution for inventory actions
- Receipt files deleted after 90 days
- No location data, device IDs, or browsing history

### Household Safety
- No blame features
- No "who used it" tracking
- No guilt language in UI or notifications
- Events are household-scoped, not user-scoped

### Security Measures
- JWT authentication with Supabase
- RLS policies enforce household boundaries
- Receipt files encrypted at rest
- TLS 1.3 for all API traffic
- Rate limiting: 100 req/min per user

---

## How to Use This Documentation

### For New Contributors
1. Start with **[vision.md](vision.md)** to understand the why
2. Read **[requirements.md](requirements.md)** for feature scope
3. Read **[tone.md](tone.md)** and **[styles.md](styles.md)** for voice and design
4. Follow **[SETUP.md](SETUP.md)** to get running locally
5. Read **[../CONTRIBUTING.md](../CONTRIBUTING.md)** for contribution guidelines

### For Developers
1. Read **[requirements.md](requirements.md)** and **[design.md](design.md)** for architecture
2. Follow **[tasks.md](tasks.md)** for implementation order
3. Follow **[SETUP.md](SETUP.md)** for local development
4. Use **[TESTING.md](TESTING.md)** for testing strategy
5. Reference **[ci-cd.md](ci-cd.md)** for CI/CD workflows

### For DevOps
1. Follow **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** for production deployment
2. Follow **[deployment.md](deployment.md)** for hosting setup
3. Reference **[ci-cd.md](ci-cd.md)** for pipeline configuration
4. Review **[SETUP.md](SETUP.md)** for Docker architecture

### For Product Managers
1. Read **[vision.md](vision.md)** for product philosophy
2. Review **[requirements.md](requirements.md)** for feature scope
3. Review **[roadmap.md](roadmap.md)** for phases and metrics
4. Track progress with **[CHANGELOG.md](CHANGELOG.md)**

### For Designers
1. Read **[tone.md](tone.md)** for voice guidelines
2. Read **[styles.md](styles.md)** for design tokens
3. Review **[requirements.md](requirements.md)** for UX requirements
4. Ensure Fasoolya appears in empty states

---

## Documentation Maintenance

- Update **CHANGELOG.md** with every release
- Update **roadmap.md** when phases complete
- Update **deployment.md** when infrastructure changes
- Update **TESTING.md** when test strategy changes
- Keep **SETUP.md** current with latest setup steps

---

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Reach out to maintainers if stuck

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
