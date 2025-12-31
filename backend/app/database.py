"""
Database Connection - Todo App Phase II
Referencing: @backend/CLAUDE.md, @specs/database/schema.md
"""

from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=5,           # Maintain 5 connections
    max_overflow=10,       # Allow 10 additional connections
    pool_pre_ping=True,    # Verify connections before use
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False             # Set True for SQL logging (debugging)
)

def init_db():
    """
    Create database tables.
    Called on application startup.
    """
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency for database session.

    Usage in FastAPI:
        @app.get("/endpoint")
        async def endpoint(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
