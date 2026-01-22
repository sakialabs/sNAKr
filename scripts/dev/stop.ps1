# Stop all development services

Write-Host "🛑 Stopping sNAKr Development Environment" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

# Stop Docker services
Write-Host "Stopping Docker services..." -ForegroundColor Yellow
docker-compose down

# Stop Supabase
Write-Host ""
Write-Host "Stopping Supabase..." -ForegroundColor Yellow
supabase stop

Write-Host ""
Write-Host "✓ All services stopped" -ForegroundColor Green
