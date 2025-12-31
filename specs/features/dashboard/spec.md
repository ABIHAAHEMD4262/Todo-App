# Feature: User Dashboard

## Overview
A comprehensive dashboard providing users with an at-a-glance view of their task statistics, recent activity, and quick actions for improved productivity.

## Status
**Bonus Feature** - Not required for Phase II Basic Level, but adds significant value to user experience.

## User Stories

### US-4.1: Dashboard Overview
**As a** user
**I want to** see a dashboard with my task statistics
**So that** I can quickly understand my progress and productivity

**Acceptance Criteria**:
- Dashboard page at `/dashboard` (main page after login)
- Shows total number of tasks
- Shows number of pending tasks
- Shows number of completed tasks
- Shows completion percentage/progress bar
- Displays recent activity (last 5 tasks created/completed)
- Quick action buttons (Add Task, View All Tasks)
- Visual charts/graphs (optional: pie chart, bar chart)
- Responsive design (mobile, tablet, desktop)

### US-4.2: Task Statistics Cards
**As a** user
**I want to** see task statistics in visual cards
**So that** I can quickly grasp my task status

**Acceptance Criteria**:
- Card showing "Total Tasks" with count
- Card showing "Pending Tasks" with count (yellow/orange theme)
- Card showing "Completed Tasks" with count (green theme)
- Card showing "Completion Rate" as percentage
- Cards have icons and color coding
- Clicking card navigates to filtered task list
- Cards animate on load (optional)
- Accessible (screen reader friendly)

### US-4.3: Recent Activity Feed
**As a** user
**I want to** see my recent task activity
**So that** I can track what I've been working on

**Acceptance Criteria**:
- Shows last 5-10 task activities
- Activity types: Created, Completed, Updated, Deleted
- Each item shows: task title, action, timestamp (relative: "2 hours ago")
- Sorted by most recent first
- Empty state when no activity
- Links to tasks (if not deleted)
- Truncates long titles with ellipsis

### US-4.4: Quick Actions
**As a** user
**I want to** perform quick actions from the dashboard
**So that** I can be more productive

**Acceptance Criteria**:
- "Add New Task" button prominently displayed
- Opens add task modal or navigates to tasks page with form open
- "View All Tasks" button
- "View Pending Tasks" shortcut
- Keyboard shortcuts supported (optional)

## Technical Specifications

### Frontend Components

**Dashboard Page** (`app/dashboard/page.tsx`)
```typescript
// Server Component
- Fetches dashboard stats on load
- Shows statistics cards
- Shows progress bar
- Shows recent activity feed
- Shows quick actions
- Loading state
- Error boundary
```

**StatsCard Component** (`components/ui/stats-card.tsx`)
```typescript
// Client Component
Props:
  - title: string
  - value: number
  - icon: ReactNode
  - color: string
  - onClick?: () => void

Features:
  - Visual card with icon and count
  - Color-coded theme
  - Hover effect
  - Clickable (navigates to filtered view)
  - Responsive sizing
```

**ProgressBar Component** (`components/ui/progress-bar.tsx`)
```typescript
// Client Component
Props:
  - percentage: number (0-100)

Features:
  - Visual bar showing completion
  - Color changes based on percentage
    - Red: < 30%
    - Yellow: 30-70%
    - Green: > 70%
  - Smooth animation
  - Shows percentage text
```

**ActivityFeed Component** (`components/ui/activity-feed.tsx`)
```typescript
// Client Component
Props:
  - activities: ActivityItem[]

Features:
  - List of recent activities
  - Icons for each action type
  - Relative timestamps
  - Truncated titles
  - Empty state
  - Scrollable
```

**QuickActions Component** (`components/ui/quick-actions.tsx`)
```typescript
// Client Component
Features:
  - Add New Task button
  - View All Tasks button
  - View Pending Tasks button
  - Icons included
  - Responsive layout
```

### Backend API Endpoint

**GET /api/{user_id}/dashboard/stats**

**Description**: Returns dashboard statistics for the authenticated user

**Authorization**: Requires JWT token, user_id must match token

**Response 200**:
```json
{
  "total_tasks": 25,
  "pending_tasks": 10,
  "completed_tasks": 15,
  "completion_rate": 60.0,
  "recent_activity": [
    {
      "task_id": 123,
      "task_title": "Buy groceries",
      "action": "completed",
      "timestamp": "2025-12-30T14:30:00Z"
    },
    {
      "task_id": 124,
      "task_title": "Finish Phase 2",
      "action": "created",
      "timestamp": "2025-12-30T12:15:00Z"
    }
  ]
}
```

**Response Models** (Backend):
```python
# app/schemas.py

class ActivityItem(BaseModel):
    task_id: Optional[int]  # null if task was deleted
    task_title: str
    action: str  # 'created' | 'completed' | 'updated' | 'deleted'
    timestamp: datetime

class DashboardStatsResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    completed_tasks: int
    completion_rate: float  # 0-100 percentage
    recent_activity: list[ActivityItem]
```

**Response Models** (Frontend):
```typescript
// types/index.ts

interface DashboardStats {
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  completion_rate: number
  recent_activity: ActivityItem[]
}

interface ActivityItem {
  task_id: number | null
  task_title: string
  action: 'created' | 'completed' | 'updated' | 'deleted'
  timestamp: string
}
```

**Implementation** (Backend):
```python
# app/routes/dashboard.py

@router.get("/api/{user_id}/dashboard/stats")
async def get_dashboard_stats(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> DashboardStatsResponse:
    # Authorization check
    if user_id != current_user.id:
        raise HTTPException(status_code=403)

    # Count tasks
    total = session.exec(
        select(func.count(Task.id))
        .where(Task.user_id == user_id)
    ).one()

    pending = session.exec(
        select(func.count(Task.id))
        .where(Task.user_id == user_id, Task.completed == False)
    ).one()

    completed = total - pending
    completion_rate = (completed / total * 100) if total > 0 else 0

    # Get recent activity (last 10 tasks by updated_at)
    recent_tasks = session.exec(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.updated_at.desc())
        .limit(10)
    ).all()

    recent_activity = [
        ActivityItem(
            task_id=task.id,
            task_title=task.title,
            action="completed" if task.completed else "created",
            timestamp=task.updated_at
        )
        for task in recent_tasks
    ]

    return DashboardStatsResponse(
        total_tasks=total,
        pending_tasks=pending,
        completed_tasks=completed,
        completion_rate=round(completion_rate, 1),
        recent_activity=recent_activity
    )
```

### Frontend Hooks

**useDashboard Hook** (`hooks/use-dashboard.ts`)
```typescript
export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await api.getDashboardStats(userId)
      setStats(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, error, refetch: fetchDashboardStats }
}
```

## UI/UX Specifications

### Layout (Desktop)
```
┌────────────────────────────────────────────────────────────┐
│  Dashboard                                         [User ▼] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ 📊 25   │  │ ⏳ 10   │  │ ✅ 15   │  │ 📈 60%  │      │
│  │ Total   │  │ Pending │  │ Done    │  │ Complete│      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│  Progress: [████████████░░░░░░░░] 60%                     │
│                                                             │
│  Recent Activity                    Quick Actions          │
│  ┌─────────────────────────┐       ┌────────────┐        │
│  │ ✅ Completed            │       │ + Add Task │        │
│  │   "Buy groceries"       │       │────────────│        │
│  │   2 hours ago           │       │ View All   │        │
│  └─────────────────────────┘       └────────────┘        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile (< 640px)**: Single column, stacked cards
- **Tablet (640-1024px)**: 2-column grid for cards
- **Desktop (> 1024px)**: 4-column grid for cards

### Color Scheme
- **Total Tasks**: Blue (`#3B82F6`)
- **Pending Tasks**: Orange/Yellow (`#F59E0B`)
- **Completed Tasks**: Green (`#10B981`)
- **Completion Rate**: Purple (`#8B5CF6`)

### Icons (Lucide React)
- Total: `LayoutDashboard`
- Pending: `Clock`
- Completed: `CheckCircle2`
- Completion Rate: `TrendingUp`

## Error Handling

### Frontend
- Loading skeleton while fetching stats
- Error message if fetch fails with retry button
- Empty state if user has no tasks
- Graceful handling of missing data

### Backend
- 401 if not authenticated
- 403 if user_id mismatch
- 500 for unexpected errors (logged)

## Performance Considerations

### Frontend
- Server-side data fetching for initial load
- Client-side refresh on user action
- Memoization of expensive calculations
- Lazy loading of activity feed

### Backend
- Efficient SQL queries (single query with aggregations where possible)
- Database indexes on user_id and completed
- Caching of stats for high-traffic scenarios (optional)
- Limit recent activity to 10 items

## Test Cases

### Dashboard Page
- [ ] Page loads successfully
- [ ] Shows correct statistics
- [ ] Shows progress bar with correct percentage
- [ ] Shows recent activity
- [ ] Shows quick actions
- [ ] Loading state displays while fetching
- [ ] Error state shows on failure
- [ ] Responsive on all devices

### Statistics Cards
- [ ] Total tasks card shows correct count
- [ ] Pending tasks card shows correct count
- [ ] Completed tasks card shows correct count
- [ ] Completion rate card shows correct percentage
- [ ] Cards are clickable
- [ ] Clicking navigates to appropriate filtered view

### Recent Activity
- [ ] Shows last 5-10 activities
- [ ] Shows correct action icons
- [ ] Shows relative timestamps
- [ ] Truncates long titles
- [ ] Shows empty state when no activity

### API Endpoint
- [ ] Returns correct task counts
- [ ] Calculates completion rate correctly
- [ ] Returns recent activity in correct order
- [ ] Returns 401 without token
- [ ] Returns 403 for wrong user_id
- [ ] Handles zero tasks gracefully

## Future Enhancements

### Phase III (Optional)
- Charts/graphs (pie chart, bar chart)
- Productivity insights
- Task completion trends over time
- Weekly/monthly summaries

### Phase IV-V (Optional)
- Real-time updates via WebSocket
- Export dashboard as PDF
- Custom dashboard widgets
- Comparison with previous periods

---

**Status**: ✅ Specification Complete
**Phase**: II (Bonus)
**Priority**: Medium (Nice to have)
**Dependencies**: Task CRUD and Authentication must be complete
