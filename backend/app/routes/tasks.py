"""
Task API Routes - Todo App Phase V
Referencing: @specs/phase5-advanced-cloud/spec.md
Task: 5.3.1 - 5.3.6
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, or_, and_
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Task, Tag, TaskTag, Reminder
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TagResponse,
    Priority,
    RecurrencePattern
)
from typing import Optional
from datetime import datetime, timedelta
from app.events.producer import event_producer

router = APIRouter()


# ============================================================================
# Helper Functions
# ============================================================================

def get_task_with_tags(task: Task, session: Session) -> TaskResponse:
    """Helper to convert Task to TaskResponse with tags."""
    tags = []
    if task.task_tags:
        for task_tag in task.task_tags:
            tag = session.get(Tag, task_tag.tag_id)
            if tag:
                tags.append(TagResponse(id=tag.id, name=tag.name, color=tag.color))

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
        due_date=task.due_date,
        reminder_minutes=task.reminder_minutes,
        priority=task.priority,
        is_recurring=task.is_recurring,
        recurrence_pattern=task.recurrence_pattern,
        recurrence_interval=task.recurrence_interval,
        recurrence_end_date=task.recurrence_end_date,
        parent_task_id=task.parent_task_id,
        tags=tags
    )


def create_next_recurring_task(task: Task, session: Session) -> Optional[Task]:
    """
    Create the next occurrence of a recurring task.
    Task: 5.3.4 - Recurring task creation on complete
    """
    if not task.is_recurring or not task.recurrence_pattern:
        return None

    if not task.due_date:
        return None

    # Calculate next due date based on pattern
    next_due = task.due_date
    pattern = task.recurrence_pattern

    if pattern == "daily":
        next_due = task.due_date + timedelta(days=1)
    elif pattern == "weekly":
        next_due = task.due_date + timedelta(weeks=1)
    elif pattern == "monthly":
        next_due = task.due_date + timedelta(days=30)
    elif pattern == "yearly":
        next_due = task.due_date + timedelta(days=365)
    elif pattern == "custom" and task.recurrence_interval:
        next_due = task.due_date + timedelta(days=task.recurrence_interval)

    # Check if past end date
    if task.recurrence_end_date and next_due > task.recurrence_end_date:
        return None

    # Create new task
    new_task = Task(
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=False,
        due_date=next_due,
        reminder_minutes=task.reminder_minutes,
        priority=task.priority,
        is_recurring=True,
        recurrence_pattern=task.recurrence_pattern,
        recurrence_interval=task.recurrence_interval,
        recurrence_end_date=task.recurrence_end_date,
        parent_task_id=task.id
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    # Copy tags to new task
    if task.task_tags:
        for task_tag in task.task_tags:
            new_task_tag = TaskTag(task_id=new_task.id, tag_id=task_tag.tag_id)
            session.add(new_task_tag)
        session.commit()

    # Create reminder for new task
    if new_task.due_date and new_task.reminder_minutes:
        remind_at = new_task.due_date - timedelta(minutes=new_task.reminder_minutes)
        reminder = Reminder(
            user_id=new_task.user_id,
            task_id=new_task.id,
            remind_at=remind_at
        )
        session.add(reminder)
        session.commit()

    return new_task


# ============================================================================
# Task 5.3.1: List Tasks with Filtering, Sorting, Search
# ============================================================================

@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status: str = Query("all", pattern="^(all|pending|completed|overdue)$"),
    priority: Optional[str] = Query(None, pattern="^(none|low|medium|high|urgent)$"),
    tag_ids: Optional[str] = Query(None, description="Comma-separated tag IDs"),
    due_from: Optional[datetime] = Query(None),
    due_to: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None, max_length=200),
    sort_by: str = Query("created_at", pattern="^(created_at|due_date|priority|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tasks for user with filtering, searching, and sorting.

    Phase 5 Features:
    - Filter by status (all, pending, completed, overdue)
    - Filter by priority (none, low, medium, high, urgent)
    - Filter by tags (comma-separated IDs)
    - Filter by due date range
    - Search by keyword in title/description
    - Sort by various fields
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build base query
    statement = select(Task).where(Task.user_id == user_id)

    # Status filter
    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)
    elif status == "overdue":
        statement = statement.where(
            and_(
                Task.completed == False,
                Task.due_date < datetime.utcnow(),
                Task.due_date.isnot(None)
            )
        )

    # Priority filter
    if priority:
        statement = statement.where(Task.priority == priority)

    # Due date range filter
    if due_from:
        statement = statement.where(Task.due_date >= due_from)
    if due_to:
        statement = statement.where(Task.due_date <= due_to)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Sorting
    sort_column = getattr(Task, sort_by)
    if sort_order == "desc":
        statement = statement.order_by(sort_column.desc())
    else:
        statement = statement.order_by(sort_column.asc())

    # Execute query
    tasks = session.exec(statement).all()

    # Filter by tags (post-query due to many-to-many)
    if tag_ids:
        tag_id_list = [int(tid.strip()) for tid in tag_ids.split(",") if tid.strip()]
        if tag_id_list:
            filtered_tasks = []
            for task in tasks:
                task_tag_ids = [tt.tag_id for tt in task.task_tags] if task.task_tags else []
                if any(tid in task_tag_ids for tid in tag_id_list):
                    filtered_tasks.append(task)
            tasks = filtered_tasks

    # Convert to response with tags
    task_responses = [get_task_with_tags(task, session) for task in tasks]

    return TaskListResponse(tasks=task_responses, total=len(task_responses))


# ============================================================================
# Task 5.3.6: Search Endpoint
# ============================================================================

@router.get("/{user_id}/tasks/search", response_model=TaskListResponse)
async def search_tasks(
    user_id: str,
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Search tasks by keyword in title and description."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    search_pattern = f"%{q}%"
    statement = select(Task).where(
        and_(
            Task.user_id == user_id,
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )
    ).order_by(Task.created_at.desc())

    tasks = session.exec(statement).all()
    task_responses = [get_task_with_tags(task, session) for task in tasks]

    return TaskListResponse(tasks=task_responses, total=len(task_responses))


# ============================================================================
# Task 5.3.2: Create Task with Phase 5 Features
# ============================================================================

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new task with Phase 5 features.

    Supports:
    - Due dates and reminders
    - Priorities
    - Recurring tasks
    - Tags
    """
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Create task with Phase 5 fields
    task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else None,
        due_date=task_data.due_date,
        reminder_minutes=task_data.reminder_minutes,
        priority=task_data.priority.value if task_data.priority else "none",
        is_recurring=task_data.is_recurring,
        recurrence_pattern=task_data.recurrence_pattern.value if task_data.recurrence_pattern else None,
        recurrence_interval=task_data.recurrence_interval,
        recurrence_end_date=task_data.recurrence_end_date
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    # Add tags if provided
    if task_data.tag_ids:
        for tag_id in task_data.tag_ids:
            # Verify tag exists and belongs to user
            tag = session.exec(
                select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
            ).first()
            if tag:
                task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                session.add(task_tag)
        session.commit()
        session.refresh(task)

    # Create reminder if due_date and reminder_minutes are set
    if task.due_date and task.reminder_minutes:
        remind_at = task.due_date - timedelta(minutes=task.reminder_minutes)
        reminder = Reminder(
            user_id=user_id,
            task_id=task.id,
            remind_at=remind_at
        )
        session.add(reminder)
        session.commit()

    # Publish Kafka event
    await event_producer.task_created(user_id, task.id, task.title, task.priority)

    return get_task_with_tags(task, session)


# ============================================================================
# Get Single Task
# ============================================================================

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a single task by ID."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return get_task_with_tags(task, session)


# ============================================================================
# Task 5.3.3: Update Task with Phase 5 Features
# ============================================================================

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a task with Phase 5 features."""
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get task
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update basic fields
    if task_data.title is not None:
        task.title = task_data.title.strip()
    if task_data.description is not None:
        task.description = task_data.description.strip() if task_data.description else None
    if task_data.completed is not None:
        task.completed = task_data.completed

    # Update Phase 5 fields
    if task_data.due_date is not None:
        task.due_date = task_data.due_date
    if task_data.reminder_minutes is not None:
        task.reminder_minutes = task_data.reminder_minutes
    if task_data.priority is not None:
        task.priority = task_data.priority.value
    if task_data.is_recurring is not None:
        task.is_recurring = task_data.is_recurring
    if task_data.recurrence_pattern is not None:
        task.recurrence_pattern = task_data.recurrence_pattern.value
    if task_data.recurrence_interval is not None:
        task.recurrence_interval = task_data.recurrence_interval
    if task_data.recurrence_end_date is not None:
        task.recurrence_end_date = task_data.recurrence_end_date

    task.updated_at = datetime.utcnow()

    # Update tags if provided
    if task_data.tag_ids is not None:
        # Remove existing tags
        existing_task_tags = session.exec(
            select(TaskTag).where(TaskTag.task_id == task_id)
        ).all()
        for tt in existing_task_tags:
            session.delete(tt)
        session.commit()

        # Add new tags
        for tag_id in task_data.tag_ids:
            tag = session.exec(
                select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
            ).first()
            if tag:
                task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                session.add(task_tag)

    session.add(task)
    session.commit()
    session.refresh(task)

    # Update reminder if due_date changed
    if task_data.due_date is not None or task_data.reminder_minutes is not None:
        # Delete existing unsent reminder
        existing_reminder = session.exec(
            select(Reminder).where(Reminder.task_id == task_id, Reminder.sent == False)
        ).first()
        if existing_reminder:
            session.delete(existing_reminder)
            session.commit()

        # Create new reminder if applicable
        if task.due_date and task.reminder_minutes:
            remind_at = task.due_date - timedelta(minutes=task.reminder_minutes)
            reminder = Reminder(
                user_id=user_id,
                task_id=task.id,
                remind_at=remind_at
            )
            session.add(reminder)
            session.commit()

    # Publish Kafka event
    await event_producer.task_updated(user_id, task_id, {"title": task.title, "completed": task.completed})

    return get_task_with_tags(task, session)


# ============================================================================
# Delete Task
# ============================================================================

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

    # Publish Kafka event before deletion
    await event_producer.task_deleted(user_id, task_id)

    session.delete(task)
    session.commit()


# ============================================================================
# Task 5.3.4: Toggle Complete with Recurring Task Support
# ============================================================================

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle task completion status.

    Phase 5: If task is recurring and being marked complete,
    automatically creates the next occurrence.
    """
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
    was_incomplete = not task.completed
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # Phase 5: Create next recurring task if completing a recurring task
    if was_incomplete and task.completed and task.is_recurring:
        create_next_recurring_task(task, session)

    # Publish Kafka event for completion
    if task.completed:
        await event_producer.task_completed(user_id, task_id, task.title, task.is_recurring)

    return get_task_with_tags(task, session)
