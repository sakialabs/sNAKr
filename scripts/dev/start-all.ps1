# ============================================
# sNAKr - Start All Development Services
# ============================================
# Starts Supabase, Redis, and Celery worker
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting sNAKr development environment..." -ForegroundColor Cyan
Write-Host ""

# Start Supabase
Write-Host "1️⃣  Starting Supabase..." -ForegroundColor Yellow
supabase start

Write-Host ""

# Start Redis & Celery
Write-Host "2️⃣  Starting Redis & Celery..." -ForegroundColor Yellow
docker-compose up -d

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""

# Show status
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Supabase:" -ForegroundColor Yellow
supabase status | Select-String -Pattern "(API URL|DB URL|Studio URL)"
Write-Host ""
Write-Host "Docker:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# Quick links
Write-Host "🌐 Quick Links:" -ForegroundColor Cyan
Write-Host "  Supabase Studio: http://127.0.0.1:54323"
Write-Host "  API Docs:        http://localhost:8000/docs (start separately)"
Write-Host "  Web App:         http://localhost:3000 (start separately)"
Write-Host ""

# Next steps
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start API: cd api && conda activate snakr && python main.py"
Write-Host "  2. Start Web: cd web && npm run dev"
Write-Host ""
