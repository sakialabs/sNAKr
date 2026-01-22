#!/bin/bash
# Check health of all services

echo "🏥 sNAKr Health Check"
echo "====================="
echo ""

# Check Supabase
echo "Supabase:"
if supabase status &> /dev/null; then
    echo "  ✓ Running"
    STUDIO_URL=$(supabase status | grep "Studio URL" | awk '{print $3}')
    echo "  Studio: $STUDIO_URL"
else
    echo "  ✗ Not running"
fi

echo ""

# Check Docker services
echo "Docker Services:"
docker-compose ps

echo ""

# Check API health endpoint
echo "API Health:"
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "  ✓ API responding"
else
    echo "  ✗ API not responding"
fi

echo ""

# Check Web
echo "Web:"
if curl -f http://localhost:3000 &> /dev/null; then
    echo "  ✓ Web responding"
else
    echo "  ✗ Web not responding"
fi

echo ""

# Check MinIO
echo "MinIO:"
if curl -f http://localhost:9000/minio/health/live &> /dev/null; then
    echo "  ✓ MinIO responding"
else
    echo "  ✗ MinIO not responding"
fi

echo ""
echo "Quick Links:"
echo "  Supabase Studio: http://localhost:54323"
echo "  API Docs:        http://localhost:8000/docs"
echo "  Web App:         http://localhost:3000"
echo "  MinIO Console:   http://localhost:9001"
