#!/bin/bash
# Link local Supabase to production project

set -e

echo "🔗 Linking local Supabase to production..."
echo ""

# Project details
PROJECT_REF="phzgiwhpsesycafmfafm"
PROJECT_URL="https://phzgiwhpsesycafmfafm.supabase.co"

echo "Project: $PROJECT_REF"
echo "URL: $PROJECT_URL"
echo ""

# Link project
echo "Linking to production project..."
supabase link --project-ref $PROJECT_REF

echo ""
echo "✅ Successfully linked to production!"
echo ""
echo "Next steps:"
echo "1. Push migrations: supabase db push"
echo "2. Verify tables: supabase db list-tables --linked"
echo "3. Open Studio: supabase db studio --linked"
echo ""
echo "⚠️  WARNING: Be careful with production database!"
echo "   Always test migrations locally first."
