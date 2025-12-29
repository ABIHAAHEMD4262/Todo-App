# Todo Console App - Phase I

**Hackathon II Submission** | **Phase**: I - Console Application | **Status**: ✅ Complete

A command-line interface (CLI) todo application built using Python 3.13+ with in-memory storage. Supports 5 core CRUD operations through an interactive menu system.

---

## Features

✅ **Add Task** - Create new tasks with title and optional description (1-200 char title, max 1000 char description)
✅ **View Tasks** - Display all tasks with ID, title, description, completion status, and creation timestamp
✅ **Update Task** - Modify existing task's title and/or description
✅ **Delete Task** - Remove tasks with confirmation prompt
✅ **Mark Complete/Incomplete** - Toggle task completion status

### Technical Highlights

- **In-Memory Storage**: Pure Python lists and dictionaries (no database)
- **UTF-8 Support**: Full Unicode support including emojis and international characters
- **Input Validation**: Comprehensive validation with user-friendly error messages
- **No Dependencies**: Uses only Python standard library
- **PEP 8 Compliant**: Clean, readable code following Python best practices

---

## Quick Start

### Prerequisites

- Python 3.13+ ([Download](https://www.python.org/downloads/))
- UV package manager ([Installation](https://docs.astral.sh/uv/))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Todo-App

# Verify Python version
python --version  # Should show 3.13+

# Verify UV installation
uv --version
```

### Running the Application

```bash
# Direct file execution (recommended for Phase I)
uv run src/main.py

# Alternative: As a Python module
python -m src.main
```

**Note**: UTF-8 encoding is automatically configured for Windows - no need to run `chcp 65001`

---

## Usage Example

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

Enter your choice (1-6): 1

--- Add New Task ---
Enter task title: Buy groceries
Enter task description (optional): Milk, eggs, bread

✓ Task #1 created: 'Buy groceries'
```

---

## Project Structure

```
Todo-App/
├── .specify/
│   ├── memory/
│   │   └── constitution.md      # Project principles
│   ├── templates/               # Spec templates
│   └── scripts/                 # Helper scripts
├── specs/
│   └── console-app/
│       ├── spec.md              # Requirements & test cases
│       ├── plan.md              # Architecture & decisions
│       ├── data-model.md        # Task structure
│       ├── quickstart.md        # Setup guide
│       └── tasks.md             # Implementation tasks
├── history/
│   └── prompts/                 # Prompt History Records (PHRs)
├── src/
│   ├── main.py                  # Entry point & menu system
│   ├── todo_manager.py          # CRUD operations
│   └── utils.py                 # Validation & formatting
├── .gitignore                   # Git ignore patterns
├── pyproject.toml               # UV configuration
└── README.md                    # This file
```

---

## Specification-Driven Development

This project was built using **Spec-Driven Development (SDD)** methodology:

1. **Specify** - Created comprehensive spec with 5 user stories, 25+ test cases
2. **Clarify** - Resolved 5 critical ambiguities through targeted questions
3. **Plan** - Designed 3-layer architecture (Presentation → Logic → Utils)
4. **Tasks** - Generated 48 atomic, testable implementation tasks
5. **Implement** - Claude Code generated all code from specifications

**Key Documents**:
- [Specification](specs/console-app/spec.md) - Full requirements
- [Plan](specs/console-app/plan.md) - Architecture & tech decisions
- [Data Model](specs/console-app/data-model.md) - Task structure & validation
- [Tasks](specs/console-app/tasks.md) - Implementation breakdown (47/48 complete)

---

## Testing

### Manual Testing

Phase I uses manual testing per project constitution. Run through the test scenarios in [spec.md](specs/console-app/spec.md):

**Test Checklist** (25 test cases):
- ✓ Add task variations (title only, with description, empty title, oversized inputs)
- ✓ View tasks (empty list, single task, multiple tasks, completion status)
- ✓ Update task (title, description, both, invalid ID, empty title)
- ✓ Delete task (confirmation, cancellation, invalid ID)
- ✓ Toggle completion (complete → incomplete → complete)

### Running Tests

```bash
# Start application
uv run todo

# Follow test scenarios from spec.md
# Verify each feature works as expected
```

---

## Technical Details

### Data Model

```python
Task = {
    "id": int,              # Auto-incremented, never reused
    "title": str,           # Required, 1-200 characters
    "description": str,     # Optional, max 1000 characters
    "completed": bool,      # Default: False
    "created_at": str       # ISO 8601 timestamp
}
```

### Architecture

**3-Layer Design**:
1. **Presentation Layer** (`main.py`) - Menu, user I/O, display logic
2. **Business Logic** (`todo_manager.py`) - CRUD operations, task storage
3. **Utility Layer** (`utils.py`) - Validation, formatting helpers

### Key Design Decisions

- **ID Management**: IDs are unique lifetime identifiers, never reused after deletion
- **Description Overflow**: Truncate to 1000 chars with warning (not error)
- **Update Confirmation**: No confirmation required (non-destructive operation)
- **UTF-8 Encoding**: Full Unicode support by default (Python 3.13+)
- **No Logging**: Phase I uses print statements for debugging (logging in Phase II)

---

## Constitution Compliance

✅ **Spec-Driven Development** - Followed SDD workflow (Specify → Plan → Tasks → Implement)
✅ **In-Memory First** - Pure in-memory storage (data lost on exit)
✅ **CLI-First Interface** - Command-line menu system only
✅ **Test-Driven Development** - 25+ test cases defined in spec
✅ **Simple Data Model** - Matches constitution exactly
✅ **Clean Code Standards** - PEP 8 compliant, functions < 50 lines
✅ **Error Handling** - Comprehensive validation, user-friendly messages
✅ **Progressive Enhancement** - Phase I only, no scope creep

See [constitution.md](.specify/memory/constitution.md) for full details.

---

## Limitations (Phase I)

⚠️ **No Data Persistence** - All tasks lost when application exits (intentional for Phase I)
⚠️ **Single User** - No authentication or multi-user support
⚠️ **No Advanced Features** - No search, filter, priorities, tags, or due dates

**Future Phases**:
- Phase II: Web interface + PostgreSQL persistence
- Phase III: AI chatbot interface with MCP server
- Phase IV: Kubernetes deployment
- Phase V: Cloud + event-driven architecture (Kafka, Dapr)

---

## Contributing

This is a hackathon submission. For issues or questions:
1. Review the [spec](specs/console-app/spec.md) for expected behavior
2. Check [tasks.md](specs/console-app/tasks.md) for implementation status
3. See [constitution](.specify/memory/constitution.md) for project principles

---

## License

MIT License - Hackathon II Submission

---

## Acknowledgments

- Built using **Claude Code** (AI-assisted development)
- Methodology: **Spec-Driven Development** (SDD)
- Framework: **Spec-Kit Plus** (13 commands)
- Hackathon: **Hackathon II** - Todo App Evolution

---

**Version**: 1.0.0 (Phase I)
**Created**: 2025-12-26
**Completed**: 2025-12-28
**Status**: ✅ Ready for submission
