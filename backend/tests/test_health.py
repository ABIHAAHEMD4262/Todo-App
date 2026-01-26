"""
Basic health check tests for Todo API
"""
import pytest
from fastapi.testclient import TestClient


def test_health_endpoint():
    """Test that the health endpoint returns healthy status"""
    # Import here to avoid database connection issues in CI
    from app.main import app

    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "todo-api"


def test_root_endpoint():
    """Test that the root endpoint returns welcome message"""
    from app.main import app

    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()
    assert "message" in data or "status" in data


def test_docs_endpoint():
    """Test that API docs are accessible"""
    from app.main import app

    client = TestClient(app)
    response = client.get("/docs")

    assert response.status_code == 200
