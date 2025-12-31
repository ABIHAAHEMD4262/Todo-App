# Phase 2: Backend API Development Skill

## Purpose
Specialized skill for building robust, scalable FastAPI backend with SQLModel ORM and Neon PostgreSQL for the Todo Full-Stack Web Application (Phase 2).

## When to Use
- Creating RESTful API endpoints
- Designing database models with SQLModel
- Implementing business logic
- Setting up database migrations
- Handling request validation
- Implementing error handling
- Optimizing database queries
- Setting up CORS and middleware

## Tech Stack Focus
- **Framework**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Validation**: Pydantic v2
- **Authentication**: JWT (Better Auth integration)
- **Testing**: pytest, httpx
- **Migration**: Alembic (with SQLModel)

## Capabilities

### 1. API Architecture
- RESTful endpoint design
- Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Request/Response models with Pydantic
- Dependency injection for database sessions
- Middleware for authentication
- CORS configuration for frontend
- Rate limiting (optional)

### 2. Database Design
- SQLModel model definition
- Relationships (Foreign Keys)
- Indexes for performance
- Migrations with Alembic
- Connection pooling
- Transaction management

### 3. Request Handling
- Request validation with Pydantic
- Query parameters
- Path parameters
- Request body validation
- File uploads (if needed)
- Pagination

### 4. Error Handling
- HTTPException for API errors
- Custom exception handlers
- Proper status codes (200, 201, 400, 401, 404, 500)
- Error response models
- Logging

### 5. Security
- JWT token verification
- User authentication middleware
- Authorization (user-specific data)
- Input sanitization
- SQL injection prevention (SQLModel handles this)
- Environment variables for secrets

## API Endpoint Checklist

### Creating a New Endpoint:
- [ ] Define request/response models
- [ ] Implement route handler function
- [ ] Add authentication dependency
- [ ] Validate user ownership of resources
- [ ] Add proper HTTP status codes
- [ ] Handle errors with HTTPException
- [ ] Add docstrings for API docs
- [ ] Test endpoint with different scenarios

### Database Model:
- [ ] Inherit from SQLModel with table=True
- [ ] Define all fields with proper types
- [ ] Add constraints (unique, nullable, default)
- [ ] Create indexes for frequently queried fields
- [ ] Add relationships if needed
- [ ] Create migration script

## Code Examples

### 1. Database Models
```python
# app/models.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User model (managed by Better Auth)"""
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    """Task model for todo items"""
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

### 2. Request/Response Schemas
```python
# app/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """Request model for creating a task"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class TaskUpdate(BaseModel):
    """Request model for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Response model for a task"""
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response model for task list"""
    tasks: list[TaskResponse]
    total: int
```

### 3. Database Connection
```python
# app/database.py
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10
)


def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database session"""
    with Session(engine) as session:
        yield session
```

### 4. Authentication Middleware
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
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not JWT_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable not set")


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Verify JWT token and return current user.
    Raises HTTPException if token is invalid or user not found.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
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
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    # Get user from database
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
```

### 5. API Routes
```python
# app/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import Task, User
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from datetime import datetime

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status_filter: str = Query("all", regex="^(all|pending|completed)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user.

    Query Parameters:
    - status: Filter by status (all, pending, completed)
    """
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Build query
    statement = select(Task).where(Task.user_id == user_id)

    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    tasks = session.exec(statement).all()

    return TaskListResponse(tasks=tasks, total=len(tasks))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task for the authenticated user."""
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Create task
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID."""
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify task belongs to user
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a task."""
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify task belongs to user
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Update fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a task."""
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify task belongs to user
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    session.delete(task)
    session.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Toggle task completion status."""
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify task belongs to user
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

### 6. Main Application
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app.routes import tasks
import os

app = FastAPI(
    title="Todo API",
    description="Todo Full-Stack Web Application - Phase 2",
    version="1.0.0"
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup"""
    create_db_and_tables()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Todo API is running"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
```

## Phase 2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks | List all tasks |
| POST | /api/{user_id}/tasks | Create a new task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update a task |
| DELETE | /api/{user_id}/tasks/{id} | Delete a task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

## Quality Standards

### Must Have:
- ✅ JWT authentication on all endpoints
- ✅ User isolation (users only see their own tasks)
- ✅ Proper HTTP status codes
- ✅ Request validation with Pydantic
- ✅ Error handling with HTTPException
- ✅ Database transactions
- ✅ Environment variables for secrets
- ✅ CORS configured for frontend

### Performance:
- ✅ Database indexes on frequently queried fields
- ✅ Connection pooling
- ✅ Efficient queries (no N+1 problems)
- ✅ Pagination for large datasets
- ✅ Response model optimization

### Security:
- ✅ JWT token verification
- ✅ Authorization checks (user owns resource)
- ✅ Input validation
- ✅ No SQL injection (SQLModel handles)
- ✅ Secrets in environment variables

## Example Usage

**User**: "Create REST API endpoints for task CRUD operations"

**This Skill Will**:
1. Define SQLModel models
2. Create Pydantic request/response schemas
3. Implement all CRUD endpoints
4. Add JWT authentication
5. Add user authorization
6. Handle errors properly
7. Configure CORS
8. Add API documentation

## Benefits
- ✅ Production-ready FastAPI code
- ✅ Secure authentication & authorization
- ✅ Type-safe with Pydantic
- ✅ Scalable database design
- ✅ Proper error handling
- ✅ Well-documented API

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
