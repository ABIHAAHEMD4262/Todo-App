"""
Utilities - Input Validation and Output Formatting
Helper functions for validation and display
"""

from datetime import datetime


def validate_title(title: str) -> tuple[bool, str, str]:
    """
    Validate task title.

    Args:
        title: Raw title input from user

    Returns:
        Tuple of (is_valid, cleaned_title, error_message)
    """
    # Trim whitespace
    cleaned = title.strip()

    # Check empty
    if not cleaned:
        return (False, "", "Title is required")

    # Check length
    if len(cleaned) > 200:
        return (False, "", "Title too long (max 200 characters)")

    return (True, cleaned, "")


def validate_description(description: str) -> tuple[bool, str, str]:
    """
    Validate task description.

    Args:
        description: Raw description input from user

    Returns:
        Tuple of (is_valid, cleaned_description, warning_message)
    """
    # Trim whitespace
    cleaned = description.strip()

    # Check length and truncate if needed
    if len(cleaned) > 1000:
        truncated = cleaned[:1000]
        warning = "⚠ Description truncated to 1000 characters"
        return (True, truncated, warning)

    return (True, cleaned, "")


def validate_task_id(task_id_input: str, tasks: list[dict]) -> tuple[bool, int, str]:
    """
    Validate task ID input.

    Args:
        task_id_input: Raw ID input from user
        tasks: List of task dictionaries to check existence

    Returns:
        Tuple of (is_valid, task_id, error_message)
    """
    # Check if numeric
    try:
        task_id = int(task_id_input)
    except ValueError:
        return (False, 0, "Invalid input. Please enter a number.")

    # Check if positive
    if task_id < 1:
        return (False, 0, f"Task #{task_id} not found")

    # Check if exists (will be validated by find_task_by_id in todo_manager)
    return (True, task_id, "")


def format_task_detail(task: dict) -> str:
    """
    Format a single task for display.

    Args:
        task: Task dictionary with id, title, description, completed, created_at

    Returns:
        Formatted string with borders
    """
    status_icon = "[✓]" if task["completed"] else "[ ]"
    status_text = "Complete" if task["completed"] else "Incomplete"

    # Format timestamp
    created_display = format_timestamp(task["created_at"])

    output = "=" * 46 + "\n"
    output += f"Task ID: {task['id']}\n"
    output += f"Title: {task['title']}\n"

    if task['description']:
        output += f"Description: {task['description']}\n"

    output += f"Status: {status_icon} {status_text}\n"
    output += f"Created: {created_display}\n"
    output += "=" * 46

    return output


def format_task_list(tasks: list[dict]) -> str:
    """
    Format all tasks for display.

    Args:
        tasks: List of task dictionaries

    Returns:
        Formatted string with all tasks
    """
    if not tasks:
        return "No tasks found"

    output = ""
    for task in tasks:
        output += format_task_detail(task) + "\n"

    output += f"\nTotal tasks: {len(tasks)}"

    return output


def format_timestamp(iso_timestamp: str) -> str:
    """
    Convert ISO 8601 timestamp to readable format.

    Args:
        iso_timestamp: ISO 8601 format string (e.g., "2025-12-28T15:30:00.123456")

    Returns:
        Readable format (e.g., "2025-12-28 15:30:00")
    """
    try:
        dt = datetime.fromisoformat(iso_timestamp)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        return iso_timestamp  # Return as-is if parsing fails
