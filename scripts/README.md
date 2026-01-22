# Scripts

Development and utility scripts for sNAKr, organized by purpose.

## Quick Reference

```bash
# First-time setup
./scripts/setup/setup.sh              # macOS/Linux
.\scripts\setup\setup.ps1             # Windows

# Daily development
./scripts/dev/start-all.sh            # Start Supabase + Redis + Celery
.\scripts\dev\start-all.ps1           # Windows

./scripts/dev/stop-all.sh             # Stop all services
.\scripts\dev\stop-all.ps1            # Windows

# Utilities
./scripts/utils/health.sh             # Check service health
./scripts/utils/logs.sh [service]     # View logs
./scripts/utils/cleanup-docker.sh     # Clean old containers
.\scripts\utils\cleanup-docker.ps1    # Windows

# Reset
./scripts/dev/reset.sh                # Clean slate (deletes data!)
.\scripts\dev\reset.ps1               # Windows
```

---

## Folder Structure

```
scripts/
├── README.md                         # This file
│
├── setup/                            # First-time setup scripts
│   ├── setup.sh / .ps1              # Complete project setup
│   ├── supabase.sh / .ps1           # Supabase-only setup
│   ├── configure-oauth.sh / .ps1    # OAuth provider setup
│   ├── link-production.sh / .ps1    # Link to production Supabase
│   └── test-oauth-config.sh / .ps1  # Test OAuth configuration
│
├── dev/                              # Daily development scripts
│   ├── start-all.sh / .ps1          # Start Supabase + Redis + Celery
│   ├── stop-all.sh / .ps1           # Stop all services
│   ├── start.sh / .ps1              # Start legacy services (deprecated)
│   ├── stop.sh / .ps1               # Stop legacy services (deprecated)
│   └── reset.sh / .ps1              # Reset to clean slate
│
└── utils/                            # Utility scripts
    ├── health.sh / .ps1             # Health checks
    ├── logs.sh / .ps1               # View logs
    └── cleanup-docker.sh / .ps1     # Clean old containers
```

---

## Setup Scripts

### `setup/setup.sh` / `setup.ps1`
**Complete first-time setup**

Runs Supabase setup, builds Docker images, and starts all services.

**Usage:**
```bash
# macOS/Linux
./scripts/setup/setup.sh

# Windows
.\scripts\setup\setup.ps1
```

**What it does:**
- Installs Supabase CLI (if needed)
- Starts Supabase services
- Builds Docker images
- Starts all services
- Displays connection info

**Prerequisites:**
- Docker Desktop running
- Node.js 18+

---

### `setup/supabase.sh` / `supabase.ps1`
**Supabase-only setup**

Sets up just Supabase for local development.

**Usage:**
```bash
# macOS/Linux
./scripts/setup/supabase.sh

# Windows
.\scripts\setup\supabase.ps1
```

**What it does:**
- Installs Supabase CLI (if needed)
- Starts Supabase services
- Displays credentials
- Creates `.env` files

---

## Development Scripts

### `dev/start-all.sh` / `start-all.ps1`
**Start all development services**

Starts Supabase, Redis, and Celery worker in one command.

**Usage:**
```bash
# macOS/Linux
./scripts/dev/start-all.sh

# Windows
.\scripts\dev\start-all.ps1
```

**What it does:**
- Starts Supabase (database, auth, storage)
- Starts Redis (Celery message broker)
- Starts Celery worker (async tasks)
- Shows service status and URLs

**Services started:**
- Supabase Studio: http://127.0.0.1:54323
- Supabase API: http://127.0.0.1:54321
- Redis: localhost:6379
- Celery Worker: snakr-celery

**Note:** API and Web must be started separately:
```bash
# API
cd api && conda activate snakr && python main.py

# Web
cd web && npm run dev
```

---

### `dev/stop-all.sh` / `stop-all.ps1`
**Stop all services**

Stops Supabase, Redis, and Celery worker.

**Usage:**
```bash
# macOS/Linux
./scripts/dev/stop-all.sh

# Windows
.\scripts\dev\stop-all.ps1
```

**What it does:**
- Stops Redis and Celery (docker-compose down)
- Stops Supabase (supabase stop)

---

### `dev/reset.sh` / `reset.ps1`
**Reset to clean slate**

⚠️ **WARNING: Deletes all data!**

Completely resets the development environment.

**Usage:**
```bash
# macOS/Linux
./scripts/dev/reset.sh

# Windows
.\scripts\dev\reset.ps1
```

**What it does:**
- Stops all services
- Removes Docker volumes
- Clears Supabase data
- Starts fresh
- Applies migrations

**Use when:**
- Database is corrupted
- Need to test migrations from scratch
- Want to start completely fresh

---

## Utility Scripts

### `utils/health.sh` / `health.ps1`
**Check service health**

Verifies all services are running and responding.

**Usage:**
```bash
# macOS/Linux
./scripts/utils/health.sh

# Windows
.\scripts\utils\health.ps1
```

**What it checks:**
- Supabase status
- Docker services
- API health endpoint
- Web app
- MinIO

---

### `utils/logs.sh` / `logs.ps1`
**View service logs**

Stream logs from Docker services.

**Usage:**
```bash
# All services
./scripts/utils/logs.sh              # macOS/Linux
.\scripts\utils\logs.ps1             # Windows

# Specific service
./scripts/utils/logs.sh redis        # macOS/Linux
.\scripts\utils\logs.ps1 redis       # Windows
```

**Available services:**
- `redis` - Redis message broker
- `celery` - Celery worker

---

### `utils/cleanup-docker.sh` / `cleanup-docker.ps1`
**Clean up old Docker containers**

Removes old Docker containers and volumes from previous setup.

**Usage:**
```bash
# macOS/Linux
./scripts/utils/cleanup-docker.sh

# Windows
.\scripts\utils\cleanup-docker.ps1
```

**What it does:**
- Stops old docker-compose services
- Removes old containers (snakr-api, snakr-web, snakr-db, snakr-minio)
- Removes old volumes (postgres_data, redis_data, minio_data)
- Shows current running containers

**Note:** Keeps Supabase containers running

---

## Typical Workflows

### First Time Setup
```bash
# 1. Clone the repo
git clone https://github.com/sakialabs/snakr.git
cd snakr

# 2. Run setup
./scripts/setup/setup.sh              # macOS/Linux
.\scripts\setup\setup.ps1             # Windows

# 3. Access services
# Supabase Studio: http://localhost:54323
# API: http://localhost:8000/docs
# Web: http://localhost:3000
```

### Daily Development
```bash
# Start all services
./scripts/dev/start-all.sh            # macOS/Linux
.\scripts\dev\start-all.ps1           # Windows

# Start API (in separate terminal)
cd api && conda activate snakr && python main.py

# Start Web (in separate terminal)
cd web && npm run dev

# Check health
./scripts/utils/health.sh             # macOS/Linux
.\scripts\utils\health.ps1            # Windows

# View logs
./scripts/utils/logs.sh celery        # macOS/Linux
.\scripts\utils\logs.ps1 celery       # Windows

# Stop when done
./scripts/dev/stop-all.sh             # macOS/Linux
.\scripts\dev\stop-all.ps1            # Windows
```

### Troubleshooting
```bash
# Reset everything
./scripts/dev/reset.sh                # macOS/Linux
.\scripts\dev\reset.ps1               # Windows

# Check service health
./scripts/utils/health.sh             # macOS/Linux
.\scripts\utils\health.ps1            # Windows

# View specific service logs
./scripts/utils/logs.sh api           # macOS/Linux
.\scripts\utils\logs.ps1 api          # Windows
```

---

## Troubleshooting

### Permission Denied (macOS/Linux)

Make scripts executable:
```bash
chmod +x scripts/**/*.sh
```

Or use Git:
```bash
git update-index --chmod=+x scripts/setup/setup.sh
git update-index --chmod=+x scripts/setup/supabase.sh
git update-index --chmod=+x scripts/dev/start.sh
git update-index --chmod=+x scripts/dev/stop.sh
git update-index --chmod=+x scripts/dev/reset.sh
git update-index --chmod=+x scripts/utils/health.sh
git update-index --chmod=+x scripts/utils/logs.sh
```

### PowerShell Execution Policy (Windows)

Allow script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Not Running

Start Docker Desktop before running any scripts.

### Supabase CLI Not Found

Install Supabase CLI:
```bash
# npm (all platforms)
npm install -g supabase

# Homebrew (macOS)
brew install supabase/tap/supabase

# Scoop (Windows)
scoop install supabase
```

### Port Already in Use

Check what's using the port:
```bash
# macOS/Linux
lsof -i :54321

# Windows
netstat -ano | findstr :54321
```

Then either:
- Stop the conflicting service
- Change the port in `supabase/config.toml`

---

## See Also

- [Setup Guide](../docs/SETUP.md) - Detailed setup instructions
- [Supabase README](../supabase/README.md) - Supabase configuration
- [Deployment Guide](../docs/deployment.md) - Production deployment
