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
HF_SPACE_URL = os.getenv("HF_SPACE_URL")  # Hugging Face Space URL
VERCEL_URL = os.getenv("VERCEL_URL", "")  # Vercel deployment URL

cors_origins = [
    FRONTEND_URL,
    "http://localhost:3000",  # Local development
    "http://localhost:7860",  # Hugging Face local
    "https://huggingface.co",  # Hugging Face main domain
    "https://*.huggingface.co",  # Hugging Face subdomains
]

# Add Vercel deployment URL if available
if VERCEL_URL:
    cors_origins.append(VERCEL_URL)
    # Also add with and without www
    if VERCEL_URL.startswith("https://"):
        base_domain = VERCEL_URL[8:]  # Remove https://
    elif VERCEL_URL.startswith("http://"):
        base_domain = VERCEL_URL[7:]  # Remove http://
    else:
        base_domain = VERCEL_URL

    if not base_domain.startswith("www.") and f"https://www.{base_domain}" not in cors_origins:
        cors_origins.append(f"https://www.{base_domain}")
    elif base_domain.startswith("www."):
        non_www = base_domain[4:]  # Remove www.
        if f"https://{non_www}" not in cors_origins:
            cors_origins.append(f"https://{non_www}")

# Add Hugging Face Space URL if available
if HF_SPACE_URL:
    cors_origins.append(HF_SPACE_URL)
    # Also add the URL without protocol
    if HF_SPACE_URL.startswith("https://"):
        cors_origins.append(HF_SPACE_URL[8:])  # Remove https://
    elif HF_SPACE_URL.startswith("http://"):
        cors_origins.append(HF_SPACE_URL[7:])  # Remove http://

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("[OK] Database initialized")
    print(f"[OK] CORS enabled for: {cors_origins}")

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

# Include routers
from app.routes import tasks, dashboard, chat
from app.routes.auth import router as auth_router
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(auth_router, prefix="/api", tags=["auth"])
