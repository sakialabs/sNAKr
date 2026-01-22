# 🍇 sNAKr

**Stay stocked. Waste less.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20Next.js%20%7C%20Supabase-green.svg)](docs/README.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)](docs/tasks.md)

sNAKr is a people-first app for shared household inventory. It learns from receipts, keeps tracking human with fuzzy stock states, and helps your home restock with less stress, less waste, and fewer "how are we out again?" moments.

---

## 📑 Table of Contents

- [🦝 Meet Fasoolya](#-meet-fasoolya)
- [✨ What sNAKr Does](#-what-snakr-does)
- [🌱 Why It Exists](#-why-it-exists)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🦝 Meet Fasoolya

Fasoolya is your in-app buddy who keeps an eye on your household inventory, notices when essentials are trending toward "uh oh," and helps you restock before it turns into a last-minute scramble. No nagging. No blame. Just the right nudge at the right time.

---

## ✨ What sNAKr Does

- Tracks **shared household inventory** for fridge + pantry
- Uses **fuzzy stock states**: `Plenty`, `OK`, `Low`, `Almost out`, `Out`
- Ingests **receipts (photo or PDF)** so inventory stays fresh with minimal effort
- Flags **shortages early** with simple, explainable prediction
- Builds a **restock list** so essentials don't sneak up on you
- Designed as a **Nimbly satellite** for smarter restocking decisions later

---

## 🌱 Why It Exists

Households are busy. Groceries are expensive. Food waste is ridiculous.

Most inventory apps either overwhelm you or expect perfect data. And once multiple people share a kitchen, everything gets messy.

sNAKr exists to help everyday people:
- Waste less without trying so hard
- Avoid duplicate buys and surprise shortages
- Keep the household in sync with minimal effort

Small signals. Real relief.

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Node.js 18+** (for Supabase CLI)
- **Git** for version control

### Get Running in 3 Steps

```bash
# 1. Clone and navigate
git clone https://github.com/sakialabs/snakr.git
cd snakr

# 2. Set up Supabase (local development)
./scripts/setup-supabase.sh  # macOS/Linux
# or
.\scripts\setup-supabase.ps1  # Windows

# 3. Configure OAuth providers (Google, GitHub minimum)
./scripts/setup/configure-oauth.sh  # macOS/Linux
# or
.\scripts\setup\configure-oauth.ps1  # Windows

# 4. Start all services
./scripts/dev/start-all.sh  # macOS/Linux
# or
.\scripts\dev\start-all.ps1  # Windows
```

**Full setup guide:** See [docs/SETUP.md](docs/SETUP.md) for detailed instructions including OAuth configuration.

### Access Your Services

- **Supabase Studio**: http://localhost:54323
- **API Docs**: http://localhost:8000/docs (coming soon)
- **Web App**: http://localhost:3000 (coming soon)
- **Database**: localhost:54322 (Supabase PostgreSQL)

### Verify Everything's Running

```bash
# Check Supabase services
supabase status

# Check Docker services
docker-compose ps
```

You should see all Supabase services running (API, DB, Studio, Auth, Storage, etc.)

---

## 📊 Project Status

### Phase 0: Foundation ✅ COMPLETE
- ✅ Repository and Docker setup
- ✅ CI/CD pipeline
- ✅ Supabase configuration
- ✅ Database schema (9 tables, 1 storage bucket)
- ✅ Multi-tenant isolation with RLS
- ✅ Authentication (OAuth + magic links)
- ✅ Fuzzy search for receipt mapping

### Phase 1: MVP (In Progress)
- ⏳ API endpoints
- ⏳ Web app UI
- ⏳ Household management
- ⏳ Inventory tracking
- ⏳ Receipt upload and processing

**See [docs/CHANGELOG.md](docs/CHANGELOG.md) for detailed progress**

---

## 🛠️ Tech Stack

### Backend
- **API**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15 with RLS
- **Cache**: Redis 7
- **Task Queue**: Celery
- **Storage**: MinIO (S3-compatible)
- **OCR**: Tesseract

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **State**: Zustand

### Infrastructure
- **Containers**: Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Netlify (web), Render (api)

---

## 📚 Documentation

### Getting Started
- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions with OAuth configuration
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

### Project Vision
- **[Vision & Mission](docs/vision.md)** - Why sNAKr exists
- **[Voice & Tone](docs/tone.md)** - How sNAKr speaks
- **[Design System](docs/styles.md)** - Visual identity

### Technical Docs
- **[Roadmap](docs/roadmap.md)** - Phases, architecture, API contract
- **[ML Strategy](docs/ml.md)** - ML pipelines and evaluation
- **[Testing Guide](docs/TESTING.md)** - Testing strategy
- **[CI/CD](docs/ci-cd.md)** - Pipeline documentation
- **[Deployment](docs/deployment.md)** - Production deployment

### Development
- **[Changelog](docs/CHANGELOG.md)** - Version history
- **[API Reference](http://localhost:8000/docs)** - Interactive API docs (when running)

---

## 🤝 Contributing

We welcome contributions! Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

### Good First Issues

Look for issues tagged:
- `good-first-issue` - Great for newcomers
- `help-wanted` - We need help
- `documentation` - Improve docs

### Development Workflow

```bash
# Start all services
./scripts/dev/start-all.sh  # macOS/Linux
.\scripts\dev\start-all.ps1  # Windows

# View logs
docker-compose logs -f celery  # Celery worker
supabase logs                  # Supabase

# Run tests
cd api && pytest

# Format code
cd api && black . && ruff check .

# Stop services
./scripts/dev/stop-all.sh  # macOS/Linux
.\scripts\dev\stop-all.ps1  # Windows
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for more details.

---

## 📄 License

[MIT License](LICENSE)

---

## 🙏 Acknowledgments

Built with 💖 for everyday people tryna stay stocked and not get rocked.


Dedicated to everyone who's ever said "how are we out of milk again?"

---

**Ready to get started?** Run `./scripts/dev/start-all.sh` and you're off! 🚀
