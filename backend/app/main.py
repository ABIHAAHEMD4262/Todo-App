"""
FastAPI Application - Todo App Phase II
Referencing: @backend/CLAUDE.md, @specs/api/rest-endpoints.md
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
import os

app = FastAPI(
    title="Todo API",
    description="Full-stack todo application API - Hackathon II Phase II",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",  # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("✅ Database initialized")
    print(f"✅ CORS enabled for: {FRONTEND_URL}")

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "todo-api",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Todo API - Hackathon II Phase II",
        "docs": "/docs",
        "health": "/health"
    }

# TODO: Include routers (after creating them)
# from app.routes import tasks, dashboard
# app.include_router(tasks.router, prefix="/api", tags=["tasks"])
# app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
