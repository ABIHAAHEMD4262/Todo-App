# Implementation Plan: User Dashboard

**Feature**: Dashboard | **Date**: 2025-12-30 | **Branch**: master
**Spec**: `specs/features/dashboard/spec.md`
**Status**: Bonus Feature

## Summary

Create a comprehensive dashboard providing users with task statistics, recent activity, and quick actions. This bonus feature enhances user experience with visual insights into productivity and task progress.

## Technical Approach

### Architecture

```
┌───────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Dashboard   │ ──API──▶│ Dashboard Stats  │ ──SQL──▶│ tasks table │
│      UI       │         │    (FastAPI)     │         │   (Neon)    │
│               │         │                  │         │             │
│ - Stats Cards │         │ GET /dashboard   │         │ Aggregation │
│ - Activity    │         │   /stats         │         │   Queries   │
│ - Progress    │         │                  │         │             │
│ - Actions     │         │                  │         │             │
└───────────────┘         └──────────────────┘         └─────────────┘
```

### Components

**Backend** (`backend/app/`):
- `routes/dashboard.py` - Dashboard statistics endpoint

**Frontend** (`frontend/`):
- `app/dashboard/page.tsx` - Main dashboard page
- `components/ui/stats-card.tsx` - Statistics card component
- `components/ui/progress-bar.tsx` - Visual progress bar
- `components/ui/activity-feed.tsx` - Recent activity list
- `components/ui/quick-actions.tsx` - Quick action buttons
- `hooks/use-dashboard.ts` - Dashboard data fetching

## Implementation Strategy

### Phase 1: Backend Statistics API (High Priority)
1. Create dashboard routes file
2. Implement statistics endpoint
3. Calculate task counts and completion rate
4. Fetch recent activity
5. Register router in main app

### Phase 2: Frontend Data Layer (High Priority)
1. Add dashboard method to API client
2. Create dashboard hook for data fetching
3. Define TypeScript types

### Phase 3: Dashboard UI Components (High Priority)
1. Build statistics card component
2. Build progress bar component
3. Build activity feed component
4. Build quick actions component

### Phase 4: Dashboard Page (High Priority)
1. Create dashboard page
2. Integrate all components
3. Add loading/error states
4. Make responsive

### Phase 5: Polish (Medium Priority)
1. Add animations (optional)
2. Add charts (optional)
3. Improve styling

## API Endpoint

### GET /api/{user_id}/dashboard/stats

**Authorization**: Requires JWT, user_id must match token

**Response**:
```typescript
{
  total_tasks: number,
  pending_tasks: number,
  completed_tasks: number,
  completion_rate: number,  // 0-100 percentage
  recent_activity: [
    {
      task_id: number | null,  // null if deleted
      task_title: string,
      action: "created" | "completed" | "updated" | "deleted",
      timestamp: string  // ISO 8601
    }
  ]
}
```

**Calculations**:
- `total_tasks`: COUNT(*) WHERE user_id = X
- `pending_tasks`: COUNT(*) WHERE user_id = X AND completed = false
- `completed_tasks`: COUNT(*) WHERE user_id = X AND completed = true
- `completion_rate`: (completed / total) * 100
- `recent_activity`: Based on created_at and updated_at timestamps

## Data Flow

### Dashboard Load Flow
1. User navigates to `/dashboard`
2. Page fetches dashboard stats with JWT
3. Backend queries tasks table
4. Backend calculates statistics
5. Backend returns aggregated data
6. Frontend displays in components

### Statistics Calculation
```python
total = session.exec(select(func.count(Task.id)).where(Task.user_id == user_id)).one()
pending = session.exec(select(func.count(Task.id)).where(
    Task.user_id == user_id, Task.completed == False
)).one()
completed = total - pending
rate = (completed / total * 100) if total > 0 else 0
```

### Activity Tracking
- Use `created_at` for "created" actions
- Use `updated_at` for "completed" and "updated" actions
- Track "deleted" in separate audit log (Phase III)
- For Phase II: Show created/completed based on timestamps

## Component Design

### Statistics Cards
- Total Tasks (blue theme)
- Pending Tasks (yellow/orange theme)
- Completed Tasks (green theme)
- Completion Rate (purple theme with progress bar)

### Progress Bar
- Visual bar filling based on completion_rate
- Color changes: red (<30%), yellow (30-70%), green (>70%)
- Percentage text overlay
- Smooth animation

### Activity Feed
- List of recent activities
- Icon for each action type
- Relative timestamps ("2 hours ago")
- Clickable to navigate to task
- Scrollable if many items

### Quick Actions
- "Add New Task" button
- "View All Tasks" button
- "View Pending Tasks" button
- Prominent, accessible design

## Security Considerations

- **Authorization**: Verify user_id matches JWT
- **Data Isolation**: Only show current user's statistics
- **Performance**: Cache statistics (future optimization)
- **Query Optimization**: Use indexes (user_id, completed)

## Dependencies

**Prerequisites**:
- ✅ Authentication complete
- ✅ Task CRUD complete
- ✅ Database models defined

**Frontend**:
```bash
npm install lucide-react  # Icons for cards
```

**Backend**:
✅ Already installed: `fastapi`, `sqlmodel`

## Success Criteria

- [ ] Dashboard statistics endpoint returns correct data
- [ ] Total tasks calculated correctly
- [ ] Pending/completed counts accurate
- [ ] Completion rate calculated correctly (0-100)
- [ ] Recent activity shows last actions
- [ ] Statistics cards display data visually
- [ ] Progress bar shows completion rate
- [ ] Activity feed shows recent actions
- [ ] Quick actions navigate correctly
- [ ] Dashboard loads fast (<500ms)
- [ ] Responsive on all devices

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Slow statistics queries | Use database indexes, cache results |
| Missing activity history | Use created_at/updated_at for Phase II |
| Complex activity tracking | Simplify to created/completed only |
| Visual design complexity | Use simple, clean cards |

## Performance Considerations

- **Query Optimization**: Use COUNT() queries with indexes
- **Caching**: Consider caching stats for 30 seconds (future)
- **Loading States**: Show skeleton while fetching
- **Error Handling**: Graceful degradation if stats fail

## Next Steps

1. ✅ Prerequisites complete (Auth + Task CRUD)
2. Run `/sp.tasks` to generate task breakdown
3. Implement backend statistics endpoint
4. Implement frontend dashboard components
5. Test dashboard functionality
6. Create PHR after completion
