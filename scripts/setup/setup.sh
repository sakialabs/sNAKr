#!/bin/bash
# sNAKr Setup Script for Linux/macOS
# This script sets up the development environment
#
# Usage:
#   ./scripts/setup/setup.sh           # Interactive mode
#   ./scripts/setup/setup.sh --lite    # Lite build (fast, no ML)
#   ./scripts/setup/setup.sh --full    # Full build (with ML)

set -e

LITE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --lite)
            LITE=true
            shift
            ;;
        --full)
            LITE=false
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--lite|--full]"
            exit 1
            ;;
    esac
done

echo "🍇 sNAKr Setup Script"
echo "====================="
echo ""

# Ask user for build type if not specified
if [ "$LITE" = false ] && [ $# -eq 0 ]; then
    echo "Choose your build type:"
    echo "  [1] LITE - Fast build without ML dependencies (5-10 min) - Recommended for development"
    echo "  [2] FULL - Complete build with ML dependencies (20-40 min)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        LITE=true
        echo "✓ Selected: LITE build"
    else
        echo "✓ Selected: FULL build"
    fi
    echo ""
fi

if [ "$LITE" = true ]; then
    echo "Build Mode: LITE (no ML dependencies)"
    export INSTALL_ML="false"
else
    echo "Build Mode: FULL (includes ML dependencies)"
    export INSTALL_ML="true"
fi

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
if [ "$LITE" = true ]; then
    echo "Building LITE version (5-10 minutes)..."
else
    echo "Building FULL version (20-40 minutes)..."
fi
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
