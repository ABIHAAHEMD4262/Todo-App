# Phase 2: Frontend UI/UX Development Skill

## Purpose
Specialized skill for building modern, responsive Next.js 16+ frontend interfaces with Tailwind CSS for the Todo Full-Stack Web Application (Phase 2).

## When to Use
- Creating new React components
- Building responsive UI layouts
- Implementing Tailwind CSS styling
- Setting up Next.js App Router pages
- Creating forms and user interactions
- Implementing client-side state management
- Optimizing frontend performance

## Tech Stack Focus
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks, Context API
- **UI Components**: Custom components (shadcn/ui optional)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Capabilities

### 1. Component Architecture
- Server Components by default (performance)
- Client Components only when needed ('use client')
- Component composition patterns
- Reusable UI component library
- Proper TypeScript types

### 2. UI/UX Best Practices
- Mobile-first responsive design
- Accessibility (ARIA labels, keyboard navigation)
- Loading states and skeletons
- Error boundaries
- Toast notifications for user feedback
- Optimistic UI updates

### 3. Tailwind CSS Mastery
- Utility-first styling
- Custom design system via tailwind.config
- Dark mode support (class strategy)
- Responsive breakpoints (sm, md, lg, xl)
- Animation and transitions
- No inline styles

### 4. Next.js App Router Patterns
- Server Components for data fetching
- Client Components for interactivity
- Loading.tsx for route loading states
- Error.tsx for error boundaries
- layout.tsx for shared layouts
- Proper use of metadata API

### 5. API Integration
- Centralized API client (lib/api.ts)
- React Query for server state (optional)
- Error handling and retries
- Authentication header injection
- Type-safe API calls

## Component Checklist

### Creating a New Component:
- [ ] Create component file in `/components` or `/app`
- [ ] Define TypeScript interface for props
- [ ] Use Server Component by default
- [ ] Add 'use client' only if needed
- [ ] Implement Tailwind CSS styling (no inline styles)
- [ ] Add proper ARIA labels for accessibility
- [ ] Handle loading and error states
- [ ] Add PropTypes or Zod schema validation
- [ ] Export component properly

### Page Creation:
- [ ] Create page.tsx in app router structure
- [ ] Define metadata export
- [ ] Fetch data in Server Component when possible
- [ ] Add loading.tsx for suspense
- [ ] Add error.tsx for error handling
- [ ] Implement responsive layout
- [ ] Test on mobile breakpoints

## Code Examples

### 1. Server Component with API Call
```typescript
// app/tasks/page.tsx
import { getTasks } from '@/lib/api'

export const metadata = {
  title: 'My Tasks',
  description: 'Manage your todo tasks',
}

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
      <TaskList tasks={tasks} />
    </div>
  )
}
```

### 2. Client Component with Interaction
```typescript
// components/task-item.tsx
'use client'

import { useState } from 'react'
import { Trash2, Edit } from 'lucide-react'

interface TaskItemProps {
  task: {
    id: number
    title: string
    completed: boolean
  }
  onUpdate: (id: number, completed: boolean) => void
  onDelete: (id: number) => void
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = () => {
    onUpdate(task.id, !task.completed)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(task.id)
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
      />

      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
        {task.title}
      </span>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        aria-label="Delete task"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}
```

### 3. Form Component with Validation
```typescript
// components/add-task-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function AddTaskForm({ onSubmit }: { onSubmit: (data: TaskFormData) => Promise<void> }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const onSubmitForm = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <input
          {...register('title')}
          id="title"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter task title..."
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Optional description..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  )
}
```

### 4. API Client
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  async getTasks(userId: string, status?: string) {
    const params = status ? `?status=${status}` : ''
    return this.request<Task[]>(`/api/${userId}/tasks${params}`)
  }

  async createTask(userId: string, data: CreateTaskData) {
    return this.request<Task>(`/api/${userId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(userId: string, taskId: number, data: Partial<Task>) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(userId: string, taskId: number) {
    return this.request<void>(`/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  async toggleComplete(userId: string, taskId: number) {
    return this.request<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    })
  }
}

export const api = new ApiClient()
```

## Phase 2 Specific Features

### Task Management UI:
- [ ] Task list with filtering (all/pending/completed)
- [ ] Add task form
- [ ] Edit task modal
- [ ] Delete confirmation dialog
- [ ] Mark complete checkbox
- [ ] Empty state when no tasks
- [ ] Loading skeletons

### Authentication UI:
- [ ] Login page
- [ ] Signup page
- [ ] Protected route wrapper
- [ ] User menu/dropdown
- [ ] Logout functionality

### Layout Components:
- [ ] Navigation header
- [ ] Sidebar (optional)
- [ ] Footer
- [ ] Page containers
- [ ] Responsive mobile menu

## Common Patterns

### Loading State:
```typescript
// app/tasks/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
```

### Error Boundary:
```typescript
// app/tasks/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}
```

## Quality Standards

### Must Have:
- ✅ TypeScript strict mode
- ✅ Responsive on mobile, tablet, desktop
- ✅ Accessible (keyboard navigation, ARIA)
- ✅ Loading states for async operations
- ✅ Error handling and user feedback
- ✅ No console errors or warnings
- ✅ Tailwind CSS only (no inline styles)

### Performance:
- ✅ Server Components by default
- ✅ Image optimization (next/image)
- ✅ Code splitting (dynamic imports when needed)
- ✅ Minimize client-side JavaScript
- ✅ Lazy load heavy components

## Example Usage

**User**: "Create a responsive task list component with filtering"

**This Skill Will**:
1. Create TaskList component with TypeScript
2. Implement filter buttons (All/Pending/Completed)
3. Add Tailwind CSS responsive styling
4. Include loading and empty states
5. Add proper ARIA labels
6. Use Server Component pattern where possible

## Integration with Workflow

```
Specify → Plan → Tasks → Frontend UI Skill → Implementation → Code Review
```

## Benefits
- ✅ Consistent Next.js 16+ patterns
- ✅ Modern React best practices
- ✅ Beautiful, accessible UI
- ✅ Type-safe implementation
- ✅ Performance optimized
- ✅ Mobile-first approach

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
