#!/bin/bash

# OAuth Provider Configuration Script
# This script helps configure OAuth providers for sNAKr authentication

set -e

echo "🦝 sNAKr OAuth Configuration Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

if [ ! -f "web/.env" ]; then
    echo -e "${YELLOW}Creating web/.env file from web/.env.example...${NC}"
    cp web/.env.example web/.env
    echo -e "${GREEN}✓ Created web/.env file${NC}"
fi

echo ""
echo "This script will help you configure OAuth providers for sNAKr."
echo "You'll need to create OAuth apps for each provider you want to enable."
echo ""
echo "Minimum required for MVP:"
echo "  - Google OAuth"
echo "  - GitHub OAuth"
echo ""
echo "Optional providers:"
echo "  - Apple OAuth (recommended for iOS users)"
echo "  - Facebook OAuth"
echo ""

# Function to configure a provider
configure_provider() {
    local provider=$1
    local client_id_var=$2
    local client_secret_var=$3
    
    echo ""
    echo -e "${YELLOW}Configure ${provider} OAuth?${NC} (y/n)"
    read -r configure
    
    if [ "$configure" = "y" ] || [ "$configure" = "Y" ]; then
        echo ""
        echo "Enter ${provider} Client ID:"
        read -r client_id
        
        echo "Enter ${provider} Client Secret:"
        read -rs client_secret
        echo ""
        
        # Update root .env
        if grep -q "^${client_id_var}=" .env; then
            sed -i.bak "s|^${client_id_var}=.*|${client_id_var}=${client_id}|" .env
        else
            echo "${client_id_var}=${client_id}" >> .env
        fi
        
        if grep -q "^${client_secret_var}=" .env; then
            sed -i.bak "s|^${client_secret_var}=.*|${client_secret_var}=${client_secret}|" .env
        else
            echo "${client_secret_var}=${client_secret}" >> .env
        fi
        
        # Update web/.env
        if grep -q "^${client_id_var#SUPABASE_AUTH_EXTERNAL_}=" web/.env; then
            sed -i.bak "s|^${client_id_var#SUPABASE_AUTH_EXTERNAL_}=.*|${client_id_var#SUPABASE_AUTH_EXTERNAL_}=${client_id}|" web/.env
        else
            echo "${client_id_var#SUPABASE_AUTH_EXTERNAL_}=${client_id}" >> web/.env
        fi
        
        if grep -q "^${client_secret_var#SUPABASE_AUTH_EXTERNAL_}=" web/.env; then
            sed -i.bak "s|^${client_secret_var#SUPABASE_AUTH_EXTERNAL_}=.*|${client_secret_var#SUPABASE_AUTH_EXTERNAL_}=${client_secret}|" web/.env
        else
            echo "${client_secret_var#SUPABASE_AUTH_EXTERNAL_}=${client_secret}" >> web/.env
        fi
        
        # Clean up backup files
        rm -f .env.bak web/.env.bak
        
        echo -e "${GREEN}✓ ${provider} OAuth configured${NC}"
    else
        echo -e "${YELLOW}⊘ Skipping ${provider} OAuth${NC}"
    fi
}

# Configure Google OAuth
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Google OAuth Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get Google OAuth credentials:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing"
echo "3. Navigate to APIs & Services > Credentials"
echo "4. Create OAuth 2.0 Client ID (Web application)"
echo "5. Add authorized redirect URI:"
echo "   http://localhost:54321/auth/v1/callback"
echo ""

configure_provider "Google" "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET"

# Configure GitHub OAuth
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GitHub OAuth Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get GitHub OAuth credentials:"
echo "1. Go to https://github.com/settings/developers"
echo "2. Click 'New OAuth App'"
echo "3. Set Authorization callback URL:"
echo "   http://localhost:54321/auth/v1/callback"
echo ""

configure_provider "GitHub" "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID" "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET"

# Configure Apple OAuth (optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Apple OAuth Configuration (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get Apple OAuth credentials:"
echo "1. Go to https://developer.apple.com/account/"
echo "2. Navigate to Certificates, Identifiers & Profiles"
echo "3. Create a Service ID and enable Sign In with Apple"
echo "4. Configure return URL:"
echo "   http://localhost:54321/auth/v1/callback"
echo ""

configure_provider "Apple" "SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID" "SUPABASE_AUTH_EXTERNAL_APPLE_SECRET"

# Configure Facebook OAuth (optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Facebook OAuth Configuration (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To get Facebook OAuth credentials:"
echo "1. Go to https://developers.facebook.com/"
echo "2. Create a new app (Consumer type)"
echo "3. Add Facebook Login product"
echo "4. Set Valid OAuth Redirect URI:"
echo "   http://localhost:54321/auth/v1/callback"
echo ""

configure_provider "Facebook" "SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID" "SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Configuration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✓ OAuth providers configured${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Supabase: supabase stop && supabase start"
echo "2. Start the web app: cd web && npm run dev"
echo "3. Test OAuth flow at http://localhost:3000/auth/signin"
echo ""
echo "For detailed setup instructions, see:"
echo "  docs/oauth-setup.md"
echo ""
echo -e "${YELLOW}Note: Keep your OAuth secrets secure and never commit them to git!${NC}"
echo ""
