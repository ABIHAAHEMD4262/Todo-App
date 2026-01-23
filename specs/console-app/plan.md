# Implementation Plan: Console Todo App

**Branch**: `master` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/console-app/spec.md`

## Summary

Build an in-memory CLI todo application supporting 5 core CRUD operations (Add, View, Update, Delete, Mark Complete). The application uses Python 3.13+ with no external dependencies, storing tasks in memory as dictionaries. User interaction occurs through a numbered menu system with input validation and UTF-8 encoding support.

**Technical Approach**: Single Python module architecture with three files (main.py for CLI/menu, todo_manager.py for business logic, utils.py for validation/formatting). In-memory storage using Python lists and a simple ID counter. No persistence layer required for Phase I.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (Python standard library only)
**Storage**: In-memory (Python list of dict objects)
**Testing**: Manual testing (Phase I), pytest (Phase II+)
**Target Platform**: Windows/Linux/macOS console
**Project Type**: Single project (CLI application)
**Performance Goals**: <100ms per operation, support 1000 tasks
**Constraints**: In-memory only (data lost on exit), single-user, CLI-only interface
**Scale/Scope**: 5 features, ~300 lines of code, 3 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Spec-Driven Development (Principle I)
- [x] Spec exists: `specs/console-app/spec.md` (✓ 360+ lines, comprehensive)
- [x] Clarifications completed: 5 critical questions answered (Session 2025-12-28)
- [x] Plan in progress (this file)
- [ ] Tasks to be generated next (`/sp.tasks`)
- [ ] Implementation via `/sp.implement` (no manual coding)

**STATUS**: ✅ COMPLIANT - Following SDD workflow correctly

### ✅ In-Memory First (Principle II)
- [x] Phase I uses in-memory storage (Python lists/dicts)
- [x] No database dependencies
- [x] Data lost on exit (acceptable for Phase I)

**STATUS**: ✅ COMPLIANT - Pure in-memory implementation

### ✅ CLI-First Interface (Principle III)
- [x] Command-line menu system (numbered options 1-6)
- [x] Text input/output only
- [x] Clear prompts and feedback messages

**STATUS**: ✅ COMPLIANT - CLI-only with menu navigation

### ⚠️ Test-Driven Development (Principle IV)
- [x] Test cases defined in spec (25+ test cases across 5 user stories)
- [x] Acceptance criteria are testable
- [ ] Manual testing for Phase I (automated tests in Phase II)

**STATUS**: ✅ COMPLIANT - Manual testing acceptable for Phase I per constitution

### ✅ Simple Data Model (Principle V)
- [x] Task model defined: id, title, description, completed, created_at
- [x] Matches constitution data model exactly
- [x] No additional complexity

**STATUS**: ✅ COMPLIANT - Exact match to constitution

### ✅ Clean Code Standards (Principle VI)
- [x] Python 3.13+ required
- [x] PEP 8 compliance required
- [x] Functions < 50 lines
- [x] No hardcoded values (constants only)

**STATUS**: ✅ COMPLIANT - Standards clearly defined in spec

### ✅ Error Handling (Principle VII)
- [x] Input validation specified for all operations
- [x] User-friendly error messages defined
- [x] Graceful handling (no crashes)
- [x] No formal logging (Phase I simplicity)

**STATUS**: ✅ COMPLIANT - Comprehensive error handling defined

### ✅ Progressive Enhancement (Principle VIII)
- [x] Phase I scope limited to 5 basic features
- [x] Advanced features explicitly out of scope
- [x] Future phases planned (II-V)

**STATUS**: ✅ COMPLIANT - Phase I only, no scope creep

**OVERALL GATE STATUS**: ✅ **PASS** - All constitutional requirements met

## Project Structure

### Documentation (this feature)

```text
specs/console-app/
├── spec.md              # Requirements (✓ Complete with 5 clarifications)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (minimal for Phase I)
├── data-model.md        # Phase 1 output (detailed Task structure)
├── quickstart.md        # Phase 1 output (setup & run instructions)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.py              # Entry point, menu system, user interaction
├── todo_manager.py      # Core CRUD operations, business logic
└── utils.py             # Input validation, output formatting, helpers

tests/                   # Phase II+ (not required for Phase I)
├── test_todo_manager.py
├── test_utils.py
└── test_integration.py

pyproject.toml           # UV configuration (✓ exists)
README.md                # Setup instructions (to be created)
```

**Structure Decision**: Single project structure selected. Phase I is a simple CLI application with three modules following separation of concerns: presentation layer (main.py), business logic (todo_manager.py), and utilities (utils.py). This matches the "Option 1: Single project" pattern and aligns with Phase I simplicity requirements.

## Complexity Tracking

**No violations detected.** All constitution requirements are met without exceptions.

---

## Phase 0: Research & Unknowns

### Research Questions

1. **ISO 8601 Timestamp Format**
   - Decision: Use `datetime.now().isoformat()` from Python standard library
   - Rationale: Native Python support, no dependencies, human-readable
   - Format: "2025-12-28T15:30:00.123456"

2. **UTF-8 Encoding Handling**
   - Decision: Use UTF-8 by default (Python 3.13+ default)
   - Rationale: Supports emojis and international characters per clarification #3
   - Implementation: No special encoding needed, works natively

3. **Input Validation Strategy**
   - Decision: Centralized validation functions in utils.py
   - Rationale: Reusable, testable, single source of truth
   - Functions: `validate_title()`, `validate_description()`, `validate_task_id()`

4. **Menu Loop Pattern**
   - Decision: While-loop with try-except for input handling
   - Rationale: Standard CLI pattern, graceful error recovery
   - Exit condition: User selects option 6 or Ctrl+C

### Technology Best Practices

**Python 3.13+ Console Applications:**
- Use `input()` for user input (not raw_input)
- Handle `KeyboardInterrupt` (Ctrl+C) gracefully
- Clear screen not needed (simple output scrolling acceptable)
- Use f-strings for formatting (modern Python)
- Type hints optional for Phase I (add in Phase II)

**Data Structure Choice:**
- List of dictionaries (not classes) for Phase I simplicity
- Dict keys match spec exactly: id, title, description, completed, created_at
- Global variables acceptable for in-memory state (tasks list, next_id counter)

**Error Handling Pattern:**
- Validate before operation (fail fast)
- Return (success: bool, message: str) tuples from operations
- Display errors in red/warning symbols where supported

### Unknowns Resolution

All technical unknowns resolved. No external research required - all patterns are standard Python practices covered by Python 3.13+ standard library.

---

## Phase 1: Design & Contracts

### Architecture Decisions

#### 1. Module Responsibilities

**main.py** (Presentation Layer):
- Display menu and handle user input
- Route menu selections to appropriate functions
- Display success/error messages
- Main loop control

**todo_manager.py** (Business Logic):
- CRUD operations: add_task, get_tasks, get_task_by_id, update_task, delete_task, toggle_complete
- Task storage (global tasks list, next_id counter)
- Business rule enforcement (ID uniqueness, validation integration)

**utils.py** (Utilities):
- Input validation: validate_title, validate_description, validate_task_id
- Output formatting: format_task_list, format_task_detail, format_timestamp
- Helper functions: truncate_description, trim_whitespace

#### 2. Data Flow

```
User Input → main.py → utils.py (validate) → todo_manager.py (operation) → utils.py (format) → main.py (display)
```

#### 3. Error Handling Strategy

- **Validation Layer**: utils.py raises ValueError with user-friendly messages
- **Business Layer**: todo_manager.py catches ValueError, returns (False, error_message)
- **Presentation Layer**: main.py displays error messages and re-prompts user

#### 4. State Management

```python
# Global state in todo_manager.py
tasks: list[dict] = []           # List of Task dictionaries
next_id: int = 1                 # Auto-increment counter (never reused)
```

### File Breakdown

See `data-model.md` for detailed Task structure and validation rules.
See `quickstart.md` for setup and run instructions.

---

## Phase 2: Task Decomposition

**NOT INCLUDED** - Run `/sp.tasks` to generate `tasks.md` after this plan is approved.

---

## Approval Checklist

Before proceeding to `/sp.tasks`:
- [x] All constitution gates passed
- [x] Technical context fully defined (no NEEDS CLARIFICATION)
- [x] Architecture decisions documented
- [x] Project structure defined
- [x] Research complete (Phase 0)
- [ ] Data model documented (Phase 1 - next step)
- [ ] Quickstart guide created (Phase 1 - next step)

---

**Status**: Phase 0 complete, Phase 1 in progress
**Next Steps**: Generate data-model.md and quickstart.md
**Created**: 2025-12-28
**Last Updated**: 2025-12-28
