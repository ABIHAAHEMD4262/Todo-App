# UI Pages - Phase II

## Page Architecture
Using Next.js 16+ App Router with file-based routing and layouts.

## Page Structure
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/page.tsx
├── tasks/page.tsx
├── layout.tsx
└── page.tsx
```

---

## Root Layout (`app/layout.tsx`)

**Type**: Server Component

**Purpose**: Application shell with global styles and providers.

**Features**:
- HTML document structure
- Global styles (Tailwind CSS)
- Font optimization (next/font)
- Auth provider
- Toast provider (Sonner)
- Metadata configuration

**Code Structure**:
```typescript
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata = {
  title: 'Todo App - Phase II',
  description: 'Full-stack todo application'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## Landing Page (`app/page.tsx`)

**Type**: Server Component

**Purpose**: Home page with redirect logic.

**Behavior**:
- Checks authentication status
- Redirects to `/dashboard` if authenticated
- Redirects to `/login` if not authenticated
- **OR** shows landing page with features (optional)

**Code Structure**:
```typescript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }

  // Or show landing page:
  // return <LandingPage />
}
```

---

## Authentication Pages

### Login Page (`app/(auth)/login/page.tsx`)

**Type**: Client Component (in Server Component page)

**Route**: `/login`

**Purpose**: User login with email and password.

**Features**:
- Email input (validated)
- Password input (validated)
- Remember me checkbox (optional)
- Submit button with loading state
- Error messages
- Link to signup page
- Redirect to dashboard on success

**Metadata**:
```typescript
export const metadata = {
  title: 'Login - Todo App',
  description: 'Sign in to your account'
}
```

**Layout**:
```
┌────────────────────────────────┐
│      Todo App Logo             │
│                                │
│    ┌──────────────────┐        │
│    │  Welcome Back    │        │
│    │                  │        │
│    │  Email:          │        │
│    │  [______________]│        │
│    │                  │        │
│    │  Password:       │        │
│    │  [______________]│        │
│    │                  │        │
│    │  [ ] Remember me │        │
│    │                  │        │
│    │  [ Login ]       │        │
│    │                  │        │
│    │  No account?     │        │
│    │  Sign up         │        │
│    └──────────────────┘        │
└────────────────────────────────┘
```

**Validation**:
- Email: Required, valid format
- Password: Required, min 8 characters

**Protected**: No (public route)

---

### Signup Page (`app/(auth)/signup/page.tsx`)

**Type**: Client Component (in Server Component page)

**Route**: `/signup`

**Purpose**: User registration with name, email, and password.

**Features**:
- Name input (validated)
- Email input (validated)
- Password input (validated)
- Password strength indicator (optional)
- Submit button with loading state
- Error messages
- Link to login page
- Redirect to login on success

**Metadata**:
```typescript
export const metadata = {
  title: 'Sign Up - Todo App',
  description: 'Create a new account'
}
```

**Layout**:
```
┌────────────────────────────────┐
│      Todo App Logo             │
│                                │
│    ┌──────────────────┐        │
│    │  Create Account  │        │
│    │                  │        │
│    │  Name:           │        │
│    │  [______________]│        │
│    │                  │        │
│    │  Email:          │        │
│    │  [______________]│        │
│    │                  │        │
│    │  Password:       │        │
│    │  [______________]│        │
│    │  [██████░░░░░░]  │ (Strength)
│    │                  │        │
│    │  [ Sign Up ]     │        │
│    │                  │        │
│    │  Have account?   │        │
│    │  Log in          │        │
│    └──────────────────┘        │
└────────────────────────────────┘
```

**Validation**:
- Name: Required, 1-255 characters
- Email: Required, valid format, unique
- Password: Required, min 8 characters

**Protected**: No (public route)

---

## Dashboard Page (`app/dashboard/page.tsx`)

**Type**: Server Component

**Route**: `/dashboard`

**Purpose**: User dashboard with statistics and overview.

**Features**:
- Navigation header
- 4 statistics cards (total, pending, completed, rate)
- Progress bar
- Recent activity feed
- Quick actions
- Loading state (`loading.tsx`)
- Error boundary (`error.tsx`)

**Metadata**:
```typescript
export const metadata = {
  title: 'Dashboard - Todo App',
  description: 'Your task dashboard'
}
```

**Layout (Desktop)**:
```
┌────────────────────────────────────────────────┐
│  [Logo] Dashboard | Tasks          [User ▼]   │
├────────────────────────────────────────────────┤
│                                                │
│  Dashboard                                     │
│                                                │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │
│  │📊25 │  │⏳10 │  │✅15 │  │📈60%│          │
│  │Total│  │Pend │  │Done │  │Comp │          │
│  └─────┘  └─────┘  └─────┘  └─────┘          │
│                                                │
│  Progress: [████████░░░░░░░] 60%             │
│                                                │
│  ┌──────────────────┐  ┌──────────────┐      │
│  │ Recent Activity  │  │ Quick Actions│      │
│  │ • Completed task │  │ [+ Add Task] │      │
│  │ • Created task   │  │ [View All]   │      │
│  │ • Updated task   │  │              │      │
│  └──────────────────┘  └──────────────┘      │
│                                                │
└────────────────────────────────────────────────┘
```

**Data Fetching**:
```typescript
import { getDashboardStats } from '@/lib/api'
import { getSession } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getSession()
  const stats = await getDashboardStats(session.user.id)

  return <DashboardView stats={stats} />
}
```

**Protected**: Yes (requires authentication)

---

## Tasks Page (`app/tasks/page.tsx`)

**Type**: Server Component

**Route**: `/tasks`

**Purpose**: Main task management page.

**Features**:
- Navigation header
- Add task form (top)
- Task filter buttons (All, Pending, Completed)
- Task list with all user's tasks
- Loading state (`loading.tsx`)
- Error boundary (`error.tsx`)
- Empty state when no tasks

**Metadata**:
```typescript
export const metadata = {
  title: 'Tasks - Todo App',
  description: 'Manage your tasks'
}
```

**Query Parameters**:
- `status`: Filter tasks (`all`, `pending`, `completed`)

**Layout**:
```
┌────────────────────────────────────────────────┐
│  [Logo] Dashboard | Tasks          [User ▼]   │
├────────────────────────────────────────────────┤
│                                                │
│  My Tasks                                      │
│                                                │
│  Add New Task:                                 │
│  Title: [_______________________________]      │
│  Desc:  [_______________________________]      │
│  [ + Add Task ]                                │
│                                                │
│  [All] [Pending] [Completed]                   │
│                                                │
│  ┌──────────────────────────────────┐          │
│  │ ☐ Buy groceries          [Edit][×]│          │
│  │   Milk, eggs, bread              │          │
│  └──────────────────────────────────┘          │
│  ┌──────────────────────────────────┐          │
│  │ ☑ Call dentist           [Edit][×]│          │
│  └──────────────────────────────────┘          │
│  ┌──────────────────────────────────┐          │
│  │ ☐ Finish Phase 2         [Edit][×]│          │
│  │   Todo web app                   │          │
│  └──────────────────────────────────┘          │
│                                                │
└────────────────────────────────────────────────┘
```

**Data Fetching**:
```typescript
import { getTasks } from '@/lib/api'
import { getSession } from '@/lib/auth'

export default async function TasksPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const session = await getSession()
  const status = searchParams.status || 'all'
  const tasks = await getTasks(session.user.id, status)

  return <TasksView tasks={tasks} status={status} />
}
```

**Protected**: Yes (requires authentication)

---

## Loading States

### Dashboard Loading (`app/dashboard/loading.tsx`)
```typescript
export default function DashboardLoading() {
  return <DashboardSkeleton />
}
```

### Tasks Loading (`app/tasks/loading.tsx`)
```typescript
export default function TasksLoading() {
  return <TaskListSkeleton />
}
```

**Features**:
- Skeleton screens with shimmer animation
- Maintain layout (no layout shift)
- Show while data fetching

---

## Error Boundaries

### Dashboard Error (`app/dashboard/error.tsx`)
```typescript
'use client'

export default function DashboardError({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Tasks Error (`app/tasks/error.tsx`)
Similar to dashboard error.

**Features**:
- Catches errors during rendering/data fetching
- Shows user-friendly message
- Retry button
- Logs error for debugging

---

## Middleware Protection (`middleware.ts`)

**Purpose**: Protect authenticated routes.

**Routes Protected**:
- `/dashboard`
- `/tasks`
- `/profile` (if implemented)

**Redirect Logic**:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/tasks')

  // Redirect to login if accessing protected page without token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing auth page with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Hamburger menu
- Stacked stat cards
- Full-width components

### Tablet (640px - 1024px)
- 2-column layout for cards
- Side menu (collapsible)
- Comfortable spacing

### Desktop (> 1024px)
- 4-column layout for cards
- Full navigation menu
- Optimal whitespace
- 2-column option for tasks

---

## SEO Considerations

### Metadata
Each page has appropriate:
- `title`: Page title in browser tab
- `description`: Meta description for SEO
- `openGraph`: Social media sharing (optional)

### Performance
- Server-side rendering for initial load
- Lazy loading images
- Code splitting
- Optimized fonts (next/font)

---

## Navigation Flow

```
Landing (/) → Login (/login) → Dashboard (/dashboard)
                  ↓
            Signup (/signup) → Login (/login)

Dashboard (/dashboard) ↔ Tasks (/tasks)
            ↓
         Logout → Login
```

---

**Page Specifications Status**: ✅ Complete for Phase II
**Last Updated**: 2025-12-30
**Framework**: Next.js 16+ (App Router)
**Styling**: Tailwind CSS
