#!/bin/bash
# ============================================
# sNAKr - Start All Development Services
# ============================================
# Starts Supabase, Redis, and Celery worker
# ============================================

set -e

echo "🚀 Starting sNAKr development environment..."
echo ""

# Start Supabase
echo "1️⃣  Starting Supabase..."
supabase start

echo ""

# Start Redis & Celery
echo "2️⃣  Starting Redis & Celery..."
docker-compose up -d

echo ""
echo "✅ All services started!"
echo ""

# Show status
echo "📊 Service Status:"
echo ""
echo "Supabase:"
supabase status | grep -E "(API URL|DB URL|Studio URL)"
echo ""
echo "Docker:"
docker-compose ps
echo ""

# Quick links
echo "🌐 Quick Links:"
echo "  Supabase Studio: http://127.0.0.1:54323"
echo "  API Docs:        http://localhost:8000/docs (start separately)"
echo "  Web App:         http://localhost:3000 (start separately)"
echo ""

# Next steps
echo "📝 Next Steps:"
echo "  1. Start API: cd api && conda activate snakr && python main.py"
echo "  2. Start Web: cd web && npm run dev"
echo ""
