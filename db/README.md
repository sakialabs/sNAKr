# Database Setup

This folder contains database initialization scripts for local development.

## Development Options

### Option 1: Supabase Local (Recommended)

Use Supabase CLI for local development with full auth + storage + database:

```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase locally
supabase start

# Access local services:
# - Studio: http://localhost:54323
# - API: http://localhost:54321
# - DB: postgresql://postgres:postgres@localhost:54322/postgres
```

Migrations go in `supabase/migrations/` (auto-created by Supabase CLI).

### Option 2: Docker PostgreSQL (Fallback)

Use plain PostgreSQL without Supabase features:

```bash
# Start PostgreSQL container
docker-compose up -d db

# Access database
psql postgresql://snakr_user:snakr_pass@localhost:5432/snakr
```

Scripts in this folder run automatically on first container start.

## File Structure

```
db/
├── init/
│   ├── 00-auth-mock.sql     # Mock auth schema (for Docker PostgreSQL)
│   ├── 01-init.sql          # Extensions and configuration
│   └── 02-seed-dev.sql      # Development seed data (optional)
└── README.md                # This file
```

**Note**: This folder is only used for Docker PostgreSQL setup. When using Supabase, all database setup is handled through `supabase/migrations/`.

## Migration Strategy

**With Supabase (Recommended):**
- Use `supabase migration new <name>` to create migrations
- Migrations live in `supabase/migrations/`
- Verification scripts in `supabase/migrations/verify/`
- Test scripts in `supabase/migrations/tests/`
- Run with `supabase db reset` (local) or auto-apply (cloud)
- See [supabase/migrations/README.md](../supabase/migrations/README.md) for details

**Without Supabase:**
- Use Alembic migrations in `api/alembic/versions/`
- Run with `alembic upgrade head`

## Seed Data

Development seed data is in `02-seed-dev.sql`. Toggle loading with the `load_seed_data` variable.

**Note:** Seed data should only be used in local development, never in production.

## Useful Commands

```bash
# Supabase local
supabase start              # Start all services
supabase stop               # Stop all services
supabase db reset           # Reset DB and run migrations
supabase migration new foo  # Create new migration

# Docker PostgreSQL
docker-compose up -d db     # Start PostgreSQL
docker-compose down         # Stop all services
docker-compose logs db      # View database logs

# Direct database access
psql postgresql://postgres:postgres@localhost:54322/postgres  # Supabase local
psql postgresql://snakr_user:snakr_pass@localhost:5432/snakr  # Docker PostgreSQL
```

## Environment Variables

Create `.env` file in project root:

```env
# Supabase (get from `supabase status`)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Or Docker PostgreSQL
DATABASE_URL=postgresql://snakr_user:snakr_pass@localhost:5432/snakr
```

## Next Steps

1. **Choose your development approach** (Supabase recommended)
2. **Start the database**:
   ```bash
   # Supabase
   supabase start
   
   # Or Docker PostgreSQL
   docker-compose up -d db
   ```
3. **Run migrations** (see [supabase/migrations/README.md](../supabase/migrations/README.md))
4. **(Optional) Load seed data** for development
5. **Start the API and web app**:
   ```bash
   ./scripts/dev/start.sh              # macOS/Linux
   .\scripts\dev\start.ps1             # Windows
   ```

## See Also

- [Supabase Migrations](../supabase/migrations/README.md) - Database migrations and tests
- [Supabase Setup](../supabase/README.md) - Supabase configuration
- [Database Documentation](../docs/database.md) - Complete database schema
- [Setup Guide](../docs/SETUP.md) - Full setup instructions
