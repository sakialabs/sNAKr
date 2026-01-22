#!/bin/bash
# ============================================
# sNAKr - Stop All Development Services
# ============================================
# Stops Supabase, Redis, and Celery worker
# ============================================

set -e

echo "🛑 Stopping sNAKr development environment..."
echo ""

# Stop Docker services
echo "Stopping Redis & Celery..."
docker-compose down

echo ""

# Stop Supabase
echo "Stopping Supabase..."
supabase stop

echo ""
echo "✅ All services stopped!"
