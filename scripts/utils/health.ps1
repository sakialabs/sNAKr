# Check health of all services

Write-Host "🏥 sNAKr Health Check" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Check Supabase
Write-Host "Supabase:" -ForegroundColor Yellow
try {
    $status = supabase status | Out-String
    Write-Host "  ✓ Running" -ForegroundColor Green
    $studioUrl = ($status | Select-String "Studio URL:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    Write-Host "  Studio: $studioUrl"
} catch {
    Write-Host "  ✗ Not running" -ForegroundColor Red
}

Write-Host ""

# Check Docker services
Write-Host "Docker Services:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""

# Check API health endpoint
Write-Host "API Health:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✓ API responding" -ForegroundColor Green
} catch {
    Write-Host "  ✗ API not responding" -ForegroundColor Red
}

Write-Host ""

# Check Web
Write-Host "Web:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✓ Web responding" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Web not responding" -ForegroundColor Red
}

Write-Host ""

# Check MinIO
Write-Host "MinIO:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✓ MinIO responding" -ForegroundColor Green
} catch {
    Write-Host "  ✗ MinIO not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  Supabase Studio: http://localhost:54323" -ForegroundColor White
Write-Host "  API Docs:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Web App:         http://localhost:3000" -ForegroundColor White
Write-Host "  MinIO Console:   http://localhost:9001" -ForegroundColor White
