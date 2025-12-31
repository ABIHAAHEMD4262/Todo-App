"""
Pydantic Schemas - Todo App Phase II
Referencing: @specs/api/rest-endpoints.md, @backend/CLAUDE.md
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

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
    """Schema for creating a new task"""
    pass

class TaskUpdate(BaseModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200
    )
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    """Schema for task response"""
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskListResponse(BaseModel):
    """Schema for list of tasks"""
    tasks: list[TaskResponse]
    total: int

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
