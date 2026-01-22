#!/bin/bash

# sNAKr Supabase Setup Script
# This script automates the setup of Supabase for local development

set -e  # Exit on error

echo "🍇 sNAKr Supabase Setup"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
echo "Checking for Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo ""
    echo "Please install Supabase CLI:"
    echo ""
    echo "macOS/Linux:"
    echo "  brew install supabase/tap/supabase"
    echo "  # or"
    echo "  npm install -g supabase"
    echo ""
    echo "Windows:"
    echo "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
    echo "  scoop install supabase"
    echo "  # or"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
supabase --version
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if Supabase is already running
echo "Checking Supabase status..."
if supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠ Supabase is already running${NC}"
    echo ""
    read -p "Do you want to restart Supabase? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping Supabase..."
        supabase stop
    else
        echo "Keeping existing Supabase instance."
        echo ""
        echo "Current status:"
        supabase status
        exit 0
    fi
fi

# Start Supabase
echo ""
echo "Starting Supabase services..."
echo "This may take a few minutes on first run..."
echo ""

supabase start

echo ""
echo -e "${GREEN}✓ Supabase started successfully!${NC}"
echo ""

# Get Supabase credentials
echo "Fetching Supabase credentials..."
API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')
STUDIO_URL=$(supabase status | grep "Studio URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SERVICE_ROLE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

echo ""
echo "📋 Supabase Credentials"
echo "======================="
echo ""
echo "API URL: $API_URL"
echo "DB URL: $DB_URL"
echo "Studio URL: $STUDIO_URL"
echo ""
echo "Anon Key: $ANON_KEY"
echo ""
echo "Service Role Key: $SERVICE_ROLE_KEY"
echo ""

# Update .env file
echo "Updating .env file..."

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Check if Supabase variables already exist
if grep -q "SUPABASE_URL" .env; then
    echo -e "${YELLOW}⚠ Supabase variables already exist in .env${NC}"
    read -p "Do you want to update them? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Remove old Supabase variables
        sed -i.bak '/SUPABASE_/d' .env
        rm .env.bak 2>/dev/null || true
    else
        echo "Skipping .env update."
        echo ""
        echo -e "${GREEN}✓ Setup complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Open Supabase Studio: $STUDIO_URL"
        echo "2. Run migrations: supabase db reset"
        echo "3. Start the app: docker-compose up -d"
        exit 0
    fi
fi

# Append Supabase variables to .env
cat >> .env << EOF

# Supabase Configuration (Local Development)
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Update Database URL to use Supabase PostgreSQL
# DATABASE_URL=$DB_URL
EOF

echo -e "${GREEN}✓ .env file updated${NC}"
echo ""

# Update mobile .env
echo "Updating mobile/.env file..."

if [ ! -f mobile/.env ]; then
    echo "Creating mobile/.env from mobile/.env.example..."
    cp mobile/.env.example mobile/.env
fi

# Update mobile .env
cat > mobile/.env << EOF
# Supabase Configuration (Local Development)
EXPO_PUBLIC_SUPABASE_URL=$API_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF

echo -e "${GREEN}✓ mobile/.env file updated${NC}"
echo ""

# Create web .env.local if it doesn't exist
echo "Updating web/.env.local file..."

if [ ! -f web/.env.local ]; then
    echo "Creating web/.env.local..."
    cat > web/.env.local << EOF
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF
    echo -e "${GREEN}✓ web/.env.local file created${NC}"
else
    echo -e "${YELLOW}⚠ web/.env.local already exists, skipping${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "📚 Next Steps:"
echo "=============="
echo ""
echo "1. Open Supabase Studio:"
echo "   $STUDIO_URL"
echo ""
echo "2. Create database migrations:"
echo "   supabase migration new create_households_table"
echo ""
echo "3. Apply migrations:"
echo "   supabase db reset"
echo ""
echo "4. Start the application:"
echo "   docker-compose up -d"
echo ""
echo "5. View Supabase status anytime:"
echo "   supabase status"
echo ""
echo "6. Stop Supabase when done:"
echo "   supabase stop"
echo ""
echo "📖 For more information, see docs/SUPABASE_SETUP.md"
echo ""
