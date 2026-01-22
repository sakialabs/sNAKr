#!/bin/bash
# Reset development environment (clean slate)

set -e

echo "🔄 Resetting sNAKr Development Environment"
echo "==========================================="
echo ""
echo "⚠️  WARNING: This will delete all data!"
echo ""
read -p "Are you sure? (yes/no) " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

# Stop all services
echo "Stopping services..."
docker-compose down -v
supabase stop

echo ""
echo "Cleaning up..."
# Remove volumes
docker volume rm snakr_postgres_data 2>/dev/null || true
docker volume rm snakr_redis_data 2>/dev/null || true
docker volume rm snakr_minio_data 2>/dev/null || true
docker volume rm snakr_api_uploads 2>/dev/null || true

# Remove Supabase data
rm -rf supabase/.branches/_current_branch 2>/dev/null || true
rm -rf supabase/.temp/* 2>/dev/null || true

echo ""
echo "Starting fresh..."
supabase start
docker-compose up -d

echo ""
echo "Applying migrations..."
supabase db reset

echo ""
echo "✓ Reset complete! Fresh development environment ready."
echo ""
echo "Services:"
echo "  Supabase Studio: http://localhost:54323"
echo "  API:             http://localhost:8000/docs"
echo "  Web:             http://localhost:3000"
