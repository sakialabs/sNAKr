#!/bin/bash
# View logs from all services

SERVICE=${1:-""}

if [ -z "$SERVICE" ]; then
    echo "📋 Viewing logs from all services"
    echo "=================================="
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    docker-compose logs -f
else
    echo "📋 Viewing logs from $SERVICE"
    echo "=================================="
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    docker-compose logs -f "$SERVICE"
fi
