"""
Pydantic Schemas - Todo App Phase V
Referencing: @specs/phase5-advanced-cloud/spec.md
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

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

# ============================================================================
# Task Schemas
# ============================================================================

class TaskBase(BaseModel):
    """Base task schema with common fields"""
    title: str = Field(min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description"
    )


class TaskCreate(TaskBase):
    """Schema for creating a new task - Phase V Enhanced"""
    # Phase 5: Due Dates & Reminders
    due_date: Optional[datetime] = Field(default=None, description="Task due date")
    reminder_minutes: Optional[int] = Field(
        default=None,
        ge=0,
        description="Minutes before due_date to send reminder"
    )

    # Phase 5: Priority
    priority: Priority = Field(default=Priority.NONE, description="Task priority level")

    # Phase 5: Recurring Tasks
    is_recurring: bool = Field(default=False, description="Is this a recurring task?")
    recurrence_pattern: Optional[RecurrencePattern] = Field(
        default=None,
        description="Recurrence pattern (daily, weekly, monthly, yearly, custom)"
    )
    recurrence_interval: Optional[int] = Field(
        default=None,
        ge=1,
        description="For custom recurrence: every N days/weeks"
    )
    recurrence_end_date: Optional[datetime] = Field(
        default=None,
        description="End date for recurring tasks"
    )

    # Phase 5: Tags (list of tag IDs)
    tag_ids: Optional[list[int]] = Field(default=None, description="List of tag IDs to assign")


class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional) - Phase V Enhanced"""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

    # Phase 5: Due Dates & Reminders
    due_date: Optional[datetime] = None
    reminder_minutes: Optional[int] = Field(default=None, ge=0)

    # Phase 5: Priority
    priority: Optional[Priority] = None

    # Phase 5: Recurring Tasks
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[RecurrencePattern] = None
    recurrence_interval: Optional[int] = Field(default=None, ge=1)
    recurrence_end_date: Optional[datetime] = None

    # Phase 5: Tags
    tag_ids: Optional[list[int]] = None


class TagResponse(BaseModel):
    """Schema for tag response"""
    id: int
    name: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class TaskResponse(TaskBase):
    """Schema for task response - Phase V Enhanced"""
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    # Phase 5 fields
    due_date: Optional[datetime] = None
    reminder_minutes: Optional[int] = None
    priority: str = "none"
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    recurrence_interval: Optional[int] = None
    recurrence_end_date: Optional[datetime] = None
    parent_task_id: Optional[int] = None

    # Phase 5: Tags
    tags: list[TagResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    """Schema for list of tasks"""
    tasks: list[TaskResponse]
    total: int


# ============================================================================
# Phase 5: Tag Schemas
# ============================================================================

class TagCreate(BaseModel):
    """Schema for creating a new tag"""
    name: str = Field(min_length=1, max_length=50, description="Tag name")
    color: str = Field(
        default="#808080",
        pattern=r"^#[0-9A-Fa-f]{6}$",
        description="Hex color code (e.g., #FF5733)"
    )


class TagUpdate(BaseModel):
    """Schema for updating a tag"""
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")


class TagListResponse(BaseModel):
    """Schema for list of tags"""
    tags: list[TagResponse]
    total: int


# ============================================================================
# Phase 5: Search & Filter Schemas
# ============================================================================

class TaskSearchParams(BaseModel):
    """Schema for task search/filter parameters"""
    status: Optional[str] = Field(
        default="all",
        pattern=r"^(all|pending|completed)$",
        description="Filter by status"
    )
    priority: Optional[Priority] = Field(default=None, description="Filter by priority")
    tag_ids: Optional[list[int]] = Field(default=None, description="Filter by tag IDs")
    due_from: Optional[datetime] = Field(default=None, description="Due date from")
    due_to: Optional[datetime] = Field(default=None, description="Due date to")
    search: Optional[str] = Field(default=None, max_length=200, description="Search keyword")
    sort_by: str = Field(
        default="created_at",
        pattern=r"^(created_at|due_date|priority|title)$",
        description="Sort field"
    )
    sort_order: str = Field(
        default="desc",
        pattern=r"^(asc|desc)$",
        description="Sort order"
    )

# ============================================================================
# Dashboard Schemas
# ============================================================================

class ActivityItem(BaseModel):
    """Schema for activity feed item"""
    task_id: Optional[int] = Field(description="Task ID (null if deleted)")
    task_title: str = Field(description="Task title")
    action: str = Field(description="Action: created | completed | updated | deleted")
    timestamp: datetime = Field(description="When the action occurred")

class DashboardStatsResponse(BaseModel):
    """Schema for dashboard statistics"""
    total_tasks: int = Field(description="Total number of tasks")
    pending_tasks: int = Field(description="Number of incomplete tasks")
    completed_tasks: int = Field(description="Number of completed tasks")
    completion_rate: float = Field(description="Completion percentage (0-100)")
    recent_activity: list[ActivityItem] = Field(description="Last 5-10 activities")

# ============================================================================
# Auth Schemas (for reference - managed by Better Auth)
# ============================================================================

class UserResponse(BaseModel):
    """Schema for user response"""
    id: str
    email: str
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
