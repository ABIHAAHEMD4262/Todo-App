"""
Reminders API Routes - Todo App Phase V
Full notification system with background checking
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, and_
from app.database import get_session
from app.auth import get_current_user
from app.models import User, Task, Reminder
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


# ============================================================================
# Schemas
# ============================================================================

class ReminderResponse(BaseModel):
    id: int
    task_id: int
    task_title: str
    remind_at: datetime
    sent: bool
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ReminderListResponse(BaseModel):
    reminders: list[ReminderResponse]
    total: int
    unread_count: int


# ============================================================================
# List Reminders (Upcoming & Past)
# ============================================================================

@router.get("/{user_id}/reminders", response_model=ReminderListResponse)
async def list_reminders(
    user_id: str,
    status: str = Query("all", pattern="^(all|pending|sent|unread)$"),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List reminders for user.

    Status filters:
    - all: All reminders
    - pending: Not yet sent (remind_at in future)
    - sent: Already triggered
    - unread: Sent but not read by user
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    statement = select(Reminder).where(Reminder.user_id == user_id)

    if status == "pending":
        statement = statement.where(Reminder.sent == False)
    elif status == "sent":
        statement = statement.where(Reminder.sent == True)
    elif status == "unread":
        statement = statement.where(
            and_(Reminder.sent == True, Reminder.read == False)
        )

    statement = statement.order_by(Reminder.remind_at.desc()).limit(limit)
    reminders = session.exec(statement).all()

    # Get task titles
    reminder_responses = []
    for reminder in reminders:
        task = session.get(Task, reminder.task_id)
        task_title = task.title if task else "Task deleted"

        reminder_responses.append(ReminderResponse(
            id=reminder.id,
            task_id=reminder.task_id,
            task_title=task_title,
            remind_at=reminder.remind_at,
            sent=reminder.sent,
            read=reminder.read,
            created_at=reminder.created_at
        ))

    # Count unread
    unread_count = session.exec(
        select(Reminder).where(
            and_(
                Reminder.user_id == user_id,
                Reminder.sent == True,
                Reminder.read == False
            )
        )
    ).all()

    return ReminderListResponse(
        reminders=reminder_responses,
        total=len(reminder_responses),
        unread_count=len(unread_count)
    )


# ============================================================================
# Get Due Reminders (for polling)
# ============================================================================

@router.get("/{user_id}/reminders/due", response_model=ReminderListResponse)
async def get_due_reminders(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get reminders that are due (remind_at <= now and not read).
    Used by frontend for real-time notifications.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    now = datetime.utcnow()

    # Get due reminders that haven't been read
    statement = select(Reminder).where(
        and_(
            Reminder.user_id == user_id,
            Reminder.remind_at <= now,
            Reminder.read == False
        )
    ).order_by(Reminder.remind_at.desc())

    reminders = session.exec(statement).all()

    # Mark as sent if not already
    for reminder in reminders:
        if not reminder.sent:
            reminder.sent = True
            reminder.sent_at = now
            session.add(reminder)
    session.commit()

    # Build response
    reminder_responses = []
    for reminder in reminders:
        task = session.get(Task, reminder.task_id)
        task_title = task.title if task else "Task deleted"

        reminder_responses.append(ReminderResponse(
            id=reminder.id,
            task_id=reminder.task_id,
            task_title=task_title,
            remind_at=reminder.remind_at,
            sent=reminder.sent,
            read=reminder.read,
            created_at=reminder.created_at
        ))

    return ReminderListResponse(
        reminders=reminder_responses,
        total=len(reminder_responses),
        unread_count=len(reminder_responses)
    )


# ============================================================================
# Mark Reminder as Read
# ============================================================================

@router.patch("/{user_id}/reminders/{reminder_id}/read")
async def mark_reminder_read(
    user_id: str,
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Mark a reminder as read."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    reminder = session.exec(
        select(Reminder).where(
            and_(Reminder.id == reminder_id, Reminder.user_id == user_id)
        )
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.read = True
    session.add(reminder)
    session.commit()

    return {"status": "ok", "message": "Reminder marked as read"}


# ============================================================================
# Mark All Reminders as Read
# ============================================================================

@router.patch("/{user_id}/reminders/read-all")
async def mark_all_reminders_read(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Mark all reminders as read."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    reminders = session.exec(
        select(Reminder).where(
            and_(
                Reminder.user_id == user_id,
                Reminder.read == False
            )
        )
    ).all()

    for reminder in reminders:
        reminder.read = True
        session.add(reminder)

    session.commit()

    return {"status": "ok", "message": f"Marked {len(reminders)} reminders as read"}


# ============================================================================
# Delete Reminder
# ============================================================================

@router.delete("/{user_id}/reminders/{reminder_id}", status_code=204)
async def delete_reminder(
    user_id: str,
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a reminder."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    reminder = session.exec(
        select(Reminder).where(
            and_(Reminder.id == reminder_id, Reminder.user_id == user_id)
        )
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    session.delete(reminder)
    session.commit()
