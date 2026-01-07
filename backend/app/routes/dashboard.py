"""
Dashboard API Routes - Todo App Phase II
Referencing: @specs/features/dashboard.md, @specs/api/rest-endpoints.md
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Task
from app.schemas import DashboardStatsResponse, ActivityItem
from typing import List
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/{user_id}/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get dashboard statistics for the user."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get all tasks for the user
    all_tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

    total_tasks = len(all_tasks)
    completed_tasks = len([task for task in all_tasks if task.completed])
    pending_tasks = total_tasks - completed_tasks
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Get recent activity (last 10 tasks)
    recent_tasks = sorted(all_tasks, key=lambda x: x.updated_at, reverse=True)[:10]
    recent_activity = []
    for task in recent_tasks:
        action = "completed" if task.completed and task.created_at != task.updated_at else "updated"
        if task.created_at == task.updated_at:
            action = "created"

        recent_activity.append(
            ActivityItem(
                task_id=task.id,
                task_title=task.title,
                action=action,
                timestamp=task.updated_at
            )
        )

    return DashboardStatsResponse(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        completed_tasks=completed_tasks,
        completion_rate=completion_rate,
        recent_activity=recent_activity
    )