#!/bin/bash
# Stop all development services

echo "🛑 Stopping sNAKr Development Environment"
echo "=========================================="
echo ""

# Stop Docker services
echo "Stopping Docker services..."
docker-compose down

# Stop Supabase
echo ""
echo "Stopping Supabase..."
supabase stop

echo ""
echo "✓ All services stopped"
