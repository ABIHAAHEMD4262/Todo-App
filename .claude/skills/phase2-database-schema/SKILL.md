# Phase 2: Database Schema Design Skill

## Purpose
Specialized skill for designing efficient, scalable database schemas using SQLModel and Neon Serverless PostgreSQL for the Todo Full-Stack Web Application (Phase 2).

## When to Use
- Designing database models
- Creating relationships between tables
- Adding indexes for performance
- Setting up migrations with Alembic
- Optimizing queries
- Normalizing data structure
- Planning data constraints

## Tech Stack Focus
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Database**: Neon Serverless PostgreSQL
- **Migrations**: Alembic
- **Python**: 3.13+

## Capabilities

### 1. Schema Design
- Table structure design
- Primary keys and foreign keys
- Data types selection
- Constraints (unique, nullable, default)
- Indexes for query optimization
- Relationships (one-to-many, many-to-many)

### 2. SQLModel Patterns
- Model definition with table=True
- Field definitions with Field()
- Relationships with Relationship()
- Validators
- Computed fields
- Model inheritance

### 3. Database Optimization
- Index strategy
- Query optimization
- Connection pooling
- Transaction management
- Migration best practices

### 4. Data Integrity
- Foreign key constraints
- Unique constraints
- Check constraints
- Default values
- Auto-incrementing IDs
- Timestamps (created_at, updated_at)

## Phase 2 Schema Requirements

### Tables Needed:
1. **users** (managed by Better Auth)
2. **tasks** (todo items)

### Future Compatibility (Phase 3+):
3. **conversations** (chatbot sessions)
4. **messages** (chat history)

## Complete Schema Examples

### 1. User Model
```python
# app/models/user.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """
    User model (managed by Better Auth).
    This table is created and managed by Better Auth,
    but we define it here for relationships.
    """
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user", cascade_delete=True)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "user_abc123",
                "email": "john@example.com",
                "name": "John Doe",
                "created_at": "2025-12-30T10:00:00Z"
            }
        }
```

### 2. Task Model
```python
# app/models/task.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """
    Task model for todo items.
    Each task belongs to a specific user.
    """
    __tablename__ = "tasks"

    # Primary Key
    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Auto-incrementing task ID"
    )

    # Foreign Key
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="ID of the user who owns this task"
    )

    # Task Data
    title: str = Field(
        max_length=200,
        description="Task title (required, max 200 chars)"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (max 1000 chars)"
    )

    completed: bool = Field(
        default=False,
        index=True,
        description="Task completion status"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the task was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the task was last updated"
    )

    # Relationships
    user: "User" = Relationship(back_populates="tasks")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": "user_abc123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2025-12-30T10:00:00Z",
                "updated_at": "2025-12-30T10:00:00Z"
            }
        }
```

### 3. Future Models (Phase 3 Ready)
```python
# app/models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Conversation(SQLModel, table=True):
    """
    Conversation model for AI chatbot sessions.
    Phase 3: AI Chatbot
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship()
    messages: list["Message"] = Relationship(back_populates="conversation", cascade_delete=True)


class Message(SQLModel, table=True):
    """
    Message model for chat history.
    Phase 3: AI Chatbot
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=20, index=True)  # 'user' or 'assistant'
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
    user: "User" = Relationship()
```

## Database Indexes

### Why Indexes Matter:
- Speed up queries by 10-100x
- Essential for filtering and sorting
- Critical for foreign key lookups

### Phase 2 Indexes:
```python
# Automatically created by SQLModel when index=True is used:

# users table:
users.email (unique index)

# tasks table:
tasks.user_id (foreign key index)
tasks.completed (for filtering)
```

### Custom Composite Index (if needed):
```python
from sqlalchemy import Index

# In Task model:
__table_args__ = (
    Index('idx_user_completed', 'user_id', 'completed'),
)
```

## Database Migrations with Alembic

### 1. Initial Setup
```bash
# Install Alembic
uv add alembic

# Initialize Alembic
alembic init migrations
```

### 2. Configure Alembic
```python
# migrations/env.py
from app.database import DATABASE_URL
from app.models import *  # Import all models

target_metadata = SQLModel.metadata

def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

def run_migrations_online():
    connectable = create_engine(DATABASE_URL)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()
```

### 3. Create Migration
```bash
# Auto-generate migration from models
alembic revision --autogenerate -m "Create tasks table"

# Review the generated migration in migrations/versions/

# Apply migration
alembic upgrade head
```

### 4. Sample Migration
```python
# migrations/versions/001_create_tasks_table.py
from alembic import op
import sqlalchemy as sa
import sqlmodel

def upgrade():
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_completed', 'tasks', ['completed'])


def downgrade():
    op.drop_index('ix_tasks_completed', 'tasks')
    op.drop_index('ix_tasks_user_id', 'tasks')
    op.drop_table('tasks')
```

## Database Connection Configuration

```python
# app/database.py
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
import os

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Neon PostgreSQL connection with pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for debugging
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,  # Number of connections in pool
    max_overflow=10,  # Additional connections if needed
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def create_db_and_tables():
    """Create all database tables"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency for getting database session.
    Automatically commits or rolls back on error.
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
```

## Query Optimization Examples

### 1. Efficient Task Retrieval
```python
# ❌ Bad: N+1 query problem
tasks = session.exec(select(Task)).all()
for task in tasks:
    print(task.user.name)  # Triggers separate query for each user

# ✅ Good: Eager loading
from sqlmodel import select
from sqlalchemy.orm import selectinload

statement = select(Task).options(selectinload(Task.user))
tasks = session.exec(statement).all()
for task in tasks:
    print(task.user.name)  # No additional queries
```

### 2. Pagination
```python
from sqlmodel import select

def get_tasks_paginated(session: Session, user_id: str, page: int = 1, page_size: int = 20):
    """Get tasks with pagination"""
    offset = (page - 1) * page_size

    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    tasks = session.exec(statement).all()
    return tasks
```

### 3. Counting Efficiently
```python
from sqlmodel import func, select

# Get task count by status
statement = (
    select(
        Task.completed,
        func.count(Task.id).label("count")
    )
    .where(Task.user_id == user_id)
    .group_by(Task.completed)
)

results = session.exec(statement).all()
# Results: [(False, 10), (True, 25)]
```

## Schema Design Checklist

### Phase 2 Requirements:
- [x] User table (Better Auth managed)
- [x] Task table with user relationship
- [x] Primary keys defined
- [x] Foreign keys with CASCADE delete
- [x] Indexes on user_id and completed
- [x] Timestamps (created_at, updated_at)
- [x] Field constraints (max_length, nullable)
- [x] Proper data types

### Best Practices:
- [ ] All tables have primary keys
- [ ] Foreign keys have indexes
- [ ] Frequently queried fields have indexes
- [ ] Timestamps for audit trail
- [ ] Proper data types (not oversized)
- [ ] Default values where appropriate
- [ ] Nullable only when necessary
- [ ] Migration scripts created
- [ ] Database connection pooling configured

## Environment Variables

```bash
# .env file
DATABASE_URL=postgresql://user:password@host:5432/dbname

# For Neon Serverless PostgreSQL:
DATABASE_URL=postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/dbname?sslmode=require
```

## Common Issues and Solutions

### Issue 1: Slow Queries
**Solution**: Add indexes on frequently filtered/sorted columns
```python
completed: bool = Field(default=False, index=True)
```

### Issue 2: Connection Timeout
**Solution**: Configure connection pooling
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)
```

### Issue 3: Migration Conflicts
**Solution**: Always review auto-generated migrations before applying
```bash
alembic revision --autogenerate -m "message"
# Review migrations/versions/xxx_message.py
alembic upgrade head
```

## Example Usage

**User**: "Design database schema for multi-user todo app with authentication"

**This Skill Will**:
1. Create User model (for Better Auth integration)
2. Create Task model with foreign key to User
3. Add indexes for performance
4. Set up relationships
5. Configure database connection with pooling
6. Create Alembic migration scripts
7. Add timestamps and constraints

## Benefits
- ✅ Scalable database design
- ✅ Optimized query performance
- ✅ Data integrity with constraints
- ✅ Easy migrations with Alembic
- ✅ Type-safe models with SQLModel
- ✅ Future-proof for Phase 3+

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
