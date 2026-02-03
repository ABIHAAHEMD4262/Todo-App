"""
FastAPI Application - Todo App Phase II
Referencing: @backend/CLAUDE.md, @specs/api/rest-endpoints.md
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
import asyncio
import os

# Event system imports (optional - may not be available in all deployments)
try:
    from app.events.producer import event_producer, TOPIC_TASK_COMPLETED, TOPIC_REMINDER_DUE
    from app.events.consumer import event_consumer
    EVENTS_AVAILABLE = True
except ImportError:
    EVENTS_AVAILABLE = False

try:
    from app.scheduler import reminder_checker
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False

# Background task for consumer
_consumer_task = None
REMINDER_CHECKER_ENABLED = os.getenv("REMINDER_CHECKER_ENABLED", "true").lower() == "true"

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
    "http://localhost:3001",  # Local development alternate port
    "http://localhost:7860",  # Hugging Face local
    "http://127.0.0.1:3000",  # Local IP
    "http://127.0.0.1:3001",  # Local IP alternate
    "https://huggingface.co",  # Hugging Face main domain
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
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database, event producer, consumer, and reminder checker on startup"""
    global _consumer_task

    init_db()
    print("[OK] Database initialized")
    print(f"[OK] CORS enabled for: {cors_origins}")

    # Connect Kafka producer/consumer (if available)
    if EVENTS_AVAILABLE:
        await event_producer.connect()
        print("[OK] Kafka event producer initialized")

        topics = [TOPIC_TASK_COMPLETED, TOPIC_REMINDER_DUE]
        await event_consumer.connect(topics)
        _consumer_task = asyncio.create_task(event_consumer.start_consuming())
        print("[OK] Kafka event consumer started")
    else:
        print("[SKIP] Event system not available")

    # Start reminder checker background task
    if REMINDER_CHECKER_ENABLED and SCHEDULER_AVAILABLE:
        await reminder_checker.start()
        print("[OK] Reminder checker started (checks every 60s)")
    elif not SCHEDULER_AVAILABLE:
        print("[SKIP] Scheduler not available")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global _consumer_task

    # Stop reminder checker
    if REMINDER_CHECKER_ENABLED and SCHEDULER_AVAILABLE:
        await reminder_checker.stop()
        print("[OK] Reminder checker stopped")

    # Stop consumer/producer
    if EVENTS_AVAILABLE:
        await event_consumer.stop()
        if _consumer_task:
            _consumer_task.cancel()
            try:
                await _consumer_task
            except asyncio.CancelledError:
                pass
        print("[OK] Kafka event consumer stopped")

        await event_producer.disconnect()
        print("[OK] Kafka event producer disconnected")

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
from app.routes import tasks, dashboard, chat, tags
from app.routes.auth import router as auth_router
from app.routes.reminders import router as reminders_router
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(tags.router, prefix="/api", tags=["tags"])
app.include_router(reminders_router, prefix="/api", tags=["reminders"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(auth_router, prefix="/api", tags=["auth"])
