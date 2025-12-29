"""
Todo Manager - Core CRUD Operations
Handles task storage and business logic
"""

from datetime import datetime
from utils import validate_title, validate_description

# Global state (in-memory storage)
tasks: list[dict] = []
next_id: int = 1


def generate_next_id() -> int:
    """
    Generate next unique ID and increment counter.

    Returns:
        Next available task ID
    """
    global next_id
    current_id = next_id
    next_id += 1
    return current_id


def find_task_by_id(task_id: int) -> dict | None:
    """
    Find task by ID.

    Args:
        task_id: Task ID to search for

    Returns:
        Task dictionary if found, None otherwise
    """
    for task in tasks:
        if task["id"] == task_id:
            return task
    return None


def add_task(title: str, description: str = "") -> tuple[bool, str, dict | None]:
    """
    Add a new task.

    Args:
        title: Task title (required)
        description: Task description (optional)

    Returns:
        Tuple of (success, message, created_task)
    """
    # Validate title
    is_valid, cleaned_title, error = validate_title(title)
    if not is_valid:
        return (False, f"✗ Error: {error}", None)

    # Validate description
    is_valid, cleaned_desc, warning = validate_description(description)

    # Create task
    task = {
        "id": generate_next_id(),
        "title": cleaned_title,
        "description": cleaned_desc,
        "completed": False,
        "created_at": datetime.now().isoformat()
    }

    # Add to list
    tasks.append(task)

    # Build message
    msg = f"✓ Task #{task['id']} created: '{task['title']}'"
    if warning:
        msg += f"\n{warning}"

    return (True, msg, task)


def get_tasks() -> list[dict]:
    """
    Get all tasks sorted by ID.

    Returns:
        List of task dictionaries in creation order
    """
    return sorted(tasks, key=lambda t: t["id"])


def update_task(task_id: int, new_title: str | None = None,
                new_description: str | None = None) -> tuple[bool, str]:
    """
    Update task title and/or description.

    Args:
        task_id: ID of task to update
        new_title: New title (None = no change)
        new_description: New description (None = no change)

    Returns:
        Tuple of (success, message)
    """
    # Find task
    task = find_task_by_id(task_id)
    if task is None:
        return (False, f"✗ Error: Task #{task_id} not found")

    # Update title if provided
    if new_title is not None:
        is_valid, cleaned_title, error = validate_title(new_title)
        if not is_valid:
            return (False, f"✗ Error: {error}")
        task["title"] = cleaned_title

    # Update description if provided
    if new_description is not None:
        is_valid, cleaned_desc, warning = validate_description(new_description)
        task["description"] = cleaned_desc
        if warning:
            return (True, f"✓ Task #{task_id} updated successfully\n{warning}")

    return (True, f"✓ Task #{task_id} updated successfully")


def delete_task(task_id: int) -> tuple[bool, str]:
    """
    Delete task by ID.

    Args:
        task_id: ID of task to delete

    Returns:
        Tuple of (success, message)
    """
    task = find_task_by_id(task_id)
    if task is None:
        return (False, f"✗ Error: Task #{task_id} not found")

    title = task["title"]
    tasks.remove(task)

    return (True, f"✓ Task #{task_id} deleted: '{title}'")


def toggle_complete(task_id: int) -> tuple[bool, str]:
    """
    Toggle task completion status.

    Args:
        task_id: ID of task to toggle

    Returns:
        Tuple of (success, message)
    """
    task = find_task_by_id(task_id)
    if task is None:
        return (False, f"✗ Error: Task #{task_id} not found")

    task["completed"] = not task["completed"]
    status = "complete" if task["completed"] else "incomplete"

    return (True, f"✓ Task #{task_id} marked as {status}")
