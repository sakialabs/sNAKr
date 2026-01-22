# sNAKr Setup Script for Windows
# This script sets up the development environment

param(
    [switch]$Lite  # Use lite build (faster, no ML)
)

Write-Host "🍇 sNAKr Setup Script" -ForegroundColor Magenta
Write-Host "=====================`n" -ForegroundColor Magenta

# Ask user for build type if not specified
if (-not $Lite) {
    Write-Host "Choose your build type:" -ForegroundColor Cyan
    Write-Host "  [1] LITE - Fast build without ML dependencies (5-10 min) - Recommended for development" -ForegroundColor Yellow
    Write-Host "  [2] FULL - Complete build with ML dependencies (20-40 min)" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Enter your choice (1 or 2)"
    
    if ($choice -eq "1") {
        $Lite = $true
        Write-Host "✓ Selected: LITE build" -ForegroundColor Green
    } else {
        Write-Host "✓ Selected: FULL build" -ForegroundColor Green
    }
    Write-Host ""
}

if ($Lite) {
    Write-Host "Build Mode: LITE (no ML dependencies)" -ForegroundColor Yellow
    $env:INSTALL_ML = "false"
} else {
    Write-Host "Build Mode: FULL (includes ML dependencies)" -ForegroundColor Yellow
    $env:INSTALL_ML = "true"
}

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
if ($Lite) {
    Write-Host "Building LITE version (5-10 minutes)..." -ForegroundColor Yellow
} else {
    Write-Host "Building FULL version (20-40 minutes)..." -ForegroundColor Yellow
}
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
