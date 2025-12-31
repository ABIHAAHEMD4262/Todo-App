# UI Components - Phase II

## Component Architecture
Components follow Next.js 16+ App Router patterns with clear separation between Server and Client Components.

## Component Categories

1. **Navigation Components**: Header, menus, navigation
2. **Dashboard Components**: Statistics, progress, activity
3. **Task Components**: Task list, item, forms, filters
4. **Common Components**: Buttons, modals, toasts, loading states

---

## Navigation Components

### Navigation (`components/ui/navigation.tsx`)
**Type**: Client Component

**Purpose**: Application header with logo, navigation links, and user menu.

**Props**:
```typescript
interface NavigationProps {
  user?: User
}
```

**Features**:
- App logo/name
- Navigation links (Dashboard, Tasks)
- User menu dropdown (shows user name, logout button)
- Responsive (hamburger menu on mobile)
- Active route highlighting

**Structure**:
```typescript
<nav className="sticky top-0 bg-white shadow">
  <div className="container">
    <Logo />
    <NavLinks />  // Desktop
    <UserMenu />
    <MobileMenu />  // Mobile hamburger
  </div>
</nav>
```

**States**:
- Default: Logged in, showing user menu
- Mobile: Collapsed menu, hamburger icon
- Active link: Highlighted current page

---

## Dashboard Components

### StatsCard (`components/ui/stats-card.tsx`)
**Type**: Client Component

**Purpose**: Display a single statistic with icon and color theme.

**Props**:
```typescript
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'yellow' | 'green' | 'purple'
  onClick?: () => void
}
```

**Example Usage**:
```typescript
<StatsCard
  title="Total Tasks"
  value={25}
  icon={<LayoutDashboard />}
  color="blue"
  onClick={() => router.push('/tasks')}
/>
```

**Visual Design**:
- Card with shadow
- Large number display
- Icon in colored circle
- Title below number
- Hover effect (cursor pointer if onClick provided)

---

### ProgressBar (`components/ui/progress-bar.tsx`)
**Type**: Client Component

**Purpose**: Visual progress bar showing task completion rate.

**Props**:
```typescript
interface ProgressBarProps {
  percentage: number  // 0-100
}
```

**Features**:
- Filled bar based on percentage
- Color changes:
  - Red: < 30%
  - Yellow: 30-70%
  - Green: > 70%
- Smooth animation
- Percentage text displayed

**Structure**:
```typescript
<div className="w-full bg-gray-200 rounded-full">
  <div
    className={`h-4 rounded-full ${getColor(percentage)}`}
    style={{ width: `${percentage}%` }}
  />
</div>
<span>{percentage}%</span>
```

---

### ActivityFeed (`components/ui/activity-feed.tsx`)
**Type**: Client Component

**Purpose**: Display list of recent task activities.

**Props**:
```typescript
interface ActivityFeedProps {
  activities: ActivityItem[]
}

interface ActivityItem {
  task_id: number | null
  task_title: string
  action: 'created' | 'completed' | 'updated' | 'deleted'
  timestamp: string
}
```

**Features**:
- List of activity items
- Icons for each action type
- Relative timestamps ("2 hours ago")
- Truncated long titles (max 50 chars)
- Empty state ("No recent activity")
- Scrollable if > 5 items

---

### QuickActions (`components/ui/quick-actions.tsx`)
**Type**: Client Component

**Purpose**: Prominent action buttons for common tasks.

**Features**:
- "Add New Task" button (primary)
- "View All Tasks" button
- "View Pending Tasks" button
- Icons included
- Responsive layout (stacked on mobile)

---

## Task Components

### TaskList (`components/ui/task-list.tsx`)
**Type**: Server Component

**Purpose**: Display list of tasks fetched server-side.

**Props**:
```typescript
interface TaskListProps {
  tasks: Task[]
}
```

**Features**:
- Grid/list layout
- Passes tasks to TaskItem components
- Empty state ("No tasks yet")
- Responsive (1 column mobile, 2 columns desktop)

**Data Fetching**:
```typescript
// In page.tsx
const tasks = await getTasks(userId, status)

return <TaskList tasks={tasks} />
```

---

### TaskItem (`components/ui/task-item.tsx`)
**Type**: Client Component

**Purpose**: Individual task card with interactive controls.

**Props**:
```typescript
interface TaskItemProps {
  task: Task
  onToggle: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onEdit: (id: number) => void
}
```

**Features**:
- Checkbox for completion toggle
- Task title (strikethrough if completed)
- Task description (truncated, expandable)
- Edit button (pencil icon)
- Delete button (trash icon)
- Optimistic UI updates
- Loading states during actions

**Visual States**:
- **Incomplete**: White background, black text
- **Completed**: Gray background, strikethrough text
- **Loading**: Dimmed with spinner

---

### AddTaskForm (`components/ui/add-task-form.tsx`)
**Type**: Client Component

**Purpose**: Form to create new tasks.

**Props**: None (uses context for user ID)

**Features**:
- Title input (required, max 200 chars)
- Description textarea (optional, max 1000 chars)
- Zod validation
- React Hook Form integration
- Submit button with loading state
- Error messages inline
- Success toast notification
- Form clears after success

**Validation Schema**:
```typescript
const taskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).trim().optional()
})
```

---

### TaskFilter (`components/ui/task-filter.tsx`)
**Type**: Client Component

**Purpose**: Filter buttons for task status.

**Features**:
- Three buttons: All, Pending, Completed
- Active filter highlighted
- Updates URL query parameter
- Smooth transitions

**Structure**:
```typescript
<div className="flex gap-2">
  <FilterButton
    label="All"
    active={status === 'all'}
    onClick={() => setStatus('all')}
  />
  <FilterButton
    label="Pending"
    active={status === 'pending'}
    onClick={() => setStatus('pending')}
  />
  <FilterButton
    label="Completed"
    active={status === 'completed'}
    onClick={() => setStatus('completed')}
  />
</div>
```

---

### DeleteDialog (`components/ui/delete-dialog.tsx`)
**Type**: Client Component

**Purpose**: Confirmation modal before deleting task.

**Props**:
```typescript
interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  taskTitle: string
}
```

**Features**:
- Modal overlay (darkened background)
- Warning message: "Delete '{taskTitle}'?"
- Cancel button (secondary)
- Delete button (danger red)
- Keyboard accessible (ESC to close)
- Focus trap

---

## Authentication Components

### LoginForm (`app/(auth)/login/page.tsx`)
**Type**: Client Component (part of page)

**Features**:
- Email input (required, valid email)
- Password input (required, min 8 chars)
- Zod validation
- React Hook Form
- Submit button with loading state
- Error messages inline
- "Forgot password?" link (optional)
- "Sign up" link

---

### SignupForm (`app/(auth)/signup/page.tsx`)
**Type**: Client Component (part of page)

**Features**:
- Name input (required, max 255 chars)
- Email input (required, valid email)
- Password input (required, min 8 chars)
- Password strength indicator (optional)
- Zod validation
- React Hook Form
- Submit button with loading state
- Error messages inline
- "Already have account? Login" link

---

## Common Components

### Button (`components/ui/button.tsx`)
**Type**: Client Component

**Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}
```

**Variants**:
- **Primary**: Blue background, white text
- **Secondary**: Gray background, dark text
- **Danger**: Red background, white text

**States**:
- **Loading**: Spinner icon, disabled
- **Disabled**: Dimmed, cursor not-allowed

---

### Modal (`components/ui/modal.tsx`)
**Type**: Client Component

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
```

**Features**:
- Overlay backdrop
- Centered modal box
- Title bar with close button
- Body content slot
- Keyboard accessible (ESC to close)
- Click outside to close
- Focus trap

---

### Toast (`components/ui/toast.tsx`)
**Type**: Client Component (via `sonner` library)

**Usage**:
```typescript
import { toast } from 'sonner'

toast.success('Task created successfully')
toast.error('Failed to delete task')
toast.info('Task updated')
```

**Features**:
- Auto-dismiss after 3 seconds
- Dismissible by click
- Multiple toasts stack
- Position: bottom-right

---

### LoadingSkeleton (`components/ui/loading-skeleton.tsx`)
**Type**: Client Component

**Purpose**: Placeholder content while loading.

**Variants**:
- **TaskListSkeleton**: 3 task card skeletons
- **DashboardSkeleton**: 4 stat card skeletons + activity skeleton
- **TaskItemSkeleton**: Single task card skeleton

**Visual**: Animated shimmer effect (gray gradient)

---

### EmptyState (`components/ui/empty-state.tsx`)
**Type**: Client Component

**Props**:
```typescript
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Example**:
```typescript
<EmptyState
  icon={<Inbox size={64} />}
  title="No tasks yet"
  description="Create your first task to get started"
  action={{
    label: "Add Task",
    onClick: () => setShowForm(true)
  }}
/>
```

---

## Component Guidelines

### Server vs Client Components

**Use Server Components for**:
- Data fetching
- Static content
- SEO-critical content
- Layout structures

**Use Client Components for**:
- Interactivity (onClick, onChange)
- State management (useState, useContext)
- Browser APIs (localStorage, window)
- Animations

### Component File Structure
```typescript
// components/ui/task-item.tsx

'use client'  // If client component

import { ... }

interface TaskItemProps {
  // Props with TypeScript
}

export function TaskItem({ ... }: TaskItemProps) {
  // Component logic
  return (
    // JSX
  )
}
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- No inline styles
- Responsive classes: `sm:`, `md:`, `lg:`
- Dark mode support (optional): `dark:`

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators visible
- Screen reader friendly
- Color contrast WCAG AA

---

**Component Library Status**: ✅ Complete for Phase II
**Last Updated**: 2025-12-30
**Dependencies**: Tailwind CSS, Lucide React icons, Sonner (toast), Zod, React Hook Form
