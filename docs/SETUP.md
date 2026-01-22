# Development Setup

Get sNAKr running locally in under 10 minutes.

---

## Prerequisites

Install these before starting:

- **Docker** and **Docker Compose** (for PostgreSQL and services)
- **Node.js 18+** (for web app)
- **Python 3.11+** (for API)
- **Git** (for version control)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/sakialabs/snakr.git
cd snakr
```

### 2. Start Supabase

```bash
supabase start
```

This starts:
- PostgreSQL with RLS (port 54322)
- Auth service (JWT, OAuth)
- Storage service (receipts)
- Studio UI (http://127.0.0.1:54323)

### 3. Start Redis & Celery

The API uses Docker for background task processing. You can choose between two build options:

**LITE Build (Recommended for Development)**
- Build time: 5-10 minutes
- Excludes ML dependencies (sentence-transformers, numpy)
- Perfect for most development work

**FULL Build**
- Build time: 20-40 minutes
- Includes all ML dependencies
- Required for prediction features

```bash
# Interactive setup (prompts you to choose)
./scripts/setup/setup.sh              # Linux/Mac
.\scripts\setup\setup.ps1             # Windows

# Or specify build type
./scripts/setup/setup.sh --lite       # Linux/Mac
.\scripts\setup\setup.ps1 -Lite       # Windows
```

This starts:
- Redis (port 6379, Celery message broker)
- Celery Worker (async tasks)

**Manual build (if needed):**
```bash
# Lite build
INSTALL_ML=false docker-compose up -d --build

# Full build
INSTALL_ML=true docker-compose up -d --build
```

**Switching builds:**
To switch between lite/full, just run the setup script again with your desired option.

### 3. Set up the API (FastAPI)

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start API server
uvicorn main:app --reload --port 8000
```

API now running at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 4. Set up the web app (Next.js)

```bash
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Web app now running at: http://localhost:3000

---

## Environment Variables

### Root (.env)

Create `.env` in the root directory:

```env
# Supabase OAuth Providers
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-google-client-id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-secret

SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your-github-client-id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your-github-secret

# Optional: Apple OAuth (for iOS)
SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID=com.snakr.auth
SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=your-apple-secret

# Optional: Facebook OAuth
SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID=your-facebook-app-id
SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET=your-facebook-secret
```

### API (.env)

Create `api/.env`:

```env
# Database
DATABASE_URL=postgresql://snakr:snakr@localhost:5432/snakr

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1

# Receipt Storage
RECEIPT_STORAGE_PATH=./storage/receipts
RECEIPT_MAX_SIZE_MB=10

# OCR
OCR_ENGINE=tesseract
TESSERACT_PATH=/usr/bin/tesseract

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Environment
ENVIRONMENT=development
```

### Web App (.env.local)

Create `web/.env.local`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# OAuth Providers (for web app)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Optional: Apple OAuth
APPLE_CLIENT_ID=com.snakr.auth
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id

# Optional: Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

---

## OAuth Configuration

sNAKr supports multiple OAuth providers for authentication. Minimum required: Google and GitHub.

### Quick Setup (Recommended)

Use the interactive configuration script:

```bash
# Linux/Mac
chmod +x scripts/setup/configure-oauth.sh
./scripts/setup/configure-oauth.sh

# Windows
.\scripts\setup\configure-oauth.ps1
```

The script will guide you through creating OAuth apps and updating environment files.

### Manual Setup

#### 1. Create OAuth Apps

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect URI: `http://localhost:54321/auth/v1/callback`
5. Copy Client ID and Secret

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Set callback URL: `http://localhost:54321/auth/v1/callback`
4. Copy Client ID and Secret

**Apple OAuth (Optional):**
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Create Service ID for Sign In with Apple
3. Configure domains and redirect URLs
4. Create and download private key (.p8)

**Facebook OAuth (Optional):**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login product
3. Configure OAuth redirect URIs
4. Copy App ID and Secret

#### 2. Update Environment Files

Add OAuth credentials to `.env` and `web/.env.local` (see Environment Variables section above).

#### 3. Configure Supabase

OAuth providers are configured in `supabase/config.toml`:

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"

[auth.external.github]
enabled = true
client_id = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET)"
```

#### 4. Restart Services

```bash
supabase stop
supabase start
cd web && npm run dev
```

### Testing OAuth

1. Navigate to http://localhost:3000/auth/signin
2. Click "Google" or "GitHub" button
3. Complete OAuth flow
4. Should redirect to http://localhost:3000/households

### Troubleshooting OAuth

**"Invalid redirect URI"**
- Verify `http://localhost:54321/auth/v1/callback` is in your OAuth app
- No trailing slashes

**"Invalid client"**
- Double-check Client ID and Secret
- Restart Supabase after config changes

**OAuth button does nothing**
- Check browser console for errors
- Verify Supabase is running: `supabase status`
- Check provider is enabled in `supabase/config.toml`

### Production OAuth Setup

For production:
1. Add production redirect URI: `https://your-project.supabase.co/auth/v1/callback`
2. Configure providers in Supabase Cloud dashboard
3. Set environment variables in hosting platform (Vercel, Netlify, etc.)
4. Never commit secrets to git

---

## Database Setup

### Create database

```bash
# Using Docker (already done by docker-compose)
docker-compose up -d postgres

# Or manually with psql
createdb snakr
```

### Run migrations

```bash
cd api
alembic upgrade head
```

### Seed test data (optional)

```bash
python scripts/seed_data.py
```

This creates:
- 2 test households
- 5 test users
- 20 test items
- Sample events

---

## Testing Setup

### Backend tests

```bash
cd api

# Install test dependencies
pip install -r requirements-dev.txt

# Create test database
createdb snakr_test

# Run tests
pytest

# Run with coverage
pytest --cov=api tests/
```

### Frontend tests

```bash
cd web

# Install test dependencies (already in package.json)
npm install

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

### E2E tests

```bash
cd web

# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e
```

---

## Development Workflow

### 1. Create a feature branch

```bash
git checkout -b feature/receipt-upload
```

### 2. Make changes

Edit code in `api/` or `web/`

### 3. Run tests

```bash
# Backend
cd api && pytest

# Frontend
cd web && npm test
```

### 4. Format code

```bash
# Backend
cd api
black .
ruff check .

# Frontend
cd web
npm run format
npm run lint
```

### 5. Commit changes

```bash
git add .
git commit -m "Add receipt upload endpoint"
```

### 6. Push and create PR

```bash
git push origin feature/receipt-upload
```

---

## Troubleshooting

### Database connection error

**Error**: `could not connect to server: Connection refused`

**Fix**:
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Migration error

**Error**: `alembic.util.exc.CommandError: Can't locate revision identified by 'xyz'`

**Fix**:
```bash
# Reset migrations
alembic downgrade base
alembic upgrade head
```

### Port already in use

**Error**: `Address already in use: 8000`

**Fix**:
```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### OCR not working

**Error**: `TesseractNotFoundError`

**Fix**:
```bash
# Install Tesseract
# macOS
brew install tesseract

# Ubuntu
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### Node modules error

**Error**: `Cannot find module 'next'`

**Fix**:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

---

## IDE Setup

### VS Code

Recommended extensions:
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)

Settings (`.vscode/settings.json`):
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Docker Commands

### Start all services

```bash
# Start Supabase + Redis + Celery
./scripts/dev/start-all.sh            # macOS/Linux
.\scripts\dev\start-all.ps1           # Windows
```

### Stop all services

```bash
./scripts/dev/stop-all.sh             # macOS/Linux
.\scripts\dev\stop-all.ps1            # Windows
```

### View logs

```bash
# Celery worker
docker-compose logs -f celery

# Redis
docker-compose logs -f redis

# Supabase
supabase logs
```

### Restart services

```bash
# Restart Redis & Celery
docker-compose restart

# Restart Supabase
supabase stop
supabase start
```

### Reset database

```bash
supabase db reset
```

---

## Docker Build Options

The API uses a unified Dockerfile with build arguments to control dependencies.

### Build Types

| Type | Build Time | ML Dependencies | Use Case |
|------|-----------|-----------------|----------|
| **LITE** | 5-10 min | ❌ No | Development, testing, non-ML features |
| **FULL** | 20-40 min | ✅ Yes | Prediction features, production |

### Using Setup Scripts (Recommended)

The setup scripts handle everything automatically:

```bash
# Interactive mode - prompts you to choose
./scripts/setup/setup.sh              # Linux/Mac
.\scripts\setup\setup.ps1             # Windows

# Lite build (fast)
./scripts/setup/setup.sh --lite       # Linux/Mac
.\scripts\setup\setup.ps1 -Lite       # Windows

# Full build (with ML)
./scripts/setup/setup.sh --full       # Linux/Mac
.\scripts\setup\setup.ps1             # Windows
```

### Manual Docker Commands

If you need to build manually:

```bash
# Lite build
INSTALL_ML=false docker-compose up -d --build

# Full build  
INSTALL_ML=true docker-compose up -d --build

# Rebuild without cache
docker-compose build --no-cache
```

### How It Works

The `api/Dockerfile.dev` uses a build argument to conditionally install ML dependencies:

```dockerfile
ARG INSTALL_ML=true

# Core dependencies (always installed)
RUN pip install fastapi uvicorn pydantic ...

# ML dependencies (conditional)
RUN if [ "$INSTALL_ML" = "true" ]; then \
        pip install sentence-transformers numpy; \
    fi
```

### Switching Between Builds

To switch from lite to full (or vice versa):

1. Stop services: `docker-compose down`
2. Run setup with desired option: `.\scripts\setup\setup.ps1 -Lite`

The setup script will rebuild with the new configuration.

### Production Builds

For production, always use the full build with `Dockerfile.prod`:

```bash
docker build --build-arg INSTALL_ML=true -f api/Dockerfile.prod -t snakr-api .
```

---

## Useful Scripts

### Backend

```bash
# Run API server
cd api && uvicorn main:app --reload

# Run tests
cd api && pytest

# Format code
cd api && black . && ruff check .

# Create migration
cd api && alembic revision --autogenerate -m "Add new table"

# Apply migrations
cd api && alembic upgrade head
```

### Frontend

```bash
# Run dev server
cd web && npm run dev

# Run tests
cd web && npm test

# Format code
cd web && npm run format && npm run lint

# Build for production
cd web && npm run build

# Start production server
cd web && npm start
```

---

## Next Steps

1. Read `docs/vision.md` for project philosophy
2. Read `docs/tone.md` for voice guidelines
3. Read `docs/requirements.md` for feature specs
4. Check `docs/tasks.md` for implementation tasks
5. Start with Phase 0 tasks

---

## Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check `CONTRIBUTING.md` for contribution guidelines
- Reach out to maintainers if stuck

---

Built with 💖 for everyday people tryna stay stocked and not get rocked.
