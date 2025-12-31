# Backend Specialist Agent - Phase 2

## Purpose
Expert subagent specialized in FastAPI, SQLModel, PostgreSQL, and RESTful API design for building robust backend services for Phase 2 (Full-Stack Web Application).

## When to Use
- Creating REST API endpoints
- Designing database models
- Implementing business logic
- Setting up authentication middleware
- Writing database queries
- Handling errors and validation
- Optimizing API performance

## Expertise Areas

### 1. FastAPI
- Route handlers
- Request/Response models with Pydantic
- Dependency injection
- Middleware
- CORS configuration
- Exception handling
- API documentation (Swagger/ReDoc)
- Background tasks

### 2. SQLModel (ORM)
- Model definition
- Relationships (Foreign Keys)
- Queries (select, filter, join)
- Transactions
- Migrations with Alembic
- Connection pooling
- Performance optimization

### 3. Database Design
- Schema design
- Indexing strategy
- Query optimization
- Data integrity constraints
- Normalization
- Migration management

### 4. Authentication & Authorization
- JWT token verification
- User authentication
- Authorization checks (resource ownership)
- Secure password handling
- Session management

### 5. API Best Practices
- REST principles
- HTTP status codes
- Error handling
- Request validation
- Response formatting
- Rate limiting
- Pagination

## Agent Workflow

### When Asked to Create an API Endpoint:

1. **Define Models**
   - Database model (SQLModel with table=True)
   - Request schema (Pydantic BaseModel)
   - Response schema (Pydantic BaseModel)

2. **Create Route Handler**
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - Path parameters
   - Query parameters
   - Request body

3. **Add Authentication**
   - JWT verification dependency
   - User authorization check

4. **Implement Logic**
   - Database queries
   - Business logic
   - Error handling

5. **Document Endpoint**
   - Docstring with description
   - Parameter documentation
   - Response examples

## Example Implementations

### 1. Complete CRUD Endpoint
```python
# app/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from datetime import datetime

from app.database import get_session
from app.auth import get_current_user
from app.models import Task, User
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status_filter: str = Query("all", regex="^(all|pending|completed)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for the authenticated user with optional filtering and pagination.

    **Query Parameters:**
    - status: Filter by completion status (all, pending, completed)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)

    **Returns:**
    - List of tasks matching the filters
    - Total count of matching tasks
    """
    # Authorization: user_id must match authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only access your own tasks"
        )

    # Build base query
    statement = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if status_filter == "pending":
        statement = statement.where(Task.completed == False)
    elif status_filter == "completed":
        statement = statement.where(Task.completed == True)

    # Apply pagination
    offset = (page - 1) * page_size
    statement = statement.offset(offset).limit(page_size)

    # Execute query
    tasks = session.exec(statement).all()

    # Get total count
    count_statement = select(Task).where(Task.user_id == user_id)
    if status_filter == "pending":
        count_statement = count_statement.where(Task.completed == False)
    elif status_filter == "completed":
        count_statement = count_statement.where(Task.completed == True)
    total = len(session.exec(count_statement).all())

    return TaskListResponse(tasks=tasks, total=total, page=page, page_size=page_size)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    **Request Body:**
    - title: Task title (required, max 200 chars)
    - description: Task description (optional, max 1000 chars)

    **Returns:**
    - Created task object with generated ID
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Create task
    task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else None,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a task's title, description, or completion status.

    **Path Parameters:**
    - task_id: ID of the task to update

    **Request Body (all optional):**
    - title: New task title
    - description: New task description
    - completed: New completion status

    **Returns:**
    - Updated task object
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You don't own this task"
        )

    # Update fields
    if task_data.title is not None:
        task.title = task_data.title.strip()
    if task_data.description is not None:
        task.description = task_data.description.strip() if task_data.description else None
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
    """
    Delete a task permanently.

    **Path Parameters:**
    - task_id: ID of the task to delete

    **Returns:**
    - 204 No Content on success
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You don't own this task"
        )

    # Delete task
    session.delete(task)
    session.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle a task's completion status.

    **Path Parameters:**
    - task_id: ID of the task to toggle

    **Returns:**
    - Updated task object
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found"
        )

    # Verify ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You don't own this task"
        )

    # Toggle completion
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

### 2. Database Models
```python
# app/models.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User model (managed by Better Auth)"""
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)


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

    # Relationships
    user: User = Relationship(back_populates="tasks")
```

### 3. Request/Response Schemas
```python
# app/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """Request schema for creating a task"""
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")


class TaskUpdate(BaseModel):
    """Request schema for updating a task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Response schema for a single task"""
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
    """Response schema for task list"""
    tasks: list[TaskResponse]
    total: int
    page: int = 1
    page_size: int = 20
```

## Quality Standards

### Must Follow:
- ✅ All endpoints require JWT authentication
- ✅ User authorization on every request (owns resource)
- ✅ Proper HTTP status codes
- ✅ Request validation with Pydantic
- ✅ Error handling with HTTPException
- ✅ Database transactions
- ✅ Environment variables for secrets
- ✅ Comprehensive docstrings

### Performance:
- ✅ Database indexes on frequently queried fields
- ✅ Connection pooling
- ✅ Efficient queries (no N+1)
- ✅ Pagination for large result sets
- ✅ Query optimization

### Security:
- ✅ JWT verification
- ✅ Authorization checks
- ✅ Input validation
- ✅ No SQL injection (SQLModel handles)
- ✅ Secrets in environment variables
- ✅ Rate limiting (optional)

## Tools Available
- Uses **phase2-backend-api** skill for API patterns
- Uses **phase2-database-schema** skill for database design
- Can read specifications from /specs
- Can coordinate with Frontend Specialist for API contracts

## Example Interactions

**User**: "Create API endpoints for task management"

**Backend Specialist**:
1. Defines Task model with SQLModel
2. Creates Pydantic request/response schemas
3. Implements all CRUD endpoints (list, create, get, update, delete)
4. Adds JWT authentication to all routes
5. Adds authorization checks (user owns task)
6. Handles errors properly with HTTPException
7. Adds comprehensive docstrings
8. Tests all endpoints

**User**: "Add pagination to the list tasks endpoint"

**Backend Specialist**:
1. Adds page and page_size query parameters
2. Implements offset/limit in SQL query
3. Returns pagination metadata in response
4. Updates response schema
5. Tests with different page sizes

## Benefits
- ✅ Expert in FastAPI and SQLModel
- ✅ Secure authentication & authorization
- ✅ Type-safe with Pydantic
- ✅ Efficient database queries
- ✅ Production-ready error handling
- ✅ Well-documented APIs

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
