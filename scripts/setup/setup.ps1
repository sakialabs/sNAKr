# sNAKr Setup Script for Windows
# This script sets up the development environment

Write-Host "🍇 sNAKr Setup Script" -ForegroundColor Magenta
Write-Host "=====================`n" -ForegroundColor Magenta

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    Write-Host "  Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
Write-Host "`nChecking Docker Compose..." -ForegroundColor Cyan
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "`nChecking if Docker is running..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Copy .env.example to .env if it doesn't exist
Write-Host "`nSetting up environment variables..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from .env.example" -ForegroundColor Green
}

# Build containers
Write-Host "`nBuilding Docker containers..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
docker-compose build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Containers built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Container build failed" -ForegroundColor Red
    exit 1
}

# Start services
Write-Host "`nStarting services..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for services to be healthy
Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check service status
Write-Host "`nService Status:" -ForegroundColor Cyan
docker-compose ps

# Display access URLs
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nAccess your services:" -ForegroundColor Cyan
Write-Host "  Web App:       http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host "  MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "  Database:      localhost:5432" -ForegroundColor White
Write-Host "  Redis:         localhost:6379" -ForegroundColor White

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop services: docker-compose down" -ForegroundColor White
Write-Host "  Restart:       docker-compose restart" -ForegroundColor White

Write-Host "`nHappy coding! 🦝" -ForegroundColor Magenta
