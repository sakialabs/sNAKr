#!/bin/bash
# sNAKr Setup Script for Linux/macOS
# This script sets up the development environment

set -e

echo "🍇 sNAKr Setup Script"
echo "====================="
echo ""

# Check Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✓ Docker found: $(docker --version)"
else
    echo "✗ Docker not found. Please install Docker."
    echo "  Download: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check Docker Compose
echo ""
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✓ Docker Compose found: $(docker-compose --version)"
else
    echo "✗ Docker Compose not found."
    exit 1
fi

# Check if Docker is running
echo ""
echo "Checking if Docker is running..."
if docker ps &> /dev/null; then
    echo "✓ Docker is running"
else
    echo "✗ Docker is not running. Please start Docker."
    exit 1
fi

# Copy .env.example to .env if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
else
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
fi

# Build containers
echo ""
echo "Building Docker containers..."
echo "This may take a few minutes on first run..."
docker-compose build
echo "✓ Containers built successfully"

# Start services
echo ""
echo "Starting services..."
docker-compose up -d
echo "✓ Services started successfully"

# Wait for services to be healthy
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker-compose ps

# Display access URLs
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Access your services:"
echo "  Web App:       http://localhost:3000"
echo "  API Docs:      http://localhost:8000/docs"
echo "  MinIO Console: http://localhost:9001"
echo "  Database:      localhost:5432"
echo "  Redis:         localhost:6379"
echo ""
echo "Useful Commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo "Happy coding! 🦝"
