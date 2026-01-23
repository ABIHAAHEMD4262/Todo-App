"""
SQLModel Database Models - Todo App Phase V
Referencing: @specs/phase5-advanced-cloud/spec.md
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from enum import Enum

# Enums for Phase 5 features
class Priority(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class RecurrencePattern(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"

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
    conversations: list["Conversation"] = Relationship(
        back_populates="user",
        cascade_delete=True
    )

class Task(SQLModel, table=True):
    """
    Task model - Phase V Enhanced

    Table: tasks
    Indexes: user_id, completed, priority, due_date
    Foreign Key: user_id -> users.id (CASCADE DELETE)

    Phase 5 Features:
    - Due dates and reminders
    - Priorities (none, low, medium, high, urgent)
    - Recurring tasks (daily, weekly, monthly, yearly, custom)
    - Tags (via TaskTag junction table)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Phase 5: Due Dates & Reminders
    due_date: Optional[datetime] = Field(default=None, index=True)
    reminder_minutes: Optional[int] = Field(default=None)  # minutes before due_date

    # Phase 5: Priority
    priority: str = Field(default="none", index=True)  # none, low, medium, high, urgent

    # Phase 5: Recurring Tasks
    is_recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = Field(default=None)  # daily, weekly, monthly, yearly, custom
    recurrence_interval: Optional[int] = Field(default=None)  # for custom: every N days/weeks
    recurrence_end_date: Optional[datetime] = Field(default=None)
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id")

    # Relationship: Many tasks belong to one user
    user: User = Relationship(back_populates="tasks")

    # Relationship: Many-to-many with tags
    task_tags: list["TaskTag"] = Relationship(back_populates="task", cascade_delete=True)

class Conversation(SQLModel, table=True):
    """
    Conversation model for chatbot sessions

    Table: conversations
    Indexes: user_id
    Foreign Key: user_id -> users.id (CASCADE DELETE)
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: One conversation has many messages
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True
    )
    user: User = Relationship(back_populates="conversations")

class Message(SQLModel, table=True):
    """
    Message model for conversation history

    Table: messages
    Indexes: conversation_id, role
    Foreign Key: conversation_id -> conversations.id (CASCADE DELETE)
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20, index=True)  # "user" or "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Many messages belong to one conversation
    conversation: Conversation = Relationship(back_populates="messages")


# ============================================================================
# Phase 5: Tags Feature
# ============================================================================

class Tag(SQLModel, table=True):
    """
    Tag model for categorizing tasks

    Table: tags
    Indexes: user_id, (user_id, name) unique
    Foreign Key: user_id -> users.id (CASCADE DELETE)
    """
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="#808080", max_length=20)  # Hex color code
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: Many-to-many with tasks
    task_tags: list["TaskTag"] = Relationship(back_populates="tag", cascade_delete=True)


class TaskTag(SQLModel, table=True):
    """
    Junction table for Task-Tag many-to-many relationship

    Table: task_tags
    Primary Key: (task_id, tag_id)
    """
    __tablename__ = "task_tags"

    task_id: int = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

    # Relationships
    task: Task = Relationship(back_populates="task_tags")
    tag: Tag = Relationship(back_populates="task_tags")


# ============================================================================
# Phase 5: Reminders (for Notification Service)
# ============================================================================

class Reminder(SQLModel, table=True):
    """
    Reminder model for scheduled notifications

    Table: reminders
    Indexes: user_id, task_id, remind_at, sent
    """
    __tablename__ = "reminders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    remind_at: datetime = Field(index=True)
    sent: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
