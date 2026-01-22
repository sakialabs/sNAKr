# Alembic Database Migrations

This directory contains database migration scripts for the sNAKr application.

## Overview

Alembic is a database migration tool for SQLAlchemy. It allows us to:
- Track database schema changes over time
- Apply migrations in a controlled, versioned manner
- Roll back changes if needed
- Maintain consistency across development, staging, and production environments

## Directory Structure

```
alembic/
├── versions/          # Migration scripts (auto-generated)
├── env.py            # Migration environment configuration
├── script.py.mako    # Template for new migration files
└── README.md         # This file
```

## Common Commands

### Creating a New Migration

To create a new migration manually:

```bash
# Inside the API container
docker exec -it snakr-api alembic revision -m "description of changes"

# Or from the host with docker-compose
docker-compose exec api alembic revision -m "description of changes"
```

To auto-generate a migration from model changes (once models are set up):

```bash
docker exec -it snakr-api alembic revision --autogenerate -m "description of changes"
```

### Applying Migrations

To upgrade to the latest migration:

```bash
# Inside the API container
docker exec -it snakr-api alembic upgrade head

# Or from the host
docker-compose exec api alembic upgrade head
```

To upgrade to a specific revision:

```bash
docker exec -it snakr-api alembic upgrade <revision_id>
```

### Rolling Back Migrations

To downgrade by one revision:

```bash
docker exec -it snakr-api alembic downgrade -1
```

To downgrade to a specific revision:

```bash
docker exec -it snakr-api alembic downgrade <revision_id>
```

To downgrade all migrations:

```bash
docker exec -it snakr-api alembic downgrade base
```

### Viewing Migration History

To see the current revision:

```bash
docker exec -it snakr-api alembic current
```

To see migration history:

```bash
docker exec -it snakr-api alembic history
```

To see pending migrations:

```bash
docker exec -it snakr-api alembic history --verbose
```

## Configuration

The Alembic configuration is stored in `alembic.ini` at the root of the `api/` directory.

Key configuration points:
- **Database URL**: Automatically read from the `DATABASE_URL` environment variable in `env.py`
- **Script location**: `alembic/` directory
- **Version location**: `alembic/versions/` directory

## Environment Variables

The migration system uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database`)

These are automatically configured in the Docker Compose setup.

## Best Practices

1. **Always review auto-generated migrations** before applying them
2. **Test migrations** in development before applying to production
3. **Write reversible migrations** - always implement both `upgrade()` and `downgrade()`
4. **Use descriptive migration messages** that explain what changed
5. **Never edit applied migrations** - create a new migration instead
6. **Commit migrations to version control** along with model changes

## Migration Workflow

1. Make changes to SQLAlchemy models
2. Generate a migration: `alembic revision --autogenerate -m "add users table"`
3. Review the generated migration file in `alembic/versions/`
4. Edit if necessary (auto-generate isn't perfect)
5. Test the migration: `alembic upgrade head`
6. Test the rollback: `alembic downgrade -1`
7. Re-apply: `alembic upgrade head`
8. Commit the migration file to git

## Troubleshooting

### "Can't locate revision identified by 'xxxxx'"

This usually means the database's alembic_version table is out of sync. You can:
1. Check current version: `alembic current`
2. Check history: `alembic history`
3. Manually update the alembic_version table if needed

### "Target database is not up to date"

Run `alembic upgrade head` to apply pending migrations.

### "FAILED: Target database is not up to date"

This means there are unapplied migrations. Run `alembic upgrade head`.

## Next Steps

After setting up Alembic, the next tasks are:
1. Create SQLAlchemy models for the database schema
2. Generate initial migrations for each table
3. Apply migrations to create the database schema
4. Set up Row Level Security (RLS) policies for multi-tenant isolation

See the tasks.md file for the complete migration roadmap.
