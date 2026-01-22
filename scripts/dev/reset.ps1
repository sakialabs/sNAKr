# Reset development environment (clean slate)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Resetting sNAKr Development Environment" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  WARNING: This will delete all data!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Are you sure? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Reset cancelled." -ForegroundColor Yellow
    exit 0
}

# Stop all services
Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Cyan
docker-compose down -v
supabase stop

Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Cyan
# Remove volumes
docker volume rm snakr_postgres_data 2>$null
docker volume rm snakr_redis_data 2>$null
docker volume rm snakr_minio_data 2>$null
docker volume rm snakr_api_uploads 2>$null

# Remove Supabase data
Remove-Item -Path "supabase/.branches/_current_branch" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "supabase/.temp/*" -Force -Recurse -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Starting fresh..." -ForegroundColor Cyan
supabase start
docker-compose up -d

Write-Host ""
Write-Host "Applying migrations..." -ForegroundColor Cyan
supabase db reset

Write-Host ""
Write-Host "✓ Reset complete! Fresh development environment ready." -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Supabase Studio: http://localhost:54323" -ForegroundColor White
Write-Host "  API:             http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Web:             http://localhost:3000" -ForegroundColor White
