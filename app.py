"""
Hugging Face Spaces Entry Point
Lightweight FastAPI server for Todo App
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set environment defaults for HF Spaces
os.environ.setdefault("KAFKA_ENABLED", "false")

# Import and configure the app
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Todo API",
    description="Todo App API - Hugging Face Spaces Deployment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow all origins for HF Spaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Import ALL models BEFORE init_db so SQLModel knows about all tables
from app.models import User, Task, Tag, TaskTag, Conversation, Message, Reminder

# Database initialization
from app.database import init_db

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    # Create all tables (including tags, task_tags if they don't exist)
    init_db()
    print("[OK] Database initialized (all tables created)")
    print("[OK] CORS enabled for: *")

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "todo-api", "version": "1.0.0"}

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Todo API - Hugging Face Spaces",
        "docs": "/docs",
        "health": "/health"
    }

# Include routers from backend
from app.routes import tasks, dashboard, tags
from app.routes.auth import router as auth_router

app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(tags.router, prefix="/api", tags=["tags"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(auth_router, prefix="/api", tags=["auth"])

# Only include chat if AI dependencies are available
try:
    from app.routes import chat
    app.include_router(chat.router, prefix="/api", tags=["chat"])
    print("[OK] Chat routes enabled")
except ImportError as e:
    print(f"[SKIP] Chat routes disabled (missing AI dependencies): {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
