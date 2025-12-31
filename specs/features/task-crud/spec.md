# Feature: Task CRUD Operations

## Overview
Core todo list functionality allowing users to Create, Read, Update, and Delete tasks. This feature implements all 5 Basic Level requirements mandated by the hackathon.

## Hackathon Requirements
This feature fulfills the following **Basic Level** requirements:
1. ✅ Add Task
2. ✅ View Task List
3. ✅ Update Task
4. ✅ Delete Task
5. ✅ Mark as Complete

## User Stories

### US-2.1: Add Task
**As a** user
**I want to** create a new task
**So that** I can track things I need to do

**Acceptance Criteria**:
- Add task form visible on tasks page
- Title field (required, max 200 chars)
- Description field (optional, max 1000 chars)
- Form validation with error messages
- Task saved to database
- Task appears in list immediately
- Success notification shown
- Form clears after successful creation

**Validation Rules**:
- Title: Required, 1-200 characters, trimmed
- Description: Optional, 0-1000 characters, trimmed
- User must be authenticated

### US-2.2: View All Tasks
**As a** user
**I want to** see all my tasks in a list
**So that** I can review what needs to be done

**Acceptance Criteria**:
- Tasks displayed in a clean, organized list
- Each task shows: title, completion status, created date
- Description shown on expand/click
- Empty state when no tasks
- Loading state while fetching
- Tasks sorted by creation date (newest first)
- Responsive layout (mobile, tablet, desktop)
- Only shows current user's tasks

### US-2.3: Update Task
**As a** user
**I want to** edit a task's details
**So that** I can correct mistakes or add information

**Acceptance Criteria**:
- Edit button/icon on each task
- Modal/form opens with current data
- Can update title and description
- Validation on updated data
- Changes saved to database
- Updated task reflects in list
- Updated timestamp changes
- Success notification

**Validation Rules**:
- Same as Add Task (title 1-200 chars, description 0-1000 chars)
- User must own the task

### US-2.4: Delete Task
**As a** user
**I want to** remove tasks I no longer need
**So that** my list stays organized

**Acceptance Criteria**:
- Delete button/icon on each task
- Confirmation dialog before deletion
- Task removed from database
- Task removed from UI immediately
- Cannot undo deletion
- Success notification
- No errors if already deleted

**Authorization**:
- User must own the task
- Returns 404 if task not found
- Returns 403 if user doesn't own task

### US-2.5: Mark Task as Complete
**As a** user
**I want to** mark tasks as complete
**So that** I can track my progress

**Acceptance Criteria**:
- Checkbox or toggle on each task
- Clicking toggles completion status
- Completed tasks visually distinct (strikethrough, gray)
- Status saved to database immediately
- Can toggle back to incomplete
- Updated timestamp changes
- Optimistic UI update

## Technical Specifications

### Frontend Components

**TaskList Component** (Server Component)
```typescript
// app/tasks/page.tsx
- Fetches tasks server-side
- Passes data to TaskItem components
- Shows empty state
- Shows loading skeleton
```

**TaskItem Component** (Client Component)
```typescript
// components/ui/task-item.tsx
- Displays individual task
- Checkbox for completion toggle
- Edit button → opens modal
- Delete button → shows confirmation
- Optimistic updates
```

**AddTaskForm Component** (Client Component)
```typescript
// components/ui/add-task-form.tsx
- Title input (required)
- Description textarea (optional)
- Zod validation
- React Hook Form integration
- Submit handler
```

**TaskFilter Component** (Client Component)
```typescript
// components/ui/task-filter.tsx
- All / Pending / Completed buttons
- Updates query parameter
- Active state styling
```

### Backend API Endpoints

See @specs/api/rest-endpoints.md for complete API documentation.

**Key Endpoints**:
- `GET /api/{user_id}/tasks` - List tasks with filtering
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{id}` - Get task details
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

### Database Schema

See @specs/database/schema.md for complete database design.

**Tasks Table**:
- id (serial, primary key)
- user_id (varchar, foreign key → users.id)
- title (varchar 200, not null)
- description (text, nullable)
- completed (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

**Indexes**:
- user_id (for user filtering)
- completed (for status filtering)
- (user_id, completed) composite (for common queries)

## Filtering

### Status Filter
Users can filter tasks by completion status:
- **All**: Shows all tasks (default)
- **Pending**: Shows only incomplete tasks (completed = false)
- **Completed**: Shows only complete tasks (completed = true)

**Implementation**:
- Frontend: Filter buttons update URL query parameter
- Backend: Query parameter `?status=all|pending|completed`
- Database: WHERE clause on completed column

## Error Handling

### Frontend Errors
- Form validation errors (shown inline)
- Network errors (toast notification)
- Authentication errors (redirect to login)
- 404 errors (task not found message)
- 500 errors (generic error message with retry)

### Backend Errors
- 400: Validation errors with field details
- 401: Invalid/expired token
- 403: User doesn't own resource
- 404: Task not found
- 500: Unexpected errors (logged, generic message)

## Success Metrics

### Functional
- ✅ User can create tasks with title and description
- ✅ User can view all their tasks
- ✅ User can update task details
- ✅ User can delete tasks
- ✅ User can toggle task completion
- ✅ User can filter tasks by status

### Performance
- Task list loads in < 500ms
- Task creation responds in < 300ms
- Optimistic UI updates feel instant
- No UI jank during interactions

### Security
- Users only see their own tasks
- Users cannot modify other users' tasks
- All endpoints require authentication
- Input validation on frontend and backend

## Test Cases

### Create Task
- [ ] Can create task with title only
- [ ] Can create task with title and description
- [ ] Cannot create task with empty title
- [ ] Cannot create task with title > 200 chars
- [ ] Cannot create task with description > 1000 chars
- [ ] Task appears in list immediately after creation

### View Tasks
- [ ] Shows all user's tasks
- [ ] Shows empty state when no tasks
- [ ] Shows loading state while fetching
- [ ] Tasks sorted by created_at DESC
- [ ] Does not show other users' tasks

### Update Task
- [ ] Can update task title
- [ ] Can update task description
- [ ] Can update both title and description
- [ ] Cannot update with invalid data
- [ ] Cannot update other user's task
- [ ] Updated timestamp changes

### Delete Task
- [ ] Confirmation dialog appears
- [ ] Task deleted from database
- [ ] Task removed from UI
- [ ] Cannot delete other user's task
- [ ] Graceful handling if task already deleted

### Toggle Complete
- [ ] Checkbox toggles completion status
- [ ] Status saved to database
- [ ] Visual styling changes (strikethrough)
- [ ] Can toggle back to incomplete
- [ ] Optimistic update works
- [ ] Cannot toggle other user's task

### Filtering
- [ ] "All" shows all tasks
- [ ] "Pending" shows only incomplete tasks
- [ ] "Completed" shows only complete tasks
- [ ] Active filter visually indicated

## Future Enhancements (Out of Scope for Phase II)

### Intermediate Level (Optional Bonus)
- Priorities & Tags/Categories
- Search & Filter (by keyword)
- Sort Tasks (by different criteria)

### Advanced Level (Phase V)
- Recurring Tasks
- Due Dates & Time Reminders

---

**Status**: ✅ Specification Complete
**Phase**: II
**Priority**: Critical (Required for hackathon)
**Dependencies**: Authentication feature must be complete
