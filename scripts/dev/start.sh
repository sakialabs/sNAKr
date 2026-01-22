#!/bin/bash
# Quick development start script
# Combines Supabase + Docker in one command

set -e

echo "🍇 Starting sNAKr Development Environment"
echo "=========================================="
echo ""

# Check if Supabase is running
echo "Checking Supabase..."
if ! supabase status &> /dev/null; then
    echo "Starting Supabase..."
    supabase start
    echo ""
else
    echo "✓ Supabase already running"
    echo ""
fi

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 5

echo ""
echo "🎉 Development environment ready!"
echo ""
echo "Services:"
echo "  Supabase Studio: http://localhost:54323"
echo "  API:             http://localhost:8000/docs"
echo "  Web:             http://localhost:3000"
echo "  MinIO Console:   http://localhost:9001"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop all:  ./scripts/stop.sh"
