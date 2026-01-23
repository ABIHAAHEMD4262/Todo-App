# Phase 5: Advanced Cloud Deployment - Specification

## Overview

**Phase**: 5 - Advanced Cloud Deployment
**Due Date**: January 18, 2026
**Points**: 300

Transform the Todo Chatbot into a production-grade, event-driven distributed system with advanced features deployed on cloud Kubernetes.

---

## Part A: Advanced Features

### 1. Due Dates & Reminders

**User Stories:**
- As a user, I can set a due date for a task
- As a user, I can set a reminder time before the due date
- As a user, I receive notifications when reminders are triggered

**Acceptance Criteria:**
- Due date is optional (can be null)
- Due date includes both date and time
- Reminder can be set as: 15min, 30min, 1hr, 1day, 1week before due
- Tasks with passed due dates show as "overdue"
- Chatbot understands: "Add task buy milk due tomorrow at 5pm"

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN reminder_minutes INTEGER NULL; -- minutes before due_date
```

### 2. Recurring Tasks

**User Stories:**
- As a user, I can create recurring tasks (daily, weekly, monthly)
- As a user, when I complete a recurring task, the next occurrence is auto-created

**Acceptance Criteria:**
- Recurrence patterns: none, daily, weekly, monthly, yearly
- Custom recurrence: every N days/weeks/months
- When recurring task is completed, next instance is created automatically
- Parent-child relationship tracks recurring task chain
- Chatbot understands: "Add recurring task standup meeting every weekday at 9am"

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurrence_pattern VARCHAR(50) NULL; -- daily, weekly, monthly, yearly, custom
ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER NULL; -- for custom: every N days/weeks
ALTER TABLE tasks ADD COLUMN recurrence_end_date TIMESTAMP NULL; -- optional end date
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER NULL REFERENCES tasks(id);
```

### 3. Priorities

**User Stories:**
- As a user, I can assign priority levels to tasks
- As a user, I can filter/sort tasks by priority

**Acceptance Criteria:**
- Priority levels: none, low, medium, high, urgent
- Default priority is "none"
- Visual indicators for priority levels
- Chatbot understands: "Add high priority task fix bug"

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'none'; -- none, low, medium, high, urgent
```

### 4. Tags/Categories

**User Stories:**
- As a user, I can create custom tags
- As a user, I can assign multiple tags to a task
- As a user, I can filter tasks by tag

**Acceptance Criteria:**
- Tags have name and optional color
- Tasks can have multiple tags (many-to-many)
- Tags are user-scoped (each user has their own tags)
- Chatbot understands: "Add task meeting with John tags work, important"

**Database Changes:**
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#808080',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE task_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

### 5. Search & Filter

**User Stories:**
- As a user, I can search tasks by keyword
- As a user, I can filter tasks by status, priority, tags, due date

**Acceptance Criteria:**
- Search matches title and description (case-insensitive)
- Filter by: status (all/pending/completed), priority, tags, due date range
- Filters can be combined
- Chatbot understands: "Show me high priority tasks due this week"

**API Changes:**
```
GET /api/{user_id}/tasks?
    status=pending|completed|all
    priority=low|medium|high|urgent
    tags=tag1,tag2
    due_from=2026-01-01
    due_to=2026-01-31
    search=keyword
    sort=due_date|priority|created_at
    order=asc|desc
```

### 6. Sort Tasks

**User Stories:**
- As a user, I can sort tasks by various fields

**Acceptance Criteria:**
- Sort by: due date, priority, created date, title
- Order: ascending or descending
- Default: created_at DESC

---

## Part B: Event-Driven Architecture

### Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `task-events` | Chat API | Recurring Task Service, Audit Service | All task CRUD operations |
| `reminders` | Chat API | Notification Service | Scheduled reminder triggers |
| `task-updates` | Chat API | WebSocket Service | Real-time client sync |

### Event Schemas

**Task Event:**
```json
{
    "event_type": "created|updated|completed|deleted",
    "task_id": 123,
    "user_id": "user123",
    "task_data": { ... },
    "timestamp": "2026-01-15T10:30:00Z"
}
```

**Reminder Event:**
```json
{
    "task_id": 123,
    "user_id": "user123",
    "title": "Task title",
    "due_at": "2026-01-15T14:00:00Z",
    "remind_at": "2026-01-15T13:00:00Z"
}
```

### Dapr Integration

**Building Blocks:**
1. **Pub/Sub** - Kafka abstraction
2. **State Management** - Conversation state
3. **Service Invocation** - Frontend → Backend
4. **Bindings (Cron)** - Scheduled reminder checks
5. **Secrets** - API keys, credentials
6. **Jobs API** - Exact-time reminder scheduling

---

## Part C: Cloud Deployment

### Target Platforms

1. **Oracle OKE** (Recommended - Always Free)
2. **Google GKE** ($300 free for 90 days)
3. **Azure AKS** ($200 free for 30 days)

### CI/CD Pipeline

**GitHub Actions Workflow:**
1. On push to main branch
2. Run tests
3. Build Docker images
4. Push to container registry
5. Deploy to Kubernetes
6. Run smoke tests

### Monitoring Stack

- **Prometheus** - Metrics collection
- **Grafana** - Dashboards
- **Loki** - Log aggregation (optional)

---

## API Endpoints (Updated)

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks | List tasks with filters |
| POST | /api/{user_id}/tasks | Create task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update task |
| DELETE | /api/{user_id}/tasks/{id} | Delete task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tags | List user's tags |
| POST | /api/{user_id}/tags | Create tag |
| PUT | /api/{user_id}/tags/{id} | Update tag |
| DELETE | /api/{user_id}/tags/{id} | Delete tag |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks/search?q=keyword | Search tasks |

---

## MCP Tools (Updated)

### Existing Tools (Enhanced)
- `add_task` - Now supports due_date, priority, tags, recurrence
- `list_tasks` - Now supports filters and sorting
- `update_task` - Now supports due_date, priority, tags
- `complete_task` - Triggers recurring task creation
- `delete_task` - No changes

### New Tools
- `add_tag` - Create a new tag
- `list_tags` - List user's tags
- `search_tasks` - Search by keyword with filters
- `set_reminder` - Set reminder for a task

---

## Deliverables

1. **Database Migration** - Add new columns and tables
2. **Backend Updates** - New endpoints, schemas, models
3. **Frontend Updates** - New UI for features
4. **Kafka Integration** - Event publishing and consuming
5. **Dapr Components** - Pub/Sub, State, Bindings
6. **Cloud Deployment** - Deploy to OKE/GKE/AKS
7. **CI/CD Pipeline** - GitHub Actions workflow
8. **Documentation** - Updated specs and guides

---

## Success Criteria

- [ ] All advanced features implemented and working
- [ ] Kafka events published for all task operations
- [ ] Dapr sidecars running with Pub/Sub and State
- [ ] Deployed to cloud Kubernetes (OKE/GKE/AKS)
- [ ] CI/CD pipeline automatically deploys on push
- [ ] Monitoring dashboard showing metrics
- [ ] Chatbot understands new commands
- [ ] Demo video under 90 seconds

---

**Created**: 2026-01-22
**Phase**: 5 - Advanced Cloud Deployment
**Status**: In Progress
