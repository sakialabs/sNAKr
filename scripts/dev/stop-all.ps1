# ============================================
# sNAKr - Stop All Development Services
# ============================================
# Stops Supabase, Redis, and Celery worker
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "🛑 Stopping sNAKr development environment..." -ForegroundColor Cyan
Write-Host ""

# Stop Docker services
Write-Host "Stopping Redis & Celery..." -ForegroundColor Yellow
docker-compose down

Write-Host ""

# Stop Supabase
Write-Host "Stopping Supabase..." -ForegroundColor Yellow
supabase stop

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Green
