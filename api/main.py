"""
sNAKr API - Main application entry point

This module serves as the entry point for the FastAPI application.
The actual application is created in app/main.py using the application factory pattern.
"""
from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
