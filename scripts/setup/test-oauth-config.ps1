# OAuth Configuration Test Script (PowerShell)
# Verifies that OAuth providers are properly configured

Write-Host "🦝 sNAKr OAuth Configuration Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# Check if files exist
Write-Host "Checking configuration files..."
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    $Errors++
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

if (-not (Test-Path "web\.env")) {
    Write-Host "✗ web\.env file not found" -ForegroundColor Red
    $Errors++
} else {
    Write-Host "✓ web\.env file exists" -ForegroundColor Green
}

if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "✗ supabase\config.toml not found" -ForegroundColor Red
    $Errors++
} else {
    Write-Host "✓ supabase\config.toml exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Checking OAuth provider configuration..."
Write-Host ""

# Function to check environment variable
function Test-EnvVariable {
    param(
        [string]$FilePath,
        [string]$Variable,
        [string]$Provider
    )
    
    $content = Get-Content $FilePath -Raw
    if ($content -match "^$Variable=.+$") {
        Write-Host "✓ $Provider configured in $FilePath" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠ $Provider not configured in $FilePath" -ForegroundColor Yellow
        $script:Warnings++
        return $false
    }
}

# Check Google OAuth
Write-Host "Google OAuth:"
Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" -Provider "Google Client ID"
Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" -Provider "Google Secret"
Test-EnvVariable -FilePath "web\.env" -Variable "GOOGLE_CLIENT_ID" -Provider "Google Client ID (web)"
Test-EnvVariable -FilePath "web\.env" -Variable "GOOGLE_CLIENT_SECRET" -Provider "Google Secret (web)"

# Check if Google is enabled in Supabase config
$supabaseConfig = Get-Content "supabase\config.toml" -Raw
if ($supabaseConfig -match "\[auth\.external\.google\][\s\S]*?enabled = true") {
    Write-Host "✓ Google OAuth enabled in Supabase" -ForegroundColor Green
} else {
    Write-Host "✗ Google OAuth not enabled in Supabase config" -ForegroundColor Red
    $Errors++
}

Write-Host ""

# Check GitHub OAuth
Write-Host "GitHub OAuth:"
Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID" -Provider "GitHub Client ID"
Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET" -Provider "GitHub Secret"
Test-EnvVariable -FilePath "web\.env" -Variable "GITHUB_CLIENT_ID" -Provider "GitHub Client ID (web)"
Test-EnvVariable -FilePath "web\.env" -Variable "GITHUB_CLIENT_SECRET" -Provider "GitHub Secret (web)"

# Check if GitHub is enabled in Supabase config
if ($supabaseConfig -match "\[auth\.external\.github\][\s\S]*?enabled = true") {
    Write-Host "✓ GitHub OAuth enabled in Supabase" -ForegroundColor Green
} else {
    Write-Host "✗ GitHub OAuth not enabled in Supabase config" -ForegroundColor Red
    $Errors++
}

Write-Host ""

# Check Apple OAuth (optional)
Write-Host "Apple OAuth (optional):"
$appleConfigured = Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID" -Provider "Apple Client ID" -ErrorAction SilentlyContinue
if ($appleConfigured) {
    Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_APPLE_SECRET" -Provider "Apple Secret"
    Test-EnvVariable -FilePath "web\.env" -Variable "APPLE_CLIENT_ID" -Provider "Apple Client ID (web)"
    
    if ($supabaseConfig -match "\[auth\.external\.apple\][\s\S]*?enabled = true") {
        Write-Host "✓ Apple OAuth enabled in Supabase" -ForegroundColor Green
    } else {
        Write-Host "⚠ Apple OAuth not enabled in Supabase config" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Apple OAuth not configured (optional)" -ForegroundColor Yellow
}

Write-Host ""

# Check Facebook OAuth (optional)
Write-Host "Facebook OAuth (optional):"
$facebookConfigured = Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID" -Provider "Facebook Client ID" -ErrorAction SilentlyContinue
if ($facebookConfigured) {
    Test-EnvVariable -FilePath ".env" -Variable "SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET" -Provider "Facebook Secret"
    Test-EnvVariable -FilePath "web\.env" -Variable "FACEBOOK_CLIENT_ID" -Provider "Facebook Client ID (web)"
    
    if ($supabaseConfig -match "\[auth\.external\.facebook\][\s\S]*?enabled = true") {
        Write-Host "✓ Facebook OAuth enabled in Supabase" -ForegroundColor Green
    } else {
        Write-Host "⚠ Facebook OAuth not enabled in Supabase config" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Facebook OAuth not configured (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "✓ All OAuth providers configured correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Restart Supabase: supabase stop; supabase start"
    Write-Host "2. Start web app: cd web; npm run dev"
    Write-Host "3. Test OAuth at http://localhost:3000/auth/signin"
    exit 0
} elseif ($Errors -eq 0) {
    Write-Host "⚠ Configuration complete with warnings" -ForegroundColor Yellow
    Write-Host "Warnings: $Warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Minimum required providers (Google, GitHub) are configured."
    Write-Host "Optional providers (Apple, Facebook) can be added later."
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Restart Supabase: supabase stop; supabase start"
    Write-Host "2. Start web app: cd web; npm run dev"
    Write-Host "3. Test OAuth at http://localhost:3000/auth/signin"
    exit 0
} else {
    Write-Host "✗ Configuration incomplete" -ForegroundColor Red
    Write-Host "Errors: $Errors" -ForegroundColor Red
    Write-Host "Warnings: $Warnings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the OAuth configuration script:"
    Write-Host "  .\scripts\setup\configure-oauth.ps1"
    Write-Host ""
    Write-Host "Or see the setup guide:"
    Write-Host "  docs\OAUTH_QUICKSTART.md"
    exit 1
}
