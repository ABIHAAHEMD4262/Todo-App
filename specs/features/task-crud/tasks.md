# Tasks: Task CRUD Operations

**Feature**: Task CRUD | **Date**: 2025-12-30
**Plan**: `specs/features/task-crud/spec.md`

## Task Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0: Prerequisites | T-CRUD-001 | ✅ Complete |
| Phase 1: Backend API | T-CRUD-002 to T-CRUD-008 | ⏳ Pending |
| Phase 2: Frontend Client | T-CRUD-009 to T-CRUD-010 | ⏳ Pending |
| Phase 3: UI Components | T-CRUD-011 to T-CRUD-015 | ⏳ Pending |
| Phase 4: Main Page | T-CRUD-016 to T-CRUD-017 | ⏳ Pending |
| Phase 5: Polish | T-CRUD-018 to T-CRUD-019 | ⏳ Pending |

---

## Phase 0: Prerequisites (✅ Complete)

### T-CRUD-001: Database Models & Schemas ✅
**Status**: Complete
**Description**: Task model and Pydantic schemas already implemented

**Completed**:
- Task model in `backend/app/models.py`
- Pydantic schemas in `backend/app/schemas.py`
- Database migrations with Alembic

---

## Phase 1: Backend API

### T-CRUD-002: Create Task Routes File
**Priority**: High
**Estimate**: 15 min
**Depends On**: Authentication complete

**Description**: Create routes file for task endpoints

**Files to Create**:
- `backend/app/routes/__init__.py` (✅ exists)
- `backend/app/routes/tasks.py`

**Initial Structure**:
```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.auth import get_current_user, verify_user_access
from app.database import get_session
from app.models import User, Task
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse

router = APIRouter()
```

**Acceptance Criteria**:
- [ ] Routes file created
- [ ] Imports configured
- [ ] Router initialized

### T-CRUD-003: Implement List Tasks Endpoint
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-CRUD-002

**Description**: GET endpoint to list all user's tasks with filtering

**Endpoint**: `GET /api/{user_id}/tasks?status=all|pending|completed`

**Implementation**:
```python
@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    status: str = Query("all", regex="^(all|pending|completed)$"),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    statement = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        statement = statement.where(Task.completed == False)
    elif status == "completed":
        statement = statement.where(Task.completed == True)

    statement = statement.order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()

    return TaskListResponse(tasks=tasks, total=len(tasks))
```

**Acceptance Criteria**:
- [ ] Returns all tasks for user when status=all
- [ ] Returns only pending tasks when status=pending
- [ ] Returns only completed tasks when status=completed
- [ ] Tasks sorted by created_at DESC
- [ ] Returns 401 if not authenticated
- [ ] Returns 403 if user_id mismatch
- [ ] Returns 200 with empty array if no tasks

**Test Cases**:
- [ ] User can get their own tasks
- [ ] User cannot get other user's tasks
- [ ] Filtering works correctly
- [ ] Returns 401 without JWT

### T-CRUD-004: Implement Create Task Endpoint
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-CRUD-002

**Description**: POST endpoint to create a new task

**Endpoint**: `POST /api/{user_id}/tasks`

**Implementation**:
```python
@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else None
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

**Acceptance Criteria**:
- [ ] Creates task with valid data
- [ ] Returns 201 with created task
- [ ] Returns 400 if validation fails
- [ ] Returns 401 if not authenticated
- [ ] Returns 403 if user_id mismatch
- [ ] Trims whitespace from title and description
- [ ] Sets completed=False by default
- [ ] Sets created_at and updated_at

**Test Cases**:
- [ ] Can create task with title only
- [ ] Can create task with title and description
- [ ] Validates title length (1-200)
- [ ] Validates description length (max 1000)
- [ ] Returns 400 for empty title

### T-CRUD-005: Implement Update Task Endpoint
**Priority**: High
**Estimate**: 40 min
**Depends On**: T-CRUD-002

**Description**: PUT endpoint to update a task

**Endpoint**: `PUT /api/{user_id}/tasks/{task_id}`

**Implementation**:
```python
@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_data.title is not None:
        task.title = task_data.title.strip()
    if task_data.description is not None:
        task.description = task_data.description.strip()
    if task_data.completed is not None:
        task.completed = task_data.completed

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

**Acceptance Criteria**:
- [ ] Updates task with valid data
- [ ] Allows partial updates (any field optional)
- [ ] Updates updated_at timestamp
- [ ] Returns 200 with updated task
- [ ] Returns 404 if task not found
- [ ] Returns 403 if user doesn't own task
- [ ] Returns 400 if validation fails

**Test Cases**:
- [ ] Can update title only
- [ ] Can update description only
- [ ] Can update completed status only
- [ ] Can update multiple fields
- [ ] Cannot update other user's task
- [ ] Returns 404 for non-existent task

### T-CRUD-006: Implement Delete Task Endpoint
**Priority**: High
**Estimate**: 25 min
**Depends On**: T-CRUD-002

**Description**: DELETE endpoint to delete a task

**Endpoint**: `DELETE /api/{user_id}/tasks/{task_id}`

**Implementation**:
```python
@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
```

**Acceptance Criteria**:
- [ ] Deletes task successfully
- [ ] Returns 204 No Content
- [ ] Returns 404 if task not found
- [ ] Returns 403 if user doesn't own task
- [ ] Task removed from database

**Test Cases**:
- [ ] Can delete own task
- [ ] Cannot delete other user's task
- [ ] Returns 404 if already deleted
- [ ] Returns 404 for non-existent task

### T-CRUD-007: Implement Toggle Complete Endpoint
**Priority**: High
**Estimate**: 25 min
**Depends On**: T-CRUD-002

**Description**: PATCH endpoint to toggle completion status

**Endpoint**: `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Implementation**:
```python
@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task
```

**Acceptance Criteria**:
- [ ] Toggles completion status
- [ ] Updates updated_at timestamp
- [ ] Returns 200 with updated task
- [ ] Returns 404 if task not found
- [ ] Returns 403 if user doesn't own task

**Test Cases**:
- [ ] Toggles false to true
- [ ] Toggles true to false
- [ ] Cannot toggle other user's task

### T-CRUD-008: Register Task Router
**Priority**: High
**Estimate**: 10 min
**Depends On**: T-CRUD-003 to T-CRUD-007

**Description**: Register task router in main app

**Files to Modify**:
- `backend/app/main.py`

**Changes**:
```python
from app.routes import tasks

app.include_router(tasks.router, prefix="/api", tags=["tasks"])
```

**Acceptance Criteria**:
- [ ] Router registered in main app
- [ ] All endpoints accessible
- [ ] Swagger docs show all task endpoints
- [ ] CORS allows frontend requests

---

## Phase 2: Frontend API Client

### T-CRUD-009: Add Task Methods to API Client
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-CRUD-008, Authentication complete

**Description**: Add task CRUD methods to API client

**Files to Modify**:
- `frontend/lib/api.ts`

**Methods to Add**:
```typescript
export const api = {
  tasks: {
    list: (userId: string, status?: TaskStatus) =>
      apiClient<TaskListResponse>(`/api/${userId}/tasks?status=${status || 'all'}`),

    create: (userId: string, data: CreateTaskData) =>
      apiClient<Task>(`/api/${userId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (userId: string, taskId: number, data: UpdateTaskData) =>
      apiClient<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    delete: (userId: string, taskId: number) =>
      apiClient(`/api/${userId}/tasks/${taskId}`, {
        method: 'DELETE'
      }),

    toggleComplete: (userId: string, taskId: number) =>
      apiClient<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH'
      })
  }
}
```

**Acceptance Criteria**:
- [ ] All CRUD methods implemented
- [ ] Methods include JWT token
- [ ] TypeScript types defined
- [ ] Error handling for each method
- [ ] Methods return typed responses

### T-CRUD-010: Create TypeScript Types
**Priority**: High
**Estimate**: 15 min
**Depends On**: T-CRUD-009

**Description**: Define TypeScript interfaces for tasks

**Files to Modify**:
- `frontend/types/index.ts`

**Types to Add**:
```typescript
export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  completed?: boolean
}

export type TaskStatus = 'all' | 'pending' | 'completed'

export interface TaskListResponse {
  tasks: Task[]
  total: number
}
```

**Acceptance Criteria**:
- [ ] Types match backend schemas
- [ ] All fields properly typed
- [ ] Types exported

---

## Phase 3: UI Components

### T-CRUD-011: Build Task List Component
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-CRUD-010

**Description**: Create server component to display tasks

**Files to Create**:
- `frontend/components/ui/task-list.tsx`

**Features**:
- Server Component (fetches server-side)
- Displays list of tasks
- Empty state when no tasks
- Passes tasks to TaskItem components
- Responsive grid/list layout

**Acceptance Criteria**:
- [ ] Renders list of tasks
- [ ] Shows empty state correctly
- [ ] Responsive layout
- [ ] Loading skeleton

### T-CRUD-012: Build Task Item Component
**Priority**: High
**Estimate**: 1 hour
**Depends On**: T-CRUD-011

**Description**: Create client component for individual task

**Files to Create**:
- `frontend/components/ui/task-item.tsx`

**Features**:
- Client Component (interactive)
- Checkbox to toggle completion
- Title (strikethrough if completed)
- Description (expandable)
- Edit button
- Delete button
- Loading states
- Optimistic updates

**Acceptance Criteria**:
- [ ] Checkbox toggles completion
- [ ] Shows title and description
- [ ] Edit/delete buttons functional
- [ ] Optimistic UI updates
- [ ] Accessible (ARIA labels)

### T-CRUD-013: Build Add Task Form
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-CRUD-010

**Description**: Create form to add new tasks

**Files to Create**:
- `frontend/components/ui/add-task-form.tsx`

**Features**:
- Title and description fields
- Zod validation
- React Hook Form
- Submit button with loading
- Clears on success
- Toast notification

**Acceptance Criteria**:
- [ ] Form validates title (1-200 chars)
- [ ] Form validates description (max 1000 chars)
- [ ] Submits successfully
- [ ] Clears after submit
- [ ] Shows loading state

### T-CRUD-014: Build Task Filter Component
**Priority**: Medium
**Estimate**: 25 min
**Depends On**: T-CRUD-010

**Description**: Create filter buttons for task status

**Files to Create**:
- `frontend/components/ui/task-filter.tsx`

**Features**:
- Three buttons: All, Pending, Completed
- Active filter highlighted
- Updates task list

**Acceptance Criteria**:
- [ ] Filters work correctly
- [ ] Active state shows
- [ ] Responsive design

### T-CRUD-015: Build Delete Confirmation Dialog
**Priority**: Medium
**Estimate**: 30 min
**Depends On**: T-CRUD-012

**Description**: Create modal for delete confirmation

**Files to Create**:
- `frontend/components/ui/delete-dialog.tsx`

**Features**:
- Modal overlay
- Warning message
- Cancel and Delete buttons
- Keyboard accessible

**Acceptance Criteria**:
- [ ] Shows on delete click
- [ ] Closes on cancel
- [ ] Deletes on confirm
- [ ] ESC key closes

---

## Phase 4: Main Tasks Page

### T-CRUD-016: Create Tasks Page
**Priority**: High
**Estimate**: 1 hour
**Depends On**: T-CRUD-011 to T-CRUD-015

**Description**: Create main tasks management page

**Files to Create**:
- `frontend/app/tasks/page.tsx`
- `frontend/app/tasks/loading.tsx`
- `frontend/app/tasks/error.tsx`

**Features**:
- Fetches tasks on load
- Shows AddTaskForm
- Shows TaskFilter
- Shows TaskList
- Loading state
- Error boundary

**Acceptance Criteria**:
- [ ] Page loads successfully
- [ ] Can add task
- [ ] Can filter tasks
- [ ] Can edit/delete tasks
- [ ] Responsive layout

### T-CRUD-017: Create Task State Hook
**Priority**: Medium
**Estimate**: 45 min
**Depends On**: T-CRUD-009

**Description**: Create hook for task state management

**Files to Create**:
- `frontend/hooks/use-tasks.ts`

**Hook Interface**:
```typescript
{
  tasks: Task[]
  loading: boolean
  error: Error | null
  filter: TaskStatus
  setFilter: (filter: TaskStatus) => void
  createTask: (data: CreateTaskData) => Promise<void>
  updateTask: (id: number, data: UpdateTaskData) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  toggleComplete: (id: number) => Promise<void>
  refetch: () => Promise<void>
}
```

**Acceptance Criteria**:
- [ ] Hook manages task state
- [ ] Provides CRUD operations
- [ ] Handles loading/error states
- [ ] Supports filtering

---

## Phase 5: Polish & Optimization

### T-CRUD-018: Add Toast Notifications
**Priority**: Medium
**Estimate**: 20 min
**Depends On**: T-CRUD-016

**Description**: Add toast notifications for actions

**Package**: `sonner`

**Toasts Needed**:
- Task created successfully
- Task updated successfully
- Task deleted successfully
- Error messages

**Acceptance Criteria**:
- [ ] Success toasts on actions
- [ ] Error toasts on failures
- [ ] Toasts are accessible

### T-CRUD-019: Implement Optimistic Updates
**Priority**: Medium
**Estimate**: 30 min
**Depends On**: T-CRUD-017

**Description**: Update UI immediately, rollback on error

**Actions**:
- Toggle completion
- Create task
- Update task
- Delete task

**Acceptance Criteria**:
- [ ] UI updates before API response
- [ ] Rolls back on error
- [ ] Shows error toast on rollback
- [ ] Smooth user experience

---

## Dependencies Graph

```
T-CRUD-001 ✅ Models & Schemas
    │
    ├── T-CRUD-002 → Routes File
    │       ├── T-CRUD-003 → List Endpoint
    │       ├── T-CRUD-004 → Create Endpoint
    │       ├── T-CRUD-005 → Update Endpoint
    │       ├── T-CRUD-006 → Delete Endpoint
    │       └── T-CRUD-007 → Toggle Endpoint
    │               └── T-CRUD-008 → Register Router
    │                       ├── T-CRUD-009 → API Client
    │                       │       ├── T-CRUD-010 → TypeScript Types
    │                       │       │       ├── T-CRUD-011 → Task List
    │                       │       │       │       └── T-CRUD-012 → Task Item
    │                       │       │       │               └── T-CRUD-015 → Delete Dialog
    │                       │       │       ├── T-CRUD-013 → Add Form
    │                       │       │       └── T-CRUD-014 → Filter
    │                       │       │               ├── T-CRUD-016 → Tasks Page
    │                       │       │               └── T-CRUD-017 → State Hook
    │                       │       │                       ├── T-CRUD-018 → Toasts
    │                       │       │                       └── T-CRUD-019 → Optimistic
    └───────────────────────┴───────┴───────────────────────┘
```

## Completion Checklist

- [x] Database models complete
- [ ] Backend endpoints implemented
- [ ] Frontend API client ready
- [ ] UI components built
- [ ] Tasks page functional
- [ ] CRUD operations working
- [ ] Filtering working
- [ ] Responsive design
- [ ] Toast notifications
- [ ] Optimistic updates
- [ ] All tests passing

**Total Tasks**: 19 (1 complete, 18 pending)
**Estimated Total Time**: ~10 hours

---

**Next Steps**:
1. Start with T-CRUD-002 (Create Routes File)
2. Follow dependency order
3. Test each endpoint before moving to next
4. Create PHR after completion
