#!/bin/bash

# OAuth Configuration Test Script
# Verifies that OAuth providers are properly configured

set -e

echo "🦝 sNAKr OAuth Configuration Test"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check if files exist
echo "Checking configuration files..."
echo ""

if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

if [ ! -f "web/.env" ]; then
    echo -e "${RED}✗ web/.env file not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ web/.env file exists${NC}"
fi

if [ ! -f "supabase/config.toml" ]; then
    echo -e "${RED}✗ supabase/config.toml not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ supabase/config.toml exists${NC}"
fi

echo ""
echo "Checking OAuth provider configuration..."
echo ""

# Function to check environment variable
check_env_var() {
    local file=$1
    local var=$2
    local provider=$3
    
    if grep -q "^${var}=.\+$" "$file"; then
        echo -e "${GREEN}✓ ${provider} configured in ${file}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ ${provider} not configured in ${file}${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

# Check Google OAuth
echo "Google OAuth:"
check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" "Google Client ID"
check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" "Google Secret"
check_env_var "web/.env" "GOOGLE_CLIENT_ID" "Google Client ID (web)"
check_env_var "web/.env" "GOOGLE_CLIENT_SECRET" "Google Secret (web)"

# Check if Google is enabled in Supabase config
if grep -A 1 "\[auth.external.google\]" supabase/config.toml | grep -q "enabled = true"; then
    echo -e "${GREEN}✓ Google OAuth enabled in Supabase${NC}"
else
    echo -e "${RED}✗ Google OAuth not enabled in Supabase config${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check GitHub OAuth
echo "GitHub OAuth:"
check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID" "GitHub Client ID"
check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET" "GitHub Secret"
check_env_var "web/.env" "GITHUB_CLIENT_ID" "GitHub Client ID (web)"
check_env_var "web/.env" "GITHUB_CLIENT_SECRET" "GitHub Secret (web)"

# Check if GitHub is enabled in Supabase config
if grep -A 1 "\[auth.external.github\]" supabase/config.toml | grep -q "enabled = true"; then
    echo -e "${GREEN}✓ GitHub OAuth enabled in Supabase${NC}"
else
    echo -e "${RED}✗ GitHub OAuth not enabled in Supabase config${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check Apple OAuth (optional)
echo "Apple OAuth (optional):"
if check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_APPLE_CLIENT_ID" "Apple Client ID" 2>/dev/null; then
    check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_APPLE_SECRET" "Apple Secret"
    check_env_var "web/.env" "APPLE_CLIENT_ID" "Apple Client ID (web)"
    
    if grep -A 1 "\[auth.external.apple\]" supabase/config.toml | grep -q "enabled = true"; then
        echo -e "${GREEN}✓ Apple OAuth enabled in Supabase${NC}"
    else
        echo -e "${YELLOW}⚠ Apple OAuth not enabled in Supabase config${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Apple OAuth not configured (optional)${NC}"
fi

echo ""

# Check Facebook OAuth (optional)
echo "Facebook OAuth (optional):"
if check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_FACEBOOK_CLIENT_ID" "Facebook Client ID" 2>/dev/null; then
    check_env_var ".env" "SUPABASE_AUTH_EXTERNAL_FACEBOOK_SECRET" "Facebook Secret"
    check_env_var "web/.env" "FACEBOOK_CLIENT_ID" "Facebook Client ID (web)"
    
    if grep -A 1 "\[auth.external.facebook\]" supabase/config.toml | grep -q "enabled = true"; then
        echo -e "${GREEN}✓ Facebook OAuth enabled in Supabase${NC}"
    else
        echo -e "${YELLOW}⚠ Facebook OAuth not enabled in Supabase config${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Facebook OAuth not configured (optional)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All OAuth providers configured correctly!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Restart Supabase: supabase stop && supabase start"
    echo "2. Start web app: cd web && npm run dev"
    echo "3. Test OAuth at http://localhost:3000/auth/signin"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuration complete with warnings${NC}"
    echo -e "${YELLOW}Warnings: ${WARNINGS}${NC}"
    echo ""
    echo "Minimum required providers (Google, GitHub) are configured."
    echo "Optional providers (Apple, Facebook) can be added later."
    echo ""
    echo "Next steps:"
    echo "1. Restart Supabase: supabase stop && supabase start"
    echo "2. Start web app: cd web && npm run dev"
    echo "3. Test OAuth at http://localhost:3000/auth/signin"
    exit 0
else
    echo -e "${RED}✗ Configuration incomplete${NC}"
    echo -e "${RED}Errors: ${ERRORS}${NC}"
    echo -e "${YELLOW}Warnings: ${WARNINGS}${NC}"
    echo ""
    echo "Please run the OAuth configuration script:"
    echo "  ./scripts/setup/configure-oauth.sh"
    echo ""
    echo "Or see the setup guide:"
    echo "  docs/OAUTH_QUICKSTART.md"
    exit 1
fi
