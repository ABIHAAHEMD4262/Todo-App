# Research & Technical Decisions: Console Todo App

**Feature**: console-app | **Date**: 2025-12-28 | **Plan**: [plan.md](./plan.md)

## Overview

This document captures research findings and technical decisions made during the planning phase. Phase I is intentionally simple, using only Python standard library features. No external dependencies or complex patterns are required.

---

## Research Questions

### 1. ISO 8601 Timestamp Format

**Question**: What's the best way to generate ISO 8601 timestamps in Python?

**Research**:
- Python 3.13+ has native `datetime.isoformat()` method
- No external library needed (no `arrow`, `pendulum`, or `dateutil` required)
- Format: `YYYY-MM-DDTHH:MM:SS.ffffff`

**Decision**: Use `datetime.now().isoformat()`

**Rationale**:
- ✅ Native Python support (no dependencies)
- ✅ Human-readable format
- ✅ Standard ISO 8601 compliance
- ✅ Includes microseconds (sufficient precision for Phase I)

**Alternatives Considered**:
- `time.time()` → Rejected: Unix timestamp not human-readable
- `str(datetime.now())` → Rejected: Not ISO 8601 format
- External library → Rejected: Violates "standard library only" constraint

**Implementation**:
```python
from datetime import datetime

timestamp = datetime.now().isoformat()
# Example: "2025-12-28T15:30:00.123456"
```

---

### 2. UTF-8 Encoding Handling

**Question**: How to ensure UTF-8 support for emojis and international characters?

**Research**:
- Python 3.13+ uses UTF-8 by default for strings
- Windows terminals support UTF-8 with `chcp 65001`
- Linux/macOS terminals use UTF-8 by default
- No special encoding configuration needed in code

**Decision**: Use UTF-8 by default (Python 3.13+ behavior)

**Rationale**:
- ✅ Python 3.13+ defaults to UTF-8
- ✅ Works natively without configuration
- ✅ Supports clarification #3 requirement (Unicode/emoji support)
- ✅ No extra code needed

**Alternatives Considered**:
- Explicit `encoding='utf-8'` in file operations → Not needed (no file I/O in Phase I)
- ASCII-only → Rejected: Doesn't meet clarification #3 requirement
- Custom encoding handling → Rejected: Unnecessary complexity

**Implementation**:
```python
# No special code needed - works automatically
title = "🎯 Complete hackathon"  # Just works in Python 3.13+
```

**User Note**: Windows users may need `chcp 65001` in terminal (documented in quickstart.md)

---

### 3. Input Validation Strategy

**Question**: Where should validation logic be placed? Inline, class methods, or utility functions?

**Research**:
- Options: Inline in main.py, Class-based validators, Utility functions
- Best practice for simple CLI: Utility functions for reusability
- Separation of concerns: Validation separate from business logic

**Decision**: Centralized validation functions in `utils.py`

**Rationale**:
- ✅ Single source of truth (DRY principle)
- ✅ Reusable across multiple operations
- ✅ Testable in isolation
- ✅ Clear separation: utils.py (validation) vs todo_manager.py (business logic)

**Alternatives Considered**:
- Inline validation in main.py → Rejected: Code duplication
- Class-based (OOP validators) → Rejected: Overkill for Phase I, violates simplicity
- Decorators → Rejected: Adds complexity without benefit

**Implementation**:
```python
# utils.py
def validate_title(title: str) -> tuple[bool, str, str]:
    cleaned = title.strip()
    if not cleaned:
        return (False, "", "Title is required")
    if len(cleaned) > 200:
        return (False, "", "Title too long (max 200 characters)")
    return (True, cleaned, "")

# Usage in todo_manager.py
is_valid, cleaned_title, error = validate_title(user_input)
if not is_valid:
    return (False, f"✗ Error: {error}", None)
```

---

### 4. Menu Loop Pattern

**Question**: What's the best pattern for a CLI menu loop with error recovery?

**Research**:
- Standard pattern: `while True` loop with `try-except`
- Exit condition: User selects "Exit" option or Ctrl+C
- Error recovery: Catch exceptions, display error, re-prompt

**Decision**: While-loop with try-except for input handling

**Rationale**:
- ✅ Standard CLI pattern (widely used)
- ✅ Graceful error recovery (doesn't crash on invalid input)
- ✅ Clean exit handling (Ctrl+C, menu option)
- ✅ Simple to understand and maintain

**Alternatives Considered**:
- Recursive function calls → Rejected: Stack overflow risk
- State machine → Rejected: Overkill for simple menu
- Event-driven loop → Rejected: Unnecessary complexity

**Implementation**:
```python
def main():
    while True:
        try:
            display_menu()
            choice = input("Enter your choice (1-6): ")

            if choice == "6":
                print("Thank you for using Todo App! Goodbye.")
                break

            handle_menu_choice(choice)

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"✗ Error: {e}")
            print("Please try again.\n")
```

---

## Technology Best Practices

### Python 3.13+ Console Applications

**Pattern**: Standard input/output with minimal formatting

**Best Practices Adopted**:
1. ✅ Use `input()` for user input (not deprecated `raw_input()`)
2. ✅ Handle `KeyboardInterrupt` (Ctrl+C) gracefully
3. ✅ No screen clearing (simple output scrolling acceptable for Phase I)
4. ✅ Use f-strings for formatting (modern Python style)
5. ✅ Type hints optional (add in Phase II for stricter typing)

**Best Practices Deferred to Phase II**:
- ❌ Screen clearing (`os.system('clear')` / `os.system('cls')`)
- ❌ Colored output (`colorama` library)
- ❌ Rich formatting (`rich` library)
- ❌ Type hints everywhere (Phase I focuses on correctness over types)

**Rationale**: Phase I prioritizes simplicity and standard library usage. Visual enhancements deferred to Phase II.

---

### Data Structure Choice

**Question**: Should we use classes/dataclasses or dictionaries for Task objects?

**Research**:
- Options: Plain dict, TypedDict, dataclass, Pydantic, custom class
- Constitution requirement: "Simple Data Model"
- Phase I constraint: No external dependencies

**Decision**: List of dictionaries (not classes)

**Rationale**:
- ✅ Simplest approach (aligns with Constitution Principle II)
- ✅ No external dependencies (dataclass requires import but is standard library)
- ✅ Direct JSON-like structure (easy to evolve to Phase II with database)
- ✅ No boilerplate (no `__init__`, `__repr__`, etc.)

**Alternatives Considered**:
- `dataclass` (standard library) → Considered but rejected for Phase I: Adds slight complexity
- Custom class → Rejected: Violates simplicity principle
- Pydantic models → Rejected: External dependency
- TypedDict → Rejected: Type hints deferred to Phase II

**Implementation**:
```python
# Global variables acceptable for in-memory state
tasks: list[dict] = []
next_id: int = 1

# Task structure (plain dict)
task = {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": False,
    "created_at": "2025-12-28T15:30:00.123456"
}

tasks.append(task)
```

**Evolution Path**: Phase II will migrate to SQLModel (Pydantic + SQLAlchemy) for database integration.

---

### Error Handling Pattern

**Question**: Should operations return values, raise exceptions, or both?

**Research**:
- Options: Return values (success/failure), Raise exceptions, Result monad
- Python convention: Exceptions for exceptional cases, return values for normal flow
- CLI pattern: Display errors to user, don't crash

**Decision**: Return tuples `(success: bool, message: str)` from operations

**Rationale**:
- ✅ Clear success/failure indication
- ✅ User-friendly error messages embedded
- ✅ No exception handling needed in presentation layer
- ✅ Easy to display messages to user

**Alternatives Considered**:
- Raise exceptions → Rejected: Requires try-except everywhere, less clear flow
- Return None on error → Rejected: Ambiguous (None could mean "not found" vs "error")
- Result monad (e.g., `Result[T, E]`) → Rejected: Overkill for Phase I

**Implementation**:
```python
# Business logic returns (success, message, optional_data)
def add_task(title: str, description: str) -> tuple[bool, str, dict | None]:
    if not title:
        return (False, "✗ Error: Title is required", None)

    task = {...}
    tasks.append(task)
    return (True, f"✓ Task #{task['id']} created", task)

# Presentation layer checks success and displays message
success, message, task = add_task(title, desc)
print(message)
```

---

## Unknowns Resolution

### Initial Unknowns from Technical Context

All unknowns have been resolved:

1. ✅ **Language/Version**: Python 3.13+ (confirmed)
2. ✅ **Dependencies**: None (standard library only)
3. ✅ **Storage**: In-memory list of dicts
4. ✅ **Testing**: Manual (per constitution Phase I allowance)
5. ✅ **Performance**: <100ms easily met with in-memory
6. ✅ **Constraints**: UTF-8 support, no persistence
7. ✅ **Scope**: 3 files, ~300 lines total

**No external research required** - All patterns are well-established Python standard practices.

---

## Architecture Patterns

### Chosen Pattern: Layered Architecture (Simplified)

**Layers**:
1. **Presentation Layer** (`main.py`): Menu, user I/O
2. **Business Logic Layer** (`todo_manager.py`): CRUD operations
3. **Utility Layer** (`utils.py`): Validation, formatting

**Rationale**:
- Clear separation of concerns
- Each layer has single responsibility
- Easy to test each layer independently (Phase II)
- Simple enough for Phase I, scalable to Phase II

**Alternatives Considered**:
- Monolithic single file → Rejected: Hard to maintain
- MVC pattern → Rejected: Overkill for CLI (no "view" layer)
- Hexagonal architecture → Rejected: Too complex for Phase I

---

## Summary

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Timestamp Format** | `datetime.now().isoformat()` | Native Python, ISO 8601 compliant |
| **Encoding** | UTF-8 (default in Python 3.13+) | Supports emojis and international chars |
| **Validation** | Utility functions in `utils.py` | Reusable, testable, DRY |
| **Menu Loop** | While-loop with try-except | Standard CLI pattern, graceful errors |
| **Data Structure** | List of dicts | Simplest approach, aligns with Constitution |
| **Error Handling** | Return tuples `(bool, str)` | Clear flow, user-friendly messages |
| **Architecture** | 3-layer (Presentation, Logic, Utils) | Separation of concerns, scalable |

### Dependencies

**External**: None ❌
**Standard Library**:
- `datetime` (timestamps)
- `typing` (optional type hints)

Total: 0 external dependencies (✅ Meets Constitution requirement)

### Complexity Assessment

**Cyclomatic Complexity**: Low (< 10 per function expected)
**LOC Estimate**: ~300 lines total across 3 files
**Architecture Complexity**: Minimal (3-layer, no DI, no ORM)

**Verdict**: ✅ Appropriate for Phase I - Simple, maintainable, Constitution-compliant

---

**Status**: Complete
**Version**: 1.0.0
**Created**: 2025-12-28
**All Unknowns**: Resolved ✅
**Ready for**: Task decomposition (`/sp.tasks`)
