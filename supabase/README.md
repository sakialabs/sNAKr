# Supabase Configuration

This directory contains Supabase configuration and migration files for the sNAKr MVP project.

## Directory Structure

```
supabase/
├── config.toml          # Supabase CLI configuration
├── seed.sql             # Seed data for local development
├── migrations/          # Database migrations (created by CLI)
└── functions/           # Edge Functions (future)
```

## Quick Start

### 1. Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Or via npm
npm install -g supabase
```

### 2. Start Supabase

```bash
# From project root
supabase start
```

This will start all Supabase services locally:
- PostgreSQL database
- Auth server (GoTrue)
- Storage server
- Realtime server
- Studio (web UI)

### 3. Access Services

- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres

### 4. Get Credentials

```bash
supabase status
```

Copy the `anon key` and `service_role key` to your `.env` file.

## Configuration

### config.toml

The `config.toml` file contains all Supabase configuration:

- **API settings**: Port, schemas, max rows
- **Database settings**: Port, version
- **Auth settings**: OAuth providers, JWT expiry, email/SMS
- **Storage settings**: File size limits
- **Studio settings**: Port, API URL

### Customization

To customize Supabase for your needs:

1. Edit `config.toml`
2. Restart Supabase: `supabase stop && supabase start`

## Migrations

Database migrations are stored in `supabase/migrations/`.

### Create a Migration

```bash
supabase migration new create_households_table
```

This creates a new migration file in `supabase/migrations/`.

### Apply Migrations

```bash
# Reset database and apply all migrations
supabase db reset

# Or apply migrations without reset
supabase migration up
```

### Migration Best Practices

1. **One change per migration**: Keep migrations focused
2. **Descriptive names**: Use clear, descriptive migration names
3. **Test locally first**: Always test migrations locally before pushing to cloud
4. **Include RLS policies**: Add Row Level Security policies in migrations
5. **Add indexes**: Include necessary indexes for performance

## Seed Data

The `seed.sql` file contains test data for local development.

### Running Seeds

Seeds run automatically after migrations when you run:

```bash
supabase db reset
```

### Adding Seed Data

Edit `supabase/seed.sql` to add test data:

```sql
-- Example: Insert test household
INSERT INTO households (id, name, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'Test Household',
  NOW(),
  NOW()
);
```

## Cloud Deployment

### Link to Cloud Project

```bash
# Get project ref from Supabase dashboard
supabase link --project-ref your-project-ref
```

### Push Migrations to Cloud

```bash
supabase db push --linked
```

### Pull Schema from Cloud

```bash
supabase db pull
```

## Common Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Check status
supabase status

# View logs
supabase logs

# Reset database (WARNING: deletes all data)
supabase db reset

# Create migration
supabase migration new migration_name

# Apply migrations
supabase migration up

# Generate TypeScript types
supabase gen types typescript --local > ../types/supabase.ts

# Link to cloud project
supabase link --project-ref your-project-ref

# Push to cloud
supabase db push --linked

# Pull from cloud
supabase db pull
```

## Troubleshooting

### Port Already in Use

If port 54321 is already in use:

1. Stop Supabase: `supabase stop`
2. Check what's using the port: `lsof -i :54321` (macOS/Linux)
3. Kill the process or change the port in `config.toml`

### Docker Not Running

If you get "Cannot connect to Docker daemon":

1. Start Docker Desktop
2. Wait for Docker to fully start
3. Run `supabase start` again

### Migrations Not Applied

If tables don't exist:

1. Check migration status: `supabase migration list`
2. Reset database: `supabase db reset`
3. Check for errors in migration files

### Auth Not Working

If sign up/sign in fails:

1. Check `config.toml`:
   - `enable_signup = true`
   - `enable_confirmations = false` (for local dev)
2. Check email in Inbucket: http://localhost:54324
3. Verify JWT secret matches in all configs

## Resources

### sNAKr Documentation
- [Setup Guide](../docs/SETUP.md) - Complete setup instructions including Supabase
- [Database Schema](../docs/database.md) - Database design and migrations
- [Deployment Guide](../docs/deployment.md) - Production deployment with Supabase
- [Testing Guide](../docs/TESTING.md) - Testing strategies including database tests

### Supabase Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## Support

For issues or questions:

1. Check [docs/SETUP.md](../docs/SETUP.md) for setup help
2. Review [docs/database.md](../docs/database.md) for schema questions
3. Review [Supabase Discussions](https://github.com/supabase/supabase/discussions)
4. Create an issue in the repository
