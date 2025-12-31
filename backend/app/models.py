"""
SQLModel Database Models - Todo App Phase II
Referencing: @specs/database/schema.md
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """
    User model (managed by Better Auth)

    Table: users
    Indexes: email (unique)
    """
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: One user has many tasks
    tasks: list["Task"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )

class Task(SQLModel, table=True):
    """
    Task model

    Table: tasks
    Indexes: user_id, completed, (user_id, completed) composite
    Foreign Key: user_id -> users.id (CASCADE DELETE)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Many tasks belong to one user
    user: User = Relationship(back_populates="tasks")
