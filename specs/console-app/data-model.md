# Data Model: Console Todo App

**Feature**: console-app | **Date**: 2025-12-28 | **Plan**: [plan.md](./plan.md)

## Overview

Phase I uses a simple in-memory data model with no persistence. Tasks are stored as Python dictionaries in a list, with a separate counter for ID generation.

## Core Entity: Task

### Structure

```python
Task = {
    "id": int,              # Unique identifier (auto-incremented, never reused)
    "title": str,           # Task title (required)
    "description": str,     # Task description (optional)
    "completed": bool,      # Completion status
    "created_at": str       # ISO 8601 timestamp
}
```

### Field Specifications

#### `id` (int)
- **Type**: Positive integer
- **Generation**: Auto-incremented starting from 1
- **Uniqueness**: Guaranteed unique for task lifetime
- **Immutability**: Never changes once assigned
- **Reuse Policy**: Never reused even after deletion (per clarification #4)
- **Example**: 1, 2, 3, 4... (continues incrementing even if task 2 is deleted)

#### `title` (str)
- **Type**: String (UTF-8 encoded)
- **Required**: Yes
- **Length**: 1-200 characters
- **Validation Rules**:
  - Cannot be empty string
  - Cannot be whitespace only
  - Leading/trailing whitespace automatically trimmed
  - Character count after trimming
- **Encoding**: UTF-8 (supports Unicode, emojis, international characters)
- **Examples**:
  - Valid: "Buy groceries", "🎯 Complete hackathon", "学习中文"
  - Invalid: "", "   ", "a" * 201

#### `description` (str)
- **Type**: String (UTF-8 encoded)
- **Required**: No (defaults to empty string "")
- **Length**: 0-1000 characters
- **Validation Rules**:
  - Empty string allowed (represents "no description")
  - Whitespace-only treated as empty (trimmed to "")
  - Leading/trailing whitespace automatically trimmed
  - **Overflow behavior**: If > 1000 chars, truncate to first 1000 chars with warning (per clarification #1)
- **Encoding**: UTF-8 (supports Unicode, emojis, international characters)
- **Examples**:
  - Valid: "", "Buy milk and eggs", "📝 Submit by Dec 7, 2025"
  - Truncated: (1001 char string → first 1000 chars + warning)

#### `completed` (bool)
- **Type**: Boolean
- **Required**: Yes (has default value)
- **Default**: `False` (new tasks are incomplete)
- **Allowed Values**: `True` or `False`
- **Toggleable**: Can be changed multiple times
- **Examples**: True, False

#### `created_at` (str)
- **Type**: String (ISO 8601 timestamp)
- **Format**: `YYYY-MM-DDTHH:MM:SS.ffffff` (Python isoformat)
- **Generation**: Automatically set when task is created
- **Immutability**: Never changes after creation (no "updated_at" in Phase I)
- **Timezone**: Local time (no timezone info needed for Phase I)
- **Examples**: "2025-12-28T15:30:00.123456", "2025-12-26T10:00:00.000000"

## Storage Model

### In-Memory Storage

```python
# Global state in todo_manager.py
tasks: list[dict] = []           # List of Task dictionaries
next_id: int = 1                 # ID counter (always increments)
```

### State Lifecycle

1. **Initialization**: Empty list, `next_id = 1`
2. **Add Task**: Append new task dict to list, increment `next_id`
3. **Update Task**: Find task by ID, modify in place
4. **Delete Task**: Remove task dict from list, `next_id` unchanged
5. **Mark Complete**: Find task by ID, toggle `completed` field
6. **Exit**: All data lost (in-memory only)

### ID Management

```python
def generate_next_id() -> int:
    """Generate next unique ID and increment counter."""
    global next_id
    current_id = next_id
    next_id += 1
    return current_id
```

**Key Property**: IDs are sequential but may have gaps after deletions
- Example: Tasks 1, 2, 3 exist → delete task 2 → next task gets ID 4 (not 2)

## Validation Rules

### Title Validation

```python
def validate_title(title: str) -> tuple[bool, str, str]:
    """
    Validate task title.

    Returns:
        (is_valid, cleaned_title, error_message)
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
```

### Description Validation

```python
def validate_description(description: str) -> tuple[bool, str, str]:
    """
    Validate task description.

    Returns:
        (is_valid, cleaned_description, warning_message)
    """
    # Trim whitespace
    cleaned = description.strip()

    # Check length and truncate if needed
    if len(cleaned) > 1000:
        truncated = cleaned[:1000]
        warning = "⚠ Description truncated to 1000 characters"
        return (True, truncated, warning)

    return (True, cleaned, "")
```

### Task ID Validation

```python
def validate_task_id(task_id_input: str, tasks: list[dict]) -> tuple[bool, int, str]:
    """
    Validate task ID input.

    Returns:
        (is_valid, task_id, error_message)
    """
    # Check if numeric
    try:
        task_id = int(task_id_input)
    except ValueError:
        return (False, 0, "Invalid input. Please enter a number.")

    # Check if positive
    if task_id < 1:
        return (False, 0, f"Task #{task_id} not found")

    # Check if exists
    task = find_task_by_id(task_id, tasks)
    if task is None:
        return (False, 0, f"Task #{task_id} not found")

    return (True, task_id, "")
```

## Data Constraints

### Invariants (Always True)

1. **ID Uniqueness**: No two tasks in the list have the same ID
2. **ID Positivity**: All task IDs are ≥ 1
3. **ID Ordering**: `next_id` is always greater than any existing task ID
4. **Title Non-Empty**: All tasks have non-empty titles (after trimming)
5. **Description Length**: All descriptions are ≤ 1000 characters
6. **Type Safety**: All fields match their declared types

### Allowed States

- **Empty List**: `tasks = []`, `next_id = 1` (valid initial state)
- **Mixed Completion**: Some tasks completed, some incomplete (valid)
- **Non-Sequential IDs**: IDs like [1, 3, 5] after deletions (valid)

### Forbidden States

- **Duplicate IDs**: Two tasks with same ID (NEVER allowed)
- **Empty Title**: Task with title="" or whitespace only (validation prevents)
- **Negative ID**: Task with ID ≤ 0 (generation prevents)
- **Oversized Description**: Description > 1000 chars (truncation prevents)

## Data Operations

### Create Task

```python
def add_task(title: str, description: str = "") -> tuple[bool, str, dict | None]:
    """
    Add a new task.

    Returns:
        (success, message, created_task)
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
```

### Read Task(s)

```python
def get_tasks() -> list[dict]:
    """Get all tasks (ordered by ID)."""
    return sorted(tasks, key=lambda t: t["id"])

def get_task_by_id(task_id: int) -> dict | None:
    """Get task by ID, returns None if not found."""
    for task in tasks:
        if task["id"] == task_id:
            return task
    return None
```

### Update Task

```python
def update_task(task_id: int, new_title: str | None = None,
                new_description: str | None = None) -> tuple[bool, str]:
    """
    Update task title and/or description.

    Returns:
        (success, message)
    """
    # Find task
    task = get_task_by_id(task_id)
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

    return (True, f"✓ Task #{task_id} updated successfully")
```

### Delete Task

```python
def delete_task(task_id: int) -> tuple[bool, str]:
    """
    Delete task by ID.

    Returns:
        (success, message)
    """
    task = get_task_by_id(task_id)
    if task is None:
        return (False, f"✗ Error: Task #{task_id} not found")

    title = task["title"]
    tasks.remove(task)

    return (True, f"✓ Task #{task_id} deleted: '{title}'")
```

### Toggle Completion

```python
def toggle_complete(task_id: int) -> tuple[bool, str]:
    """
    Toggle task completion status.

    Returns:
        (success, message)
    """
    task = get_task_by_id(task_id)
    if task is None:
        return (False, f"✗ Error: Task #{task_id} not found")

    task["completed"] = not task["completed"]
    status = "complete" if task["completed"] else "incomplete"

    return (True, f"✓ Task #{task_id} marked as {status}")
```

## Testing Considerations

### Test Data Examples

```python
# Valid task
{
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": False,
    "created_at": "2025-12-28T15:30:00.123456"
}

# Minimal task (no description)
{
    "id": 2,
    "title": "Call dentist",
    "description": "",
    "completed": False,
    "created_at": "2025-12-28T15:31:00.000000"
}

# Completed task with emoji
{
    "id": 3,
    "title": "🎯 Submit hackathon",
    "description": "Phase I console app",
    "completed": True,
    "created_at": "2025-12-26T10:00:00.000000"
}
```

### Edge Cases to Test

1. Empty list operations (view, delete, update)
2. Title exactly 200 characters
3. Description exactly 1000 characters
4. Description 1001 characters (truncation)
5. Unicode/emoji in title and description
6. Whitespace-only title (should error)
7. Whitespace-only description (should trim to "")
8. Non-existent task ID
9. Non-numeric task ID input
10. Toggle completion multiple times

---

**Status**: Complete
**Version**: 1.0.0
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
