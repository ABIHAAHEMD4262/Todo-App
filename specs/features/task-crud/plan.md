# Implementation Plan: Task CRUD Operations

**Feature**: Task CRUD | **Date**: 2025-12-30 | **Branch**: master
**Spec**: `specs/features/task-crud/spec.md`

## Summary

Implement complete CRUD (Create, Read, Update, Delete) operations for tasks, fulfilling all 5 Basic Level hackathon requirements. Users will be able to add, view, update, delete, and mark tasks as complete through a responsive web interface with real-time updates.

## Technical Approach

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Task UI    │ ──API──▶│ Task Routes  │ ──SQL──▶│ tasks table │
│ Components  │         │  (FastAPI)   │         │   (Neon)    │
│             │         │              │         │             │
│ - List      │         │ GET /tasks   │         │ user_id FK  │
│ - Form      │         │ POST /tasks  │         │ completed   │
│ - Item      │         │ PUT /tasks   │         │ indexes     │
│ - Filter    │         │ DELETE       │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Components

**Backend** (`backend/app/`):
- `routes/tasks.py` - Task CRUD endpoints
- `models.py` - Task model (✅ already implemented)
- `schemas.py` - Request/response schemas (✅ already implemented)

**Frontend** (`frontend/`):
- `lib/api.ts` - Task API methods
- `app/tasks/page.tsx` - Main tasks page
- `components/ui/task-list.tsx` - Task list (Server Component)
- `components/ui/task-item.tsx` - Individual task (Client Component)
- `components/ui/add-task-form.tsx` - Add task form
- `components/ui/task-filter.tsx` - Filter buttons
- `components/ui/delete-dialog.tsx` - Delete confirmation
- `hooks/use-tasks.ts` - Task state management

## Implementation Strategy

### Phase 1: Backend API (High Priority)
1. Create Pydantic schemas for requests/responses
2. Implement List Tasks endpoint (GET)
3. Implement Create Task endpoint (POST)
4. Implement Update Task endpoint (PUT)
5. Implement Delete Task endpoint (DELETE)
6. Implement Toggle Complete endpoint (PATCH)
7. Add CORS configuration

### Phase 2: Frontend API Client (High Priority)
1. Add task methods to API client
2. Create TypeScript types
3. Implement error handling
4. Add loading states

### Phase 3: Task UI Components (High Priority)
1. Build task list component
2. Build task item component
3. Build add task form
4. Build task filter
5. Build delete confirmation dialog

### Phase 4: Main Tasks Page (High Priority)
1. Create tasks page
2. Integrate all components
3. Add loading/error states
4. Make responsive

### Phase 5: Polish & Optimization (Medium Priority)
1. Add optimistic UI updates
2. Add toast notifications
3. Improve loading states
4. Add empty states

## API Endpoints

All endpoints require JWT authentication and user authorization.

### GET /api/{user_id}/tasks
- **Query Params**: `status` (all|pending|completed)
- **Returns**: `{ tasks: Task[], total: number }`
- **Authorization**: user_id must match JWT token

### POST /api/{user_id}/tasks
- **Body**: `{ title: string, description?: string }`
- **Returns**: Created task
- **Validation**: Title 1-200 chars, description max 1000 chars

### PUT /api/{user_id}/tasks/{task_id}
- **Body**: `{ title?: string, description?: string, completed?: boolean }`
- **Returns**: Updated task
- **Authorization**: User must own task

### DELETE /api/{user_id}/tasks/{task_id}
- **Returns**: 204 No Content
- **Authorization**: User must own task

### PATCH /api/{user_id}/tasks/{task_id}/complete
- **Returns**: Updated task with toggled completion
- **Authorization**: User must own task

## Data Flow

### Create Task Flow
1. User fills form
2. Client validates with Zod
3. POST to API with JWT
4. Backend validates, creates task
5. Return task to client
6. Add to list optimistically
7. Show success toast

### Update Task Flow
1. User clicks edit
2. Modal opens with current data
3. User modifies fields
4. PUT to API with changes
5. Backend validates, updates task
6. Return updated task
7. Update UI optimistically
8. Show success toast

### Delete Task Flow
1. User clicks delete
2. Confirmation dialog shows
3. User confirms
4. DELETE to API
5. Backend deletes task
6. Remove from UI
7. Show success toast

### Toggle Complete Flow
1. User clicks checkbox
2. Toggle UI immediately (optimistic)
3. PATCH to API
4. If error, rollback UI
5. If success, keep state

## Security Considerations

- **Authorization**: Always check `user_id` matches JWT `sub` claim
- **Data Isolation**: Users can only see/modify their own tasks
- **Validation**:
  - Frontend: Zod schemas
  - Backend: Pydantic schemas
- **SQL Injection**: Prevented by SQLModel parameterized queries
- **XSS**: Prevented by React auto-escaping

## Dependencies

**Prerequisites**:
- ✅ Authentication feature complete
- ✅ Database models defined
- ✅ JWT middleware implemented

**Frontend**:
```bash
npm install sonner  # Toast notifications
```

**Backend**:
✅ Already installed: `fastapi`, `sqlmodel`, `pydantic`

## Success Criteria

- [x] Task model exists in database
- [x] Database migrations complete
- [ ] User can add task with title and description
- [ ] User can view all their tasks
- [ ] User can filter tasks (all/pending/completed)
- [ ] User can update task title and description
- [ ] User can delete task (with confirmation)
- [ ] User can mark task as complete/incomplete
- [ ] Users can only see their own tasks
- [ ] Validation prevents invalid data
- [ ] Responsive on mobile, tablet, desktop

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Slow task list rendering | Use Server Components for initial render |
| Stale data after mutations | Implement optimistic updates |
| Concurrent updates | Use updated_at for conflict detection |
| Large task lists | Add pagination in future phases |

## Next Steps

1. ✅ Database foundation complete
2. Run `/sp.tasks` to generate task breakdown
3. Implement backend API endpoints
4. Implement frontend UI components
5. Test end-to-end CRUD operations
6. Create PHR after completion
