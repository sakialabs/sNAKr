# View logs from all services

param(
    [string]$Service = ""
)

if ($Service -eq "") {
    Write-Host "📋 Viewing logs from all services" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f
} else {
    Write-Host "📋 Viewing logs from $Service" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f $Service
}
