# Phase I: Console Todo App - Specification

**Feature**: In-Memory Console Todo Application
**Phase**: I
**Due Date**: December 7, 2025
**Points**: 100

---

## Overview

A command-line interface (CLI) todo application that allows users to manage tasks stored in memory. The application provides basic CRUD operations through an interactive menu system.

---

## Clarifications

### Session 2025-12-28

- Q: When description exceeds 1000 chars, should it error or truncate? → A: Truncate with warning - Save first 1000 chars, display "⚠ Description truncated to 1000 characters"
- Q: Should the app include logging or debugging infrastructure? → A: No logging - Console app only, use print statements for debugging during development, no formal logging needed
- Q: Should the app support Unicode characters and emojis in titles/descriptions? → A: UTF-8 (full Unicode support) - Support all Unicode characters including emojis, international characters, symbols
- Q: When a task is deleted, should the next new task reuse the deleted ID or continue incrementing? → A: Never reuse - IDs are unique lifetime identifiers, continue incrementing even after deletions
- Q: Should updating a task require confirmation before saving changes? → A: No confirmation - Save changes immediately after user enters new values (non-destructive operation, faster workflow)

---

## User Stories

### US-1: Add Task
**As a** user
**I want to** add a new task to my todo list
**So that** I can track things I need to do

**Acceptance Criteria:**
- User can enter a task title (required, 1-200 characters)
- User can optionally enter a task description (max 1000 characters)
- Task is automatically assigned a unique ID
- Task is created with `completed` status as `False`
- Task includes creation timestamp
- System displays confirmation message with task ID and title

**Test Cases:**
1. Add task with title only → Task created successfully
2. Add task with title and description → Both saved correctly
3. Add task with empty title → Error: "Title is required"
4. Add task with title > 200 chars → Error: "Title too long (max 200 characters)"
5. Add task with description > 1000 chars → Truncate to 1000 chars with warning: "⚠ Description truncated to 1000 characters"

---

### US-2: View Task List
**As a** user
**I want to** see all my tasks
**So that** I know what I need to do

**Acceptance Criteria:**
- Display all tasks in a formatted list
- Show task ID, title, completion status, and creation date
- Mark completed tasks clearly (e.g., [✓] or [X])
- Display "No tasks found" when list is empty
- Tasks sorted by ID (creation order)

**Test Cases:**
1. View empty list → "No tasks found"
2. View list with 1 task → Task displayed correctly
3. View list with multiple tasks → All tasks shown in order
4. View list with mix of completed/incomplete → Status indicators clear
5. View list with long titles → Proper formatting/wrapping

---

### US-3: Update Task
**As a** user
**I want to** modify an existing task
**So that** I can correct mistakes or update details

**Acceptance Criteria:**
- User selects task by ID
- User can update title and/or description
- Original values shown as defaults/suggestions
- Changes are saved immediately (no confirmation prompt required)
- Confirmation message displayed after successful update
- Non-existent task ID shows error message

**Test Cases:**
1. Update title of existing task → Title changed successfully
2. Update description of existing task → Description changed
3. Update both title and description → Both updated
4. Update with invalid task ID → Error: "Task not found"
5. Update with empty title → Error: "Title cannot be empty"
6. Cancel update → No changes made

---

### US-4: Delete Task
**As a** user
**I want to** remove a task from my list
**So that** I can clean up completed or irrelevant tasks

**Acceptance Criteria:**
- User selects task by ID to delete
- Confirmation prompt before deletion
- Task is permanently removed from list
- Confirmation message shown
- Attempting to delete non-existent task shows error

**Test Cases:**
1. Delete existing task with confirmation → Task removed
2. Delete task and cancel → Task remains
3. Delete with invalid task ID → Error: "Task not found"
4. Delete from empty list → Error: "No tasks to delete"
5. Delete then try to view deleted task → Task not found

---

### US-5: Mark as Complete/Incomplete
**As a** user
**I want to** toggle the completion status of a task
**So that** I can track my progress

**Acceptance Criteria:**
- User selects task by ID
- Task completion status toggles (True ↔ False)
- Confirmation message shows new status
- Task list reflects updated status
- Invalid task ID shows error message

**Test Cases:**
1. Mark incomplete task as complete → Status = True, indicator shows [✓]
2. Mark complete task as incomplete → Status = False, indicator shows [ ]
3. Toggle status multiple times → Status updates correctly each time
4. Mark task with invalid ID → Error: "Task not found"
5. View task list after marking complete → Status displayed correctly

---

## Data Model

```python
Task = {
    "id": int,              # Auto-incremented, starts at 1, never reused (unique lifetime identifier)
    "title": str,           # Required, 1-200 characters
    "description": str,     # Optional, max 1000 characters, default: ""
    "completed": bool,      # Default: False
    "created_at": str       # ISO 8601 format: "2025-12-26T15:30:00"
}

# In-memory storage
tasks: List[Task] = []
next_id: int = 1           # Always increments, never resets or reuses deleted IDs
```

---

## Interface Requirements

### Menu System

```
==============================================
        TODO APP - PHASE I
==============================================

1. Add New Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete/Incomplete
6. Exit

Enter your choice (1-6): _
```

### Input Validation

- **Title**:
  - Required (cannot be empty or whitespace only)
  - Length: 1-200 characters
  - Trimmed of leading/trailing whitespace
  - UTF-8 encoding (supports Unicode, emojis, international characters)

- **Description**:
  - Optional
  - Max 1000 characters (automatically truncated with warning if exceeded)
  - Trimmed of leading/trailing whitespace
  - UTF-8 encoding (supports Unicode, emojis, international characters)

- **Task ID**:
  - Must be a positive integer
  - Must exist in the task list
  - Handle non-numeric input gracefully

- **Menu Choice**:
  - Must be integer 1-6
  - Invalid input shows error and re-prompts

### Output Formatting

#### Task List Display:
```
==============================================
Task ID: 1
Title: Buy groceries
Description: Milk, eggs, bread, vegetables
Status: [ ] Incomplete
Created: 2025-12-26 15:30:00
==============================================
Task ID: 2
Title: Submit hackathon
Description: Complete Phase I by Dec 7
Status: [✓] Complete
Created: 2025-12-25 10:15:00
==============================================
```

#### Success Messages:
- Add: "✓ Task #1 created: 'Buy groceries'"
- Update: "✓ Task #1 updated successfully"
- Delete: "✓ Task #1 deleted: 'Buy groceries'"
- Complete: "✓ Task #1 marked as complete"
- Incomplete: "✓ Task #1 marked as incomplete"

#### Error Messages:
- "✗ Error: Title is required"
- "✗ Error: Title too long (max 200 characters)"
- "✗ Error: Task #5 not found"
- "✗ Error: Invalid input. Please enter a number."
- "✗ Error: Invalid choice. Please select 1-6."

---

## Non-Functional Requirements

### Performance
- All operations complete in < 100ms
- Support up to 1000 tasks without performance degradation
- Instant response to user input

### Usability
- Clear, intuitive menu system
- Helpful error messages (user-friendly, not technical)
- Consistent formatting throughout
- Easy to understand prompts

### Reliability
- No crashes or unhandled exceptions
- Graceful error handling for all edge cases
- Data integrity maintained during operations
- Safe exit (no data corruption)

### Observability
- No formal logging infrastructure (Phase I simplicity)
- Error messages displayed directly to console
- Debug with print statements during development only

### Code Quality
- Follow PEP 8 style guide
- Functions < 50 lines
- Descriptive variable names
- Minimal comments (self-documenting code)
- No hardcoded values (use constants)

---

## Constraints

### In Scope
- ✅ In-memory storage (data lost on exit)
- ✅ Single-user (no authentication)
- ✅ Command-line interface only
- ✅ 5 basic CRUD operations
- ✅ Basic input validation

### Out of Scope (Phase II+)
- ❌ Data persistence (database, file storage)
- ❌ Multi-user support
- ❌ Authentication/authorization
- ❌ Advanced features (search, filter, sort, tags, priorities)
- ❌ Due dates or reminders
- ❌ Recurring tasks
- ❌ Export/import functionality

---

## Edge Cases to Handle

1. **Empty Input**: User presses Enter without typing anything
2. **Whitespace Only**: User enters only spaces/tabs
3. **Very Long Input**: Title/description exceeding limits
4. **Special Characters**: Unicode, emojis, symbols in text (UTF-8 fully supported - accept and display correctly)
5. **Invalid Task ID**: Non-existent ID, negative numbers, non-numeric
6. **Empty Task List**: Operations on empty list
7. **Rapid Operations**: Multiple quick operations in sequence
8. **Menu Navigation**: Invalid menu choices, non-numeric input

---

## Success Criteria

### Minimum Viable Product (MVP):
- [ ] All 5 user stories implemented and working
- [ ] Input validation prevents invalid data
- [ ] Error messages are clear and helpful
- [ ] Menu system is intuitive
- [ ] No crashes or unhandled exceptions
- [ ] Code follows PEP 8 and Constitution standards
- [ ] Demo video shows all 5 features working

### Quality Gates:
- [ ] Manual testing of all test cases passes
- [ ] Edge cases handled gracefully
- [ ] Code is clean and readable
- [ ] README includes setup and usage instructions
- [ ] Submitted before December 7, 2025

---

## Demo Script (for 90-second video)

1. **Launch app** (5 sec): Show menu
2. **Add 2 tasks** (15 sec): One with description, one without
3. **View list** (10 sec): Show both tasks
4. **Mark one complete** (10 sec): Toggle status
5. **Update task** (15 sec): Edit title/description
6. **View updated list** (10 sec): Show changes
7. **Delete task** (10 sec): With confirmation
8. **Final view** (10 sec): Show remaining task
9. **Exit** (5 sec): Clean exit

**Total**: 90 seconds

---

## Dependencies

- **Python**: 3.13+
- **Libraries**: None (standard library only)
- **Tools**: UV (package manager)

---

## Deliverables

1. **Source Code**:
   - `src/main.py` - Entry point and menu system
   - `src/todo_manager.py` - Core CRUD operations
   - `src/utils.py` - Helper functions (validation, formatting)

2. **Documentation**:
   - `README.md` - Setup instructions and usage guide
   - `specs/console-app/spec.md` - This file
   - `specs/console-app/plan.md` - Architecture plan (next step)
   - `specs/console-app/tasks.md` - Implementation tasks (after plan)

3. **Submission**:
   - GitHub repository link
   - Demo video (< 90 seconds)
   - Working console application

---

## Approval Checklist

Before proceeding to planning phase:
- [ ] All user stories are clear and testable
- [ ] Acceptance criteria are specific and measurable
- [ ] Data model is well-defined
- [ ] Interface requirements are detailed
- [ ] Edge cases are identified
- [ ] Success criteria are explicit
- [ ] Scope is appropriate for Phase I

---

**Version**: 1.0.0
**Created**: 2025-12-26
**Last Updated**: 2025-12-26
**Status**: Ready for Planning
