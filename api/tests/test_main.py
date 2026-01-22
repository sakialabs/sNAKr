"""
Tests for main API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "snakr-api"
    assert "version" in data


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert "health" in data


def test_api_v1_root():
    """Test API v1 root endpoint"""
    response = client.get("/api/v1")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "sNAKr API v1"
    assert data["version"] == "0.1.0"


def test_docs_available():
    """Test that API documentation is available"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_redoc_available():
    """Test that ReDoc documentation is available"""
    response = client.get("/redoc")
    assert response.status_code == 200
