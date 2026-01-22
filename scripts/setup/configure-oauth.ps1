# OAuth Provider Configuration Script (PowerShell)
# This script helps configure OAuth providers for sNAKr authentication

Write-Host "🦝 sNAKr OAuth Configuration Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

if (-not (Test-Path "web\.env")) {
    Write-Host "Creating web\.env file from web\.env.example..." -ForegroundColor Yellow
    Copy-Item "web\.env.example" "web\.env"
    Write-Host "✓ Created web\.env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "This script will help you configure OAuth providers for sNAKr."
Write-Host "You'll need to create OAuth apps for each provider you want to enable."
Write-Host ""
Write-Host "Minimum required for MVP:"
Write-Host "  - Google OAuth"
Write-Host "  - GitHub OAuth"
Write-Host ""
Write-Host "Optional providers:"
Write-Host "  - Apple OAuth (recommended for iOS users)"
Write-Host "  - Facebook OAuth"
Write-Host ""

# Function to update environment variable
function Update-EnvVariable {
    param(
        [string]$FilePath,
        [string]$Variable,
        [string]$Value
    )
    
    $content = Get-Content $FilePath -Raw
    $pattern = "^$Variable=.*"
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, "$Variable=$Value"
    } else {
        $content += "`n$Variable=$Value"
    }
    
    Set-Content -Path $FilePath -Value $content -NoNewline
}

# Function to configure a provider
function Configure-Provider {
    param(
        [string]$ProviderName,
        [string]$ClientIdVar,
        [string]$ClientSecretVar
    )
    
    Write-Host ""
    Write-Host "Configure $ProviderName OAuth? (y/n)" -ForegroundColor Yellow
    $configure = Read-Host
    
    if ($configure -eq "y" -or $configure -eq "Y") {
        Write-Host ""
        Write-Host "Enter $ProviderName Client ID:"
        $clientId = Read-Host
        
        Write-Host "Enter $ProviderName Client Secret:"
        $clientSecret = Read-Host -AsSecureString
        $clientSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecret)
        )
        
        # Update root .env
        Update-EnvVariable -FilePath ".env" -Variable $ClientIdVar -Value $clientId
        Update-EnvVariable -FilePath ".env" -Variable $ClientSecretVar -Value $clientSecretPlain
        
        # Update web/.env
        $webClientIdVar = $ClientIdVar -replace "SUPABASE_AUTH_EXTERNAL_", ""
        $webClientSecretVar = $ClientSecretVar -replace "SUPABASE_AUTH_EXTERNAL_", ""
        
        Update-EnvVariable -FilePath "web\.env" -Variable $webClientIdVar -Value $clientId
        Update-EnvVariable -FilePath "web\.env" -Variable $webClientSecretVar -Value $clientSecretPlain
        
        Write-Host "✓ $ProviderName OAuth configured" -ForegroundColor Green
    } else {
        Write-Host "⊘ Skipping $ProviderName OAuth" -ForegroundColor Yellow
    }
}

# Configure Google OAuth
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Google OAuth Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get Google OAuth credentials:"
Write-Host "1. Go to https://console.cloud.google.com/"
Write-Host "2. Create a new project or select existing"
Write-Host "3. Navigate to APIs & Services > Credentials"
Write-Host "4. Create OAuth 2.0 Client ID (Web application)"
Write-Host "5. Add authorized redirect URI:"
Write-Host "   http://localhost:54321/auth/v1/callback"
Write-Host ""

Configure-Provider -ProviderName "Google" `
    -ClientIdVar "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" `
    -ClientSecretVar "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET"

# Configure GitHub OAuth
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "GitHub OAuth Configuration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get GitHub OAuth credentials:"
Write-Host "1. Go to https://github.com/settings/developers"
Write-Host "2. Click 'New OAuth App'"
Write-Host "3. Set Authorization callback URL:"
Write-Host "   http://localhost:54321/auth/v1/callback"
Write-Host ""

Configure-Provider -ProviderName "GitHub" `
    -ClientIdVar "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID" `
    -ClientSecretVar "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET"

# Configure Apple OAuth (optional)
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Apple OAuth Configuration (Optional)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get Apple OAuth credentials:"
Write-Host "1. Go to https://developer.apple.com/account/"
Write-Host "2. Navigate to Certificates, Identifiers & Profiles"
Write-Host "3. Create a Service ID and enable Sign In with Apple"
Write-Host "4. Configure return URL:"
Write-Host "   http://localhost:54321/auth/v1/callback"
Write-Host ""

Configure-Provider -ProviderName "Apple" `
    -ClientIdVar "SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID" `
    -ClientSecretVar "SUPABASE_AUTH_EXTERNAL_APPLE_SECRET"

# Configure Facebook OAuth (optional)
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Facebook OAuth Configuration (Optional)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get Facebook OAuth credentials:"
Write-Host "1. Go to https://developers.facebook.com/"
Write-Host "2. Create a new app (Consumer type)"
Write-Host "3. Add Facebook Login product"
Write-Host "4. Set Valid OAuth Redirect URI:"
Write-Host "   http://localhost:54321/auth/v1/callback"
Write-Host ""

Configure-Provider -ProviderName "Facebook" `
    -ClientIdVar "SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID" `
    -ClientSecretVar "SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET"

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Configuration Complete!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ OAuth providers configured" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Restart Supabase: supabase stop; supabase start"
Write-Host "2. Start the web app: cd web; npm run dev"
Write-Host "3. Test OAuth flow at http://localhost:3000/auth/signin"
Write-Host ""
Write-Host "For detailed setup instructions, see:"
Write-Host "  docs/oauth-setup.md"
Write-Host ""
Write-Host "Note: Keep your OAuth secrets secure and never commit them to git!" -ForegroundColor Yellow
Write-Host ""
