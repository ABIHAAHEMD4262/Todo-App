# Backend Guidelines - Todo App Phase II

## Stack
- **Framework**: FastAPI
- **Language**: Python 3.13+
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT verification (integrates with Better Auth)
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Testing**: Pytest
- **ASGI Server**: Uvicorn

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── database.py       # Database connection and session
│   ├── auth.py           # JWT verification middleware
│   ├── models.py         # SQLModel database models
│   ├── schemas.py        # Pydantic request/response schemas
│   └── routes/
│       ├── __init__.py
│       ├── tasks.py      # Task CRUD endpoints
│       └── dashboard.py  # Dashboard statistics endpoint
├── migrations/           # Alembic migrations
│   ├── env.py
│   └── versions/
│       └── 001_initial_schema.py
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_tasks.py
│   └── test_dashboard.py
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (not committed)
└── .env.example          # Environment template
```

## API Conventions

### Route Patterns
- All routes under `/api/`
- RESTful naming conventions
- User-scoped endpoints: `/api/{user_id}/...`

### Response Format
```python
# Success (200, 201)
{
  "id": 1,
  "title": "Task title",
  ...
}

# Error (400, 401, 403, 404, 500)
{
  "detail": "Error message"
}
```

### Status Codes
- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## FastAPI App Setup

```python
# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tasks, dashboard
from app.database import init_db

app = FastAPI(
    title="Todo API",
    description="Full-stack todo application API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev
        "https://your-app.vercel.app"  # Frontend prod
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Startup event
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Database Connection

```python
# app/database.py

from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# Engine configuration
engine = create_engine(
    DATABASE_URL,
    pool_size=5,           # Maintain 5 connections
    max_overflow=10,       # Allow 10 additional connections
    pool_pre_ping=True,    # Verify connections before use
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False             # Set True for SQL logging (debugging)
)

def init_db():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency for database session"""
    with Session(engine) as session:
        yield session
```

## SQLModel Models

```python
# app/models.py

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: User = Relationship(back_populates="tasks")
```

## Pydantic Schemas

```python
# app/schemas.py

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# Task Schemas
class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int

# Dashboard Schemas
class ActivityItem(BaseModel):
    task_id: Optional[int]
    task_title: str
    action: str  # 'created' | 'completed' | 'updated' | 'deleted'
    timestamp: datetime

class DashboardStatsResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    completed_tasks: int
    completion_rate: float
    recent_activity: list[ActivityItem]
```

## JWT Authentication

```python
# app/auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
import jwt
import os

security = HTTPBearer()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Verify JWT token and return current user.

    Raises:
        HTTPException 401: Invalid or expired token
        HTTPException 401: User not found
    """
    token = credentials.credentials

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    # Get user from database
    user = session.exec(
        select(User).where(User.id == user_id)
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

## Route Handlers

### Example: Task CRUD Endpoints

```python
# app/routes/tasks.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Task
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse
)

router = APIRouter()

@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status_filter: str = Query("all", regex="^(all|pending|completed)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all tasks for user with optional status filtering."""

    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build query
    statement = select(Task).where(Task.user_id == user_id)

    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    # Sort by created_at DESC
    statement = statement.order_by(Task.created_at.desc())

    # Execute query
    tasks = session.exec(statement).all()

    return TaskListResponse(tasks=tasks, total=len(tasks))

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task."""

    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Create task
    task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else None
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a task."""

    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get task
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields
    if task_data.title is not None:
        task.title = task_data.title.strip()
    if task_data.description is not None:
        task.description = task_data.description.strip()
    if task_data.completed is not None:
        task.completed = task_data.completed

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a task."""

    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get task
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Toggle task completion status."""

    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get task
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Toggle completion
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

## Error Handling

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

## Database Migrations (Alembic)

### Initialize Alembic
```bash
alembic init migrations
```

### Configure Alembic
```python
# migrations/env.py

from app.models import SQLModel
from app.database import DATABASE_URL

target_metadata = SQLModel.metadata
config.set_main_option("sqlalchemy.url", DATABASE_URL)
```

### Create Migration
```bash
alembic revision --autogenerate -m "Add tasks and users tables"
```

### Apply Migration
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## Testing with Pytest

```python
# tests/test_tasks.py

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_task():
    response = client.post(
        "/api/user123/tasks",
        json={"title": "Test task", "description": "Test description"},
        headers={"Authorization": "Bearer <test_token>"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test task"

def test_list_tasks():
    response = client.get(
        "/api/user123/tasks",
        headers={"Authorization": "Bearer <test_token>"}
    )
    assert response.status_code == 200
    assert "tasks" in response.json()
```

## Environment Variables

Create `.env` (never commit):
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
BETTER_AUTH_SECRET=<openssl rand -base64 32>
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

## Running the Server

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation
When server is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Best Practices

1. **Always use type hints** - Enables Pydantic validation
2. **Use dependency injection** - `Depends()` for auth, database, etc.
3. **Validate all inputs** - Pydantic schemas for request bodies
4. **Handle errors explicitly** - Raise HTTPException with proper status codes
5. **Use async when possible** - Better performance for I/O operations
6. **Log important events** - Use Python logging module
7. **Write tests** - Test all endpoints and edge cases
8. **Document endpoints** - Use docstrings and OpenAPI annotations

---

**Backend Status**: Ready for Phase II Implementation
**Last Updated**: 2025-12-30
**Framework Version**: FastAPI 0.100+
**Python Version**: 3.13+
