"""
Task API Routes - Todo App Phase II
Referencing: @specs/features/task-crud.md, @specs/api/rest-endpoints.md
"""

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
from typing import List
from datetime import datetime

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