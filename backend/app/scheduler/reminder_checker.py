"""
Background Reminder Checker - Todo App Phase V
Periodically checks for due reminders and triggers notifications
"""

import asyncio
from datetime import datetime
from sqlmodel import Session, select, and_
from app.database import engine
from app.models import Reminder, Task
from app.events.producer import event_producer

# Check interval in seconds
CHECK_INTERVAL = 60  # Check every minute


class ReminderChecker:
    """Background task that checks for due reminders."""

    def __init__(self):
        self._running = False
        self._task = None

    async def start(self):
        """Start the reminder checker background task."""
        if self._running:
            return

        self._running = True
        self._task = asyncio.create_task(self._check_loop())
        print("[Reminder Checker] Started")

    async def stop(self):
        """Stop the reminder checker."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        print("[Reminder Checker] Stopped")

    async def _check_loop(self):
        """Main loop that periodically checks for due reminders."""
        while self._running:
            try:
                await self._check_due_reminders()
            except Exception as e:
                print(f"[Reminder Checker] Error: {e}")

            await asyncio.sleep(CHECK_INTERVAL)

    async def _check_due_reminders(self):
        """Check for due reminders and trigger notifications."""
        now = datetime.utcnow()

        with Session(engine) as session:
            # Find unsent reminders that are due
            statement = select(Reminder).where(
                and_(
                    Reminder.remind_at <= now,
                    Reminder.sent == False
                )
            )
            due_reminders = session.exec(statement).all()

            if not due_reminders:
                return

            print(f"[Reminder Checker] Found {len(due_reminders)} due reminders")

            for reminder in due_reminders:
                # Get task details
                task = session.get(Task, reminder.task_id)
                if not task:
                    # Task was deleted, clean up reminder
                    session.delete(reminder)
                    continue

                # Mark as sent
                reminder.sent = True
                reminder.sent_at = now
                session.add(reminder)

                # Publish Kafka event
                await event_producer.reminder_due(
                    user_id=reminder.user_id,
                    task_id=reminder.task_id,
                    title=task.title,
                    minutes_before=task.reminder_minutes or 0
                )

                print(f"[Reminder Checker] Triggered reminder for task: {task.title}")

            session.commit()


# Singleton instance
reminder_checker = ReminderChecker()
