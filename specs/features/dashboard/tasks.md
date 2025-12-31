# Tasks: User Dashboard

**Feature**: Dashboard | **Date**: 2025-12-30
**Plan**: `specs/features/dashboard/plan.md`
**Status**: Bonus Feature

## Task Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 0: Prerequisites | - | ✅ Complete |
| Phase 1: Backend Stats API | T-DASH-001 to T-DASH-003 | ⏳ Pending |
| Phase 2: Frontend Data | T-DASH-004 to T-DASH-006 | ⏳ Pending |
| Phase 3: UI Components | T-DASH-007 to T-DASH-010 | ⏳ Pending |
| Phase 4: Dashboard Page | T-DASH-011 to T-DASH-012 | ⏳ Pending |
| Phase 5: Polish | T-DASH-013 | ⏳ Pending |

---

## Phase 0: Prerequisites (✅ Complete)

- ✅ Authentication feature complete
- ✅ Task CRUD feature complete
- ✅ Database models and migrations ready

---

## Phase 1: Backend Statistics API

### T-DASH-001: Create Dashboard Routes File
**Priority**: High
**Estimate**: 15 min
**Depends On**: Task CRUD complete

**Description**: Create routes file for dashboard endpoints

**Files to Create**:
- `backend/app/routes/dashboard.py`

**Initial Structure**:
```python
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from app.auth import get_current_user, verify_user_access
from app.database import get_session
from app.models import User, Task
from app.schemas import DashboardStatsResponse, ActivityItem

router = APIRouter()
```

**Acceptance Criteria**:
- [ ] Routes file created
- [ ] Imports configured
- [ ] Router initialized

### T-DASH-002: Implement Dashboard Stats Endpoint
**Priority**: High
**Estimate**: 1.5 hours
**Depends On**: T-DASH-001

**Description**: GET endpoint to return dashboard statistics

**Endpoint**: `GET /api/{user_id}/dashboard/stats`

**Implementation**:
```python
@router.get("/{user_id}/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    verify_user_access(user_id, current_user)

    # Count total tasks
    total_tasks = session.exec(
        select(func.count(Task.id)).where(Task.user_id == user_id)
    ).one()

    # Count pending tasks
    pending_tasks = session.exec(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.completed == False
        )
    ).one()

    # Calculate completed and rate
    completed_tasks = total_tasks - pending_tasks
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Get recent activity (last 10 tasks by updated_at)
    recent_tasks = session.exec(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.updated_at.desc())
        .limit(10)
    ).all()

    # Build activity feed
    activity = []
    for task in recent_tasks:
        # Determine action based on timestamps and status
        if task.completed:
            action = "completed"
        else:
            # If created_at == updated_at, it's newly created
            if task.created_at == task.updated_at:
                action = "created"
            else:
                action = "updated"

        activity.append(ActivityItem(
            task_id=task.id,
            task_title=task.title,
            action=action,
            timestamp=task.updated_at
        ))

    return DashboardStatsResponse(
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        completed_tasks=completed_tasks,
        completion_rate=round(completion_rate, 1),
        recent_activity=activity[:5]  # Return only 5 most recent
    )
```

**Acceptance Criteria**:
- [ ] Returns total_tasks count
- [ ] Returns pending_tasks count
- [ ] Returns completed_tasks count
- [ ] Calculates completion_rate correctly (0-100)
- [ ] Returns recent_activity (last 5 actions)
- [ ] Returns 401 if not authenticated
- [ ] Returns 403 if user_id mismatch
- [ ] Handles empty task list (0 tasks)

**Test Cases**:
- [ ] Returns correct counts for user with tasks
- [ ] Returns zeros for user with no tasks
- [ ] Completion rate is 0% with no tasks
- [ ] Completion rate is 100% with all completed
- [ ] Completion rate is 50% with half completed
- [ ] Activity feed shows most recent first
- [ ] Cannot access other user's stats

### T-DASH-003: Register Dashboard Router
**Priority**: High
**Estimate**: 10 min
**Depends On**: T-DASH-002

**Description**: Register dashboard router in main app

**Files to Modify**:
- `backend/app/main.py`
- `backend/app/schemas.py` (add Dashboard schemas if not exists)

**Changes to main.py**:
```python
from app.routes import tasks, dashboard

app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
```

**Schemas needed** (if not already in schemas.py):
```python
class ActivityItem(BaseModel):
    task_id: Optional[int]
    task_title: str
    action: str  # 'created' | 'completed' | 'updated' | 'deleted'
    timestamp: datetime

class DashboardStatsResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    completed_tasks: int
    completion_rate: float  # 0-100
    recent_activity: list[ActivityItem]
```

**Acceptance Criteria**:
- [ ] Router registered in main app
- [ ] Endpoint accessible at /api/{user_id}/dashboard/stats
- [ ] Swagger docs show dashboard endpoint
- [ ] Schemas defined correctly

---

## Phase 2: Frontend Data Layer

### T-DASH-004: Add Dashboard Method to API Client
**Priority**: High
**Estimate**: 15 min
**Depends On**: T-DASH-003, Authentication complete

**Description**: Add dashboard stats method to API client

**Files to Modify**:
- `frontend/lib/api.ts`

**Method to Add**:
```typescript
export const api = {
  // ... existing methods
  dashboard: {
    getStats: (userId: string) =>
      apiClient<DashboardStats>(`/api/${userId}/dashboard/stats`)
  }
}
```

**Acceptance Criteria**:
- [ ] Method implemented
- [ ] Includes JWT token
- [ ] Returns typed DashboardStats
- [ ] Error handling

### T-DASH-005: Create Dashboard TypeScript Types
**Priority**: High
**Estimate**: 10 min
**Depends On**: T-DASH-004

**Description**: Define TypeScript interfaces for dashboard

**Files to Modify**:
- `frontend/types/index.ts`

**Types to Add**:
```typescript
export interface ActivityItem {
  task_id: number | null
  task_title: string
  action: 'created' | 'completed' | 'updated' | 'deleted'
  timestamp: string
}

export interface DashboardStats {
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  completion_rate: number
  recent_activity: ActivityItem[]
}
```

**Acceptance Criteria**:
- [ ] Types match backend schemas
- [ ] All fields properly typed
- [ ] Types exported

### T-DASH-006: Create Dashboard Hook
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-DASH-004

**Description**: Create hook for fetching dashboard stats

**Files to Create**:
- `frontend/hooks/use-dashboard.ts`

**Hook Interface**:
```typescript
{
  stats: DashboardStats | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}
```

**Implementation**:
```typescript
export function useDashboard(userId: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await api.dashboard.getStats(userId)
      setStats(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [userId])

  return { stats, loading, error, refetch: fetchStats }
}
```

**Acceptance Criteria**:
- [ ] Hook fetches stats on mount
- [ ] Returns loading state
- [ ] Returns error state
- [ ] Provides refetch function
- [ ] TypeScript types correct

---

## Phase 3: Dashboard UI Components

### T-DASH-007: Build Statistics Card Component
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-DASH-005

**Description**: Create reusable card for displaying statistics

**Files to Create**:
- `frontend/components/ui/stats-card.tsx`

**Props**:
```typescript
interface StatsCardProps {
  title: string
  value: number
  icon: React.ComponentType
  color: 'blue' | 'yellow' | 'green' | 'purple'
  onClick?: () => void
}
```

**Features**:
- Icon and colored theme
- Large value display
- Hover effect
- Clickable (navigates to filtered tasks)
- Responsive

**Acceptance Criteria**:
- [ ] Displays title and value
- [ ] Shows icon with color
- [ ] Clickable with hover effect
- [ ] Responsive design
- [ ] Accessible (ARIA labels)

### T-DASH-008: Build Progress Bar Component
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-DASH-005

**Description**: Create visual progress bar for completion rate

**Files to Create**:
- `frontend/components/ui/progress-bar.tsx`

**Props**:
```typescript
interface ProgressBarProps {
  percentage: number  // 0-100
}
```

**Features**:
- Filled bar based on percentage
- Color changes (red <30%, yellow 30-70%, green >70%)
- Percentage text overlay
- Smooth animation

**Acceptance Criteria**:
- [ ] Shows percentage visually
- [ ] Color changes correctly
- [ ] Animates smoothly
- [ ] Accessible

### T-DASH-009: Build Activity Feed Component
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-DASH-005

**Description**: Create list of recent activities

**Files to Create**:
- `frontend/components/ui/activity-feed.tsx`

**Props**:
```typescript
interface ActivityFeedProps {
  activities: ActivityItem[]
}
```

**Features**:
- Shows icon for each action type
- Displays task title and action
- Relative timestamps ("2 hours ago")
- Empty state when no activity
- Scrollable
- Truncates long titles

**Acceptance Criteria**:
- [ ] Displays activities correctly
- [ ] Shows relative timestamps
- [ ] Icons match actions
- [ ] Empty state works
- [ ] Accessible

### T-DASH-010: Build Quick Actions Component
**Priority**: Medium
**Estimate**: 25 min
**Depends On**: None

**Description**: Create quick action buttons

**Files to Create**:
- `frontend/components/ui/quick-actions.tsx`

**Features**:
- "Add New Task" button
- "View All Tasks" button
- "View Pending Tasks" button
- Icons included
- Responsive layout

**Acceptance Criteria**:
- [ ] Buttons navigate correctly
- [ ] Icons displayed
- [ ] Responsive design
- [ ] Accessible

---

## Phase 4: Dashboard Page

### T-DASH-011: Create Dashboard Page
**Priority**: High
**Estimate**: 1 hour
**Depends On**: T-DASH-006 to T-DASH-010

**Description**: Create main dashboard page with all components

**Files to Create**:
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/loading.tsx`
- `frontend/app/dashboard/error.tsx`

**Features**:
- Fetches stats using useDashboard hook
- Shows 4 statistics cards
- Shows progress bar
- Shows activity feed
- Shows quick actions
- Loading state
- Error state
- Responsive grid layout

**Layout**:
- Mobile: Single column, stacked
- Tablet: 2-column grid for cards
- Desktop: 4-column grid for cards

**Acceptance Criteria**:
- [ ] Page loads successfully
- [ ] Shows all statistics correctly
- [ ] Cards clickable
- [ ] Activity feed works
- [ ] Quick actions work
- [ ] Loading state shows
- [ ] Error state shows
- [ ] Responsive on all devices

### T-DASH-012: Update Navigation for Dashboard
**Priority**: Medium
**Estimate**: 15 min
**Depends On**: T-DASH-011

**Description**: Add dashboard link to navigation

**Files to Modify**:
- `frontend/components/ui/navigation.tsx`
- `frontend/middleware.ts` (ensure /dashboard is protected)

**Changes**:
- Add "Dashboard" link to nav
- Active state when on dashboard
- Position before/after Tasks link

**Acceptance Criteria**:
- [ ] Dashboard link visible in nav
- [ ] Links to /dashboard
- [ ] Active state shows
- [ ] Route is protected

---

## Phase 5: Polish

### T-DASH-013: Add Animations and Polish
**Priority**: Low
**Estimate**: 30 min
**Depends On**: T-DASH-011

**Description**: Add finishing touches to dashboard

**Enhancements**:
- Card animations on load (fade in, slide up)
- Progress bar animation
- Skeleton loaders
- Hover states
- Transitions

**Acceptance Criteria**:
- [ ] Cards animate on load
- [ ] Progress bar animates
- [ ] Smooth transitions
- [ ] Professional appearance

---

## Dependencies Graph

```
Prerequisites ✅ (Auth + Task CRUD)
    │
    ├── T-DASH-001 → Routes File
    │       └── T-DASH-002 → Stats Endpoint
    │               └── T-DASH-003 → Register Router
    │                       ├── T-DASH-004 → API Client Method
    │                       │       ├── T-DASH-005 → TypeScript Types
    │                       │       └── T-DASH-006 → Dashboard Hook
    │                       │               ├── T-DASH-007 → Stats Card
    │                       │               ├── T-DASH-008 → Progress Bar
    │                       │               ├── T-DASH-009 → Activity Feed
    │                       │               └── T-DASH-010 → Quick Actions
    │                       │                       └── T-DASH-011 → Dashboard Page
    │                       │                               ├── T-DASH-012 → Navigation Update
    │                       │                               └── T-DASH-013 → Polish
    └───────────────────────┴───────────────────────────────┘
```

## Completion Checklist

- [ ] Backend stats endpoint implemented
- [ ] Frontend data layer ready
- [ ] Statistics cards built
- [ ] Progress bar component built
- [ ] Activity feed component built
- [ ] Quick actions component built
- [ ] Dashboard page functional
- [ ] Navigation updated
- [ ] Loading/error states working
- [ ] Responsive design
- [ ] Animations added
- [ ] All tests passing

**Total Tasks**: 13
**Estimated Total Time**: ~7 hours

---

**Next Steps**:
1. Start with T-DASH-001 (Create Routes File)
2. Follow dependency order
3. Test statistics calculations
4. Create PHR after completion
