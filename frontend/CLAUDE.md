# Frontend Guidelines - Todo App Phase II

## Stack
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth (client-side)
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Toasts**: Sonner

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx   # Login page
│   │   └── signup/
│   │       └── page.tsx   # Signup page
│   ├── dashboard/
│   │   ├── page.tsx       # Dashboard page
│   │   ├── loading.tsx    # Loading state
│   │   └── error.tsx      # Error boundary
│   ├── tasks/
│   │   ├── page.tsx       # Tasks page
│   │   ├── loading.tsx    # Loading state
│   │   └── error.tsx      # Error boundary
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page (redirects)
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # UI components
│   │   ├── navigation.tsx        # Header navigation
│   │   ├── stats-card.tsx        # Dashboard statistics card
│   │   ├── progress-bar.tsx      # Progress bar
│   │   ├── activity-feed.tsx     # Recent activity
│   │   ├── quick-actions.tsx     # Quick action buttons
│   │   ├── task-list.tsx         # Task list (Server Component)
│   │   ├── task-item.tsx         # Task card (Client Component)
│   │   ├── add-task-form.tsx     # Add task form
│   │   ├── task-filter.tsx       # Status filter buttons
│   │   ├── delete-dialog.tsx     # Confirmation modal
│   │   ├── button.tsx            # Button component
│   │   ├── modal.tsx             # Modal component
│   │   ├── loading-skeleton.tsx  # Skeleton loaders
│   │   └── empty-state.tsx       # Empty states
│   └── providers/
│       └── auth-provider.tsx     # Auth context provider
├── lib/
│   ├── api.ts             # API client (all backend calls)
│   ├── auth.ts            # Better Auth configuration
│   └── validation.ts      # Zod schemas
├── hooks/
│   ├── use-auth.ts        # Authentication hook
│   ├── use-tasks.ts       # Task CRUD operations
│   ├── use-dashboard.ts   # Dashboard data fetching
│   └── use-error-handler.ts  # Centralized error handling
├── types/
│   └── index.ts           # Shared TypeScript types
├── middleware.ts          # Route protection middleware
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Component Patterns

### Server vs Client Components

**Use Server Components (default) for**:
- Pages that fetch data
- Static content
- Layouts
- SEO-critical content

**Example Server Component**:
```typescript
// app/tasks/page.tsx
import { getTasks } from '@/lib/api'

export default async function TasksPage() {
  const tasks = await getTasks()  // Server-side data fetching

  return (
    <div>
      <h1>My Tasks</h1>
      <TaskList tasks={tasks} />  // Pass data to client component
    </div>
  )
}
```

**Use Client Components ('use client') for**:
- Interactivity (onClick, onChange)
- State management (useState, useReducer)
- Effects (useEffect)
- Browser APIs (localStorage, window)
- Event listeners

**Example Client Component**:
```typescript
// components/ui/task-item.tsx
'use client'

import { useState } from 'react'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed)

  const handleToggle = async () => {
    await toggleTask(task.id)
    setIsCompleted(!isCompleted)
  }

  return (
    <div onClick={handleToggle}>
      {task.title}
    </div>
  )
}
```

### Component File Structure

```typescript
// components/ui/component-name.tsx

'use client'  // Only if Client Component

import { ... }  // Imports

// TypeScript interface for props
interface ComponentNameProps {
  prop1: string
  prop2?: number  // Optional prop
  onAction: () => void
}

// Component function with typed props
export function ComponentName({
  prop1,
  prop2 = 0,  // Default value
  onAction
}: ComponentNameProps) {
  // Component logic

  return (
    // JSX
  )
}
```

## API Client Patterns

All backend calls go through `lib/api.ts`:

```typescript
// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers
    }
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

// Example API methods
export const api = {
  // Tasks
  getTasks: (userId: string, status?: string) =>
    apiClient<TasksResponse>(`/api/${userId}/tasks?status=${status || 'all'}`),

  createTask: (userId: string, data: CreateTaskRequest) =>
    apiClient<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTask: (userId: string, taskId: number, data: UpdateTaskRequest) =>
    apiClient<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteTask: (userId: string, taskId: number) =>
    apiClient<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE'
    }),

  toggleComplete: (userId: string, taskId: number) =>
    apiClient<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH'
    }),

  // Dashboard
  getDashboardStats: (userId: string) =>
    apiClient<DashboardStats>(`/api/${userId}/dashboard/stats`)
}
```

## Styling Guidelines

### Tailwind CSS Best Practices

**Use Tailwind Utility Classes**:
```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// ❌ Bad
<div style={{ display: 'flex', padding: '16px', ... }}>
```

**Responsive Classes**:
```typescript
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-4   // Desktop: 4 columns
  gap-4
">
```

**State Variants**:
```typescript
<button className="
  bg-blue-500
  hover:bg-blue-600    // Hover state
  active:bg-blue-700   // Active state
  disabled:bg-gray-300 // Disabled state
  disabled:cursor-not-allowed
">
```

**Conditional Classes**:
```typescript
import { cn } from '@/lib/utils'  // clsx + tailwind-merge

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes"
)}>
```

### Component Styling Patterns

**Button Variants**:
```typescript
const buttonVariants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600"
}

<button className={cn(
  "px-4 py-2 rounded-md font-medium transition-colors",
  buttonVariants[variant]
)}>
```

## Form Validation with Zod

```typescript
// lib/validation.ts
import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional()
})

export type TaskFormData = z.infer<typeof taskSchema>
```

```typescript
// components/ui/add-task-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/validation'

export function AddTaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema)
  })

  const onSubmit = async (data: TaskFormData) => {
    await api.createTask(userId, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">Add Task</button>
    </form>
  )
}
```

## Authentication Patterns

### Better Auth Setup

```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/client"

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  jwt: {
    enabled: true,
    expiresIn: "7d"
  }
})
```

### Auth Hook

```typescript
// hooks/use-auth.ts
'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
  }, [])

  const logout = async () => {
    await auth.logout()
    setUser(null)
  }

  return { user, loading, logout }
}
```

### Protected Route Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

## Error Handling

### Centralized Error Handler

```typescript
// hooks/use-error-handler.ts
import { toast } from 'sonner'

export function useErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }
  }

  return { handleError }
}
```

### Error Boundaries

```typescript
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Try again
      </button>
    </div>
  )
}
```

## TypeScript Types

```typescript
// types/index.ts

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  completion_rate: number
  recent_activity: ActivityItem[]
}

export interface ActivityItem {
  task_id: number | null
  task_title: string
  action: 'created' | 'completed' | 'updated' | 'deleted'
  timestamp: string
}
```

## Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper focus management
- Use sufficient color contrast (WCAG AA)

```typescript
<button
  aria-label="Delete task"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
```

## Performance Optimization

- Use Server Components by default
- Lazy load heavy components
- Optimize images with next/image
- Memoize expensive calculations
- Implement optimistic UI updates

```typescript
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Lazy load component
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSkeleton />
})

// Optimized image
<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
  priority  // For above-the-fold images
/>
```

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

## Environment Variables

Create `.env.local` (never commit):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<openssl rand -base64 32>
```

---

**Frontend Status**: Ready for Phase II Implementation
**Last Updated**: 2025-12-30
**Framework Version**: Next.js 16+
**TypeScript**: Strict mode enabled
