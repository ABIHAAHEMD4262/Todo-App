# Tasks: Console Todo App

**Input**: Design documents from `/specs/console-app/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not included (Phase I uses manual testing per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow plan.md structure (3 Python files)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create src/ directory structure per implementation plan
- [X] T002 Create placeholder files: src/main.py, src/todo_manager.py, src/utils.py
- [X] T003 Verify UV project configuration in pyproject.toml (Python 3.13+)

**Checkpoint**: Project structure ready for implementation ✓

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and data structures that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement validate_title() function in src/utils.py (1-200 chars, UTF-8, trimmed)
- [X] T005 [P] Implement validate_description() function in src/utils.py (max 1000 chars, truncate with warning)
- [X] T006 [P] Implement validate_task_id() function in src/utils.py (numeric, positive, exists check)
- [X] T007 [P] Implement format_task_detail() function in src/utils.py (single task display with borders)
- [X] T008 [P] Implement format_task_list() function in src/utils.py (all tasks formatted)
- [X] T009 [P] Implement format_timestamp() function in src/utils.py (ISO 8601 to readable)
- [X] T010 Initialize global state in src/todo_manager.py (tasks list, next_id counter)
- [X] T011 Implement generate_next_id() helper in src/todo_manager.py (auto-increment, never reuse)
- [X] T012 Implement find_task_by_id() helper in src/todo_manager.py (lookup by ID)
- [X] T013 [P] Create display_menu() function in src/main.py (menu with 6 options)
- [X] T014 [P] Setup main loop structure in src/main.py (while loop, try-except, KeyboardInterrupt handling)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✓

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal**: User can add a new task with title and optional description

**Independent Test**:
1. Run app, select option 1
2. Enter title "Buy groceries", description "Milk and eggs"
3. Verify: Task #1 created message displayed
4. Select option 2 (View Tasks)
5. Verify: Task #1 shown with title, description, incomplete status

### Implementation for User Story 1

- [X] T015 [US1] Implement add_task() function in src/todo_manager.py (validate, create dict, append to list, return success message)
- [X] T016 [US1] Implement handle_add_task() function in src/main.py (prompt for title, prompt for description, call add_task, display result)
- [X] T017 [US1] Integrate handle_add_task() into main loop switch statement in src/main.py (option 1)
- [X] T018 [US1] Add timestamp generation using datetime.now().isoformat() in add_task()
- [X] T019 [US1] Handle description truncation warning display in handle_add_task()

**Checkpoint**: User Story 1 complete - can add tasks with title and description ✓

**Manual Test Cases (from spec.md US-1)**:
- ✓ Add task with title only
- ✓ Add task with title and description
- ✓ Add task with empty title → Error
- ✓ Add task with title > 200 chars → Error
- ✓ Add task with description > 1000 chars → Truncate with warning

---

## Phase 4: User Story 2 - View Task List (Priority: P1) 🎯 MVP

**Goal**: User can see all tasks with their details and status

**Independent Test**:
1. Add 2-3 tasks using US-1
2. Select option 2 (View Tasks)
3. Verify: All tasks displayed with ID, title, description, status ([✓] or [ ]), created timestamp
4. Mark one task complete (US-5)
5. View again, verify status indicator changed

### Implementation for User Story 2

- [X] T020 [US2] Implement get_tasks() function in src/todo_manager.py (return tasks sorted by ID)
- [X] T021 [US2] Implement handle_view_tasks() function in src/main.py (get tasks, format and display each, handle empty list)
- [X] T022 [US2] Integrate handle_view_tasks() into main loop in src/main.py (option 2)
- [X] T023 [US2] Add "No tasks found" message for empty list in handle_view_tasks()
- [X] T024 [US2] Format completion status indicators: [✓] for complete, [ ] for incomplete in format_task_detail()

**Checkpoint**: User Stories 1 AND 2 complete - can add and view tasks ✓

**Manual Test Cases (from spec.md US-2)**:
- ✓ View empty list → "No tasks found"
- ✓ View list with 1 task
- ✓ View list with multiple tasks
- ✓ View list with mix of completed/incomplete
- ✓ View list with long titles → proper formatting

---

## Phase 5: User Story 3 - Update Task (Priority: P2)

**Goal**: User can modify existing task's title and/or description

**Independent Test**:
1. Add a task using US-1
2. Note its ID and current title
3. Select option 3 (Update Task)
4. Enter task ID, new title "Updated title", new description
5. Verify: "Task #X updated successfully" message
6. View tasks (US-2), verify changes applied

### Implementation for User Story 3

- [X] T025 [US3] Implement update_task() function in src/todo_manager.py (find task, validate new values, update in place, return success)
- [X] T026 [US3] Implement handle_update_task() function in src/main.py (prompt for ID, validate, show current values, prompt for new title/description, call update_task)
- [X] T027 [US3] Integrate handle_update_task() into main loop in src/main.py (option 3)
- [X] T028 [US3] Add "press Enter to keep current" logic for optional updates in handle_update_task()
- [X] T029 [US3] Handle empty title validation (must not allow empty after update)

**Checkpoint**: User Stories 1, 2, AND 3 complete - can add, view, and update tasks ✓

**Manual Test Cases (from spec.md US-3)**:
- ✓ Update title of existing task
- ✓ Update description of existing task
- ✓ Update both title and description
- ✓ Update with invalid task ID → Error
- ✓ Update with empty title → Error
- ✓ Cancel update (Enter to keep) → No changes

---

## Phase 6: User Story 4 - Delete Task (Priority: P2)

**Goal**: User can permanently remove a task from the list with confirmation

**Independent Test**:
1. Add 3 tasks using US-1
2. Note the ID of task #2
3. Select option 4 (Delete Task)
4. Enter task ID #2, confirm with "yes"
5. Verify: "Task #2 deleted: [title]" message
6. View tasks (US-2), verify task #2 is gone, tasks #1 and #3 remain
7. Add new task, verify it gets ID #4 (not #2 - ID never reused)

### Implementation for User Story 4

- [X] T030 [US4] Implement delete_task() function in src/todo_manager.py (find task, remove from list, return success with title)
- [X] T031 [US4] Implement handle_delete_task() function in src/main.py (prompt for ID, validate, show task details, prompt for confirmation, call delete_task)
- [X] T032 [US4] Integrate handle_delete_task() into main loop in src/main.py (option 4)
- [X] T033 [US4] Add confirmation prompt (yes/no) before deletion in handle_delete_task()
- [X] T034 [US4] Handle "no" confirmation → cancel delete, no changes made

**Checkpoint**: User Stories 1, 2, 3, AND 4 complete - full CRUD except completion toggle ✓

**Manual Test Cases (from spec.md US-4)**:
- ✓ Delete existing task with confirmation → Task removed
- ✓ Delete task and cancel (no) → Task remains
- ✓ Delete with invalid task ID → Error
- ✓ Delete from empty list → Error
- ✓ Delete then try to view deleted task → Not found

---

## Phase 7: User Story 5 - Mark Complete/Incomplete (Priority: P1) 🎯 MVP

**Goal**: User can toggle task completion status to track progress

**Independent Test**:
1. Add 2 tasks using US-1
2. View tasks (US-2), verify both show [ ] Incomplete
3. Select option 5 (Mark Complete)
4. Enter task ID #1
5. Verify: "Task #1 marked as complete" message
6. View tasks, verify task #1 shows [✓] Complete
7. Select option 5 again, enter task ID #1
8. Verify: "Task #1 marked as incomplete" message
9. View tasks, verify task #1 shows [ ] Incomplete again

### Implementation for User Story 5

- [X] T035 [US5] Implement toggle_complete() function in src/todo_manager.py (find task, flip completed bool, return success with new status)
- [X] T036 [US5] Implement handle_toggle_complete() function in src/main.py (prompt for ID, validate, call toggle_complete, display result)
- [X] T037 [US5] Integrate handle_toggle_complete() into main loop in src/main.py (option 5)
- [X] T038 [US5] Display appropriate message: "marked as complete" or "marked as incomplete" based on new state

**Checkpoint**: ALL 5 user stories complete - full MVP functionality ready ✓

**Manual Test Cases (from spec.md US-5)**:
- ✓ Mark incomplete task as complete → Status = True, [✓]
- ✓ Mark complete task as incomplete → Status = False, [ ]
- ✓ Toggle status multiple times → Updates correctly
- ✓ Mark task with invalid ID → Error
- ✓ View task list after marking → Status displayed correctly

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, exit functionality, and final integration

- [X] T039 Implement handle_exit() function in src/main.py (display goodbye message, exit cleanly)
- [X] T040 Integrate handle_exit() into main loop in src/main.py (option 6)
- [X] T041 Add input validation for menu choice in main loop (must be 1-6, numeric only)
- [X] T042 Add error messages for invalid menu choices: "✗ Error: Invalid choice. Please select 1-6."
- [X] T043 Add error message formatting helpers in src/utils.py (✓ for success, ✗ for errors, ⚠ for warnings)
- [X] T044 Add exception handling in main loop for unexpected errors (catch-all, display friendly message, continue loop)
- [X] T045 Verify all error messages match spec.md format (user-friendly, not technical)
- [X] T046 Add docstrings to all functions (Google style, concise)
- [X] T047 Run PEP 8 compliance check (line length, naming conventions, spacing)
- [ ] T048 Final integration test: Run through demo script from spec.md (90-second flow)

**Checkpoint**: Application fully polished and ready for demo ✓

---

## Dependencies

### Story Dependencies (Execution Order)

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundational) ← BLOCKING
  ↓
Phase 3 (US-1: Add Task) 🎯 MVP
  ↓ (needed to test other features)
Phase 4 (US-2: View Tasks) 🎯 MVP
  ↓
Phases 5, 6, 7 can run in parallel:
  - Phase 5 (US-3: Update Task)
  - Phase 6 (US-4: Delete Task)
  - Phase 7 (US-5: Mark Complete) 🎯 MVP
  ↓
Phase 8 (Polish)
```

### Critical Path

**Minimum for MVP** (🎯 marked above):
1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US-1 (Add Task)
4. Phase 4: US-2 (View Tasks)
5. Phase 7: US-5 (Mark Complete)
6. Phase 8: Polish (T039-T042 for exit, T044 for error handling)

**Total MVP Tasks**: 14 setup/foundational + 5 (US-1) + 5 (US-2) + 4 (US-5) + 6 polish = **34 tasks**

**Full Feature Set**: All 48 tasks

### Independent Story Testing

Each user story phase includes an "Independent Test" section showing how to verify that story works on its own. This enables:
- ✅ Incremental delivery (ship US-1 and US-2 first, add others later)
- ✅ Parallel development (after foundational phase)
- ✅ Focused testing (test one feature at a time)

---

## Parallel Execution Examples

### After Phase 2 (Foundational) Complete:

**Group A** (US-1: Add Task):
- T015, T016, T017, T018, T019

**Group B** (US-2: View Tasks):
- T020, T021, T022, T023, T024

These can run in parallel IF two developers/agents working separately on different files.

### After Phase 4 Complete:

**Group C** (US-3, US-4, US-5 in parallel):
- T025-T029 (US-3: Update)
- T030-T034 (US-4: Delete)
- T035-T038 (US-5: Toggle)

Each group works on different functions in todo_manager.py and main.py - minimal conflicts.

### Phase 8 Polish Tasks:

**Parallel Set**:
- T043 (utils.py helpers)
- T046 (docstrings - can add to each file independently)
- T047 (PEP 8 check - read-only)

**Sequential**:
- T039-T042 (main loop changes)
- T044 (exception handling in main loop)
- T045 (verification pass)
- T048 (final integration test)

---

## Implementation Strategy

### MVP-First Approach (Recommended for Hackathon)

**Week 1**: MVP (34 tasks)
- Day 1: Phase 1-2 (Setup + Foundational) → 14 tasks
- Day 2: Phase 3-4 (US-1 Add, US-2 View) → 10 tasks
- Day 3: Phase 7 (US-5 Mark Complete) → 4 tasks
- Day 4: Phase 8 (Polish for MVP) → 6 tasks
- Day 5: Testing, demo video, submit Phase I

**Week 2** (Optional - after Phase I submission):
- Add US-3 (Update) → 5 tasks
- Add US-4 (Delete) → 5 tasks
- Final polish → remaining tasks

### Incremental Delivery

**Iteration 1**: Phases 1-4 → Can add and view tasks
**Iteration 2**: Add Phase 7 → Can mark tasks complete
**Iteration 3**: Add Phases 5-6 → Full CRUD
**Iteration 4**: Phase 8 → Production-ready

Each iteration delivers a working, testable application.

---

## Validation Checklist

Before marking tasks.md as complete, verify:

- [x] All tasks follow format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [x] Task IDs are sequential (T001-T048)
- [x] [P] markers added for parallelizable tasks (same files not modified concurrently)
- [x] [Story] markers for all user story phase tasks (US1-US5)
- [x] File paths included in all implementation tasks
- [x] All 5 user stories from spec.md covered
- [x] Dependencies clearly documented
- [x] Independent test criteria for each user story
- [x] MVP scope identified (34 tasks)
- [x] Parallel execution examples provided
- [x] Implementation strategy section included

---

## Summary

**Total Tasks**: 48
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 11 tasks
- **Phase 3 (US-1 Add Task)**: 5 tasks
- **Phase 4 (US-2 View Tasks)**: 5 tasks
- **Phase 5 (US-3 Update Task)**: 5 tasks
- **Phase 6 (US-4 Delete Task)**: 5 tasks
- **Phase 7 (US-5 Mark Complete)**: 4 tasks
- **Phase 8 (Polish)**: 10 tasks

**MVP Tasks**: 34 (Phases 1, 2, 3, 4, 7, partial 8)
**Full Feature**: 48 tasks

**Parallelization Opportunities**:
- 8 tasks in Phase 2 (T004-T009, T013-T014) marked [P]
- After foundational: US-1, US-2 can develop in parallel
- After US-2: US-3, US-4, US-5 can develop in parallel
- 3 tasks in Phase 8 marked [P]

**Independent Stories**: Each user story (Phase 3-7) has independent test criteria and can be verified separately

**Ready for**: Implementation via `/sp.implement`

---

**Generated**: 2025-12-28
**Status**: Complete ✅
**Next Command**: `/sp.implement` to generate code from these tasks
