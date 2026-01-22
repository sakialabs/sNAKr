# Link local Supabase to production project

$ErrorActionPreference = "Stop"

Write-Host "🔗 Linking local Supabase to production..." -ForegroundColor Cyan
Write-Host ""

# Project details
$PROJECT_REF = "phzgiwhpsesycafmfafm"
$PROJECT_URL = "https://phzgiwhpsesycafmfafm.supabase.co"

Write-Host "Project: $PROJECT_REF" -ForegroundColor Yellow
Write-Host "URL: $PROJECT_URL" -ForegroundColor Yellow
Write-Host ""

# Link project
Write-Host "Linking to production project..." -ForegroundColor Cyan
supabase link --project-ref $PROJECT_REF

Write-Host ""
Write-Host "✅ Successfully linked to production!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push migrations: supabase db push"
Write-Host "2. Verify tables: supabase db list-tables --linked"
Write-Host "3. Open Studio: supabase db studio --linked"
Write-Host ""
Write-Host "⚠️  WARNING: Be careful with production database!" -ForegroundColor Yellow
Write-Host "   Always test migrations locally first."
