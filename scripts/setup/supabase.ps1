# sNAKr Supabase Setup Script (PowerShell)
# This script automates the setup of Supabase for local development

$ErrorActionPreference = "Stop"

Write-Host "🍇 sNAKr Supabase Setup" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking for Supabase CLI..."
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✓ Supabase CLI found" -ForegroundColor Green
    Write-Host $supabaseVersion
    Write-Host ""
} catch {
    Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI:"
    Write-Host ""
    Write-Host "Using Scoop (recommended):"
    Write-Host "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    Write-Host "  scoop install supabase"
    Write-Host ""
    Write-Host "Or using npm:"
    Write-Host "  npm install -g supabase"
    Write-Host ""
    exit 1
}

# Check if Docker is running
Write-Host "Checking Docker..."
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

# Check if Supabase is already running
Write-Host "Checking Supabase status..."
try {
    supabase status | Out-Null
    Write-Host "⚠ Supabase is already running" -ForegroundColor Yellow
    Write-Host ""
    $restart = Read-Host "Do you want to restart Supabase? (y/n)"
    if ($restart -eq "y" -or $restart -eq "Y") {
        Write-Host "Stopping Supabase..."
        supabase stop
    } else {
        Write-Host "Keeping existing Supabase instance."
        Write-Host ""
        Write-Host "Current status:"
        supabase status
        exit 0
    }
} catch {
    # Supabase not running, continue
}

# Start Supabase
Write-Host ""
Write-Host "Starting Supabase services..."
Write-Host "This may take a few minutes on first run..."
Write-Host ""

supabase start

Write-Host ""
Write-Host "✓ Supabase started successfully!" -ForegroundColor Green
Write-Host ""

# Get Supabase credentials
Write-Host "Fetching Supabase credentials..."
$status = supabase status | Out-String

# Parse status output
$apiUrl = ($status | Select-String "API URL:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$dbUrl = ($status | Select-String "DB URL:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$studioUrl = ($status | Select-String "Studio URL:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$anonKey = ($status | Select-String "anon key:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$serviceRoleKey = ($status | Select-String "service_role key:\s+(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

Write-Host ""
Write-Host "📋 Supabase Credentials" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $apiUrl"
Write-Host "DB URL: $dbUrl"
Write-Host "Studio URL: $studioUrl"
Write-Host ""
Write-Host "Anon Key: $anonKey"
Write-Host ""
Write-Host "Service Role Key: $serviceRoleKey"
Write-Host ""

# Update .env file
Write-Host "Updating .env file..."

if (-not (Test-Path .env)) {
    Write-Host "Creating .env from .env.example..."
    Copy-Item .env.example .env
}

# Check if Supabase variables already exist
$envContent = Get-Content .env -Raw
if ($envContent -match "SUPABASE_URL") {
    Write-Host "⚠ Supabase variables already exist in .env" -ForegroundColor Yellow
    $update = Read-Host "Do you want to update them? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        # Remove old Supabase variables
        $envContent = $envContent -replace "(?m)^SUPABASE_.*\r?\n", ""
        Set-Content .env $envContent
    } else {
        Write-Host "Skipping .env update."
        Write-Host ""
        Write-Host "✓ Setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Open Supabase Studio: $studioUrl"
        Write-Host "2. Run migrations: supabase db reset"
        Write-Host "3. Start the app: docker-compose up -d"
        exit 0
    }
}

# Append Supabase variables to .env
$supabaseConfig = @"

# Supabase Configuration (Local Development)
SUPABASE_URL=$apiUrl
SUPABASE_ANON_KEY=$anonKey
SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Update Database URL to use Supabase PostgreSQL
# DATABASE_URL=$dbUrl
"@

Add-Content .env $supabaseConfig

Write-Host "✓ .env file updated" -ForegroundColor Green
Write-Host ""

# Update mobile .env
Write-Host "Updating mobile/.env file..."

if (-not (Test-Path mobile/.env)) {
    Write-Host "Creating mobile/.env from mobile/.env.example..."
    Copy-Item mobile/.env.example mobile/.env
}

# Update mobile .env
$mobileConfig = @"
# Supabase Configuration (Local Development)
EXPO_PUBLIC_SUPABASE_URL=$apiUrl
EXPO_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@

Set-Content mobile/.env $mobileConfig

Write-Host "✓ mobile/.env file updated" -ForegroundColor Green
Write-Host ""

# Create web .env.local if it doesn't exist
Write-Host "Updating web/.env.local file..."

if (-not (Test-Path web/.env.local)) {
    Write-Host "Creating web/.env.local..."
    $webConfig = @"
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@
    Set-Content web/.env.local $webConfig
    Write-Host "✓ web/.env.local file created" -ForegroundColor Green
} else {
    Write-Host "⚠ web/.env.local already exists, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open Supabase Studio:"
Write-Host "   $studioUrl"
Write-Host ""
Write-Host "2. Create database migrations:"
Write-Host "   supabase migration new create_households_table"
Write-Host ""
Write-Host "3. Apply migrations:"
Write-Host "   supabase db reset"
Write-Host ""
Write-Host "4. Start the application:"
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host "5. View Supabase status anytime:"
Write-Host "   supabase status"
Write-Host ""
Write-Host "6. Stop Supabase when done:"
Write-Host "   supabase stop"
Write-Host ""
Write-Host "📖 For more information, see docs/SUPABASE_SETUP.md"
Write-Host ""
