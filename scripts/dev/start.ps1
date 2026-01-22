# Quick development start script
# Combines Supabase + Docker in one command

$ErrorActionPreference = "Stop"

Write-Host "🍇 Starting sNAKr Development Environment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase is running
Write-Host "Checking Supabase..." -ForegroundColor Cyan
try {
    supabase status | Out-Null
    Write-Host "✓ Supabase already running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Starting Supabase..." -ForegroundColor Yellow
    supabase start
    Write-Host ""
}

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 Development environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Supabase Studio: http://localhost:54323" -ForegroundColor White
Write-Host "  API:             http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Web:             http://localhost:3000" -ForegroundColor White
Write-Host "  MinIO Console:   http://localhost:9001" -ForegroundColor White
Write-Host ""
Write-Host "View logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "Stop all:  .\scripts\stop.ps1" -ForegroundColor Yellow
