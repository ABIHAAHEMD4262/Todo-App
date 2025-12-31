# Tasks: User Authentication

**Feature**: Authentication | **Date**: 2025-12-30
**Plan**: `specs/features/authentication/plan.md`

## Task Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Backend | T-AUTH-001 to T-AUTH-002 | ✅ Complete |
| Phase 2: Frontend Setup | T-AUTH-003 to T-AUTH-006 | ⏳ Pending |
| Phase 3: Auth UI | T-AUTH-007 to T-AUTH-010 | ⏳ Pending |
| Phase 4: Route Protection | T-AUTH-011 to T-AUTH-012 | ⏳ Pending |
| Phase 5: Navigation | T-AUTH-013 to T-AUTH-014 | ⏳ Pending |
| Phase 6: Testing | T-AUTH-015 | ⏳ Pending |

---

## Phase 1: Backend Foundation (✅ Complete)

### T-AUTH-001: User Model & Database ✅
**Status**: Complete
**Description**: User model and database migrations already implemented

**Completed**:
- User model exists in `backend/app/models.py`
- Alembic migrations configured
- Database schema includes users table

### T-AUTH-002: JWT Verification Middleware ✅
**Status**: Complete
**Description**: JWT verification already implemented in backend

**Completed**:
- `get_current_user()` dependency in `backend/app/auth.py`
- `verify_user_access()` helper function
- JWT token verification with Better Auth secret

---

## Phase 2: Frontend Setup

### T-AUTH-003: Install Frontend Dependencies
**Priority**: High
**Estimate**: 15 min

**Description**: Install Better Auth and related packages

**Commands**:
```bash
cd frontend
npm install better-auth zod react-hook-form @hookform/resolvers lucide-react
```

**Acceptance Criteria**:
- [ ] better-auth package installed
- [ ] zod package installed
- [ ] react-hook-form installed
- [ ] package.json updated
- [ ] No installation errors

### T-AUTH-004: Configure Better Auth Client
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-AUTH-003

**Description**: Create Better Auth client configuration

**Files to Create**:
- `frontend/lib/auth.ts`

**Implementation**:
```typescript
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})
```

**Acceptance Criteria**:
- [ ] Better Auth client created
- [ ] Configuration points to API URL
- [ ] Client exported for use in components
- [ ] Environment variable used for API URL

### T-AUTH-005: Create Validation Schemas
**Priority**: High
**Estimate**: 20 min
**Depends On**: T-AUTH-003

**Description**: Create Zod validation schemas for auth forms

**Files to Create**:
- `frontend/lib/validation.ts`

**Schemas Needed**:
```typescript
export const signupSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})
```

**Acceptance Criteria**:
- [ ] Signup schema validates name, email, password
- [ ] Login schema validates email, password
- [ ] Validation rules match spec (min/max lengths)
- [ ] Strings are trimmed
- [ ] Schemas exported

### T-AUTH-006: Create API Client with JWT
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-AUTH-004

**Description**: Create API client that includes JWT tokens in requests

**Files to Create**:
- `frontend/lib/api.ts`

**Key Methods**:
```typescript
async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
    // Handle errors (401 → logout, 403 → forbidden, etc.)
  }
  return response.json()
}
```

**Acceptance Criteria**:
- [ ] API client includes JWT in Authorization header
- [ ] Handles 401 errors (redirect to login)
- [ ] Handles 403 errors (access denied)
- [ ] Handles network errors
- [ ] TypeScript types defined

---

## Phase 3: Auth UI

### T-AUTH-007: Build Signup Page
**Priority**: High
**Estimate**: 1 hour
**Depends On**: T-AUTH-005

**Description**: Create user registration page

**Files to Create**:
- `frontend/app/(auth)/signup/page.tsx`

**Features**:
- Form with name, email, password fields
- React Hook Form integration
- Zod validation
- Loading state during submission
- Error display
- Link to login page
- Redirect to login on success

**Acceptance Criteria**:
- [ ] Page accessible at `/signup`
- [ ] Form validates with Zod schema
- [ ] Shows validation errors inline
- [ ] Submits to Better Auth signup
- [ ] Shows loading state during submit
- [ ] Redirects to `/login` on success
- [ ] Shows error message on failure
- [ ] Link to `/login` for existing users

**Test Cases**:
- [ ] Can sign up with valid data
- [ ] Shows error for invalid email
- [ ] Shows error for short password
- [ ] Shows error for empty name
- [ ] Shows error for duplicate email

### T-AUTH-008: Build Login Page
**Priority**: High
**Estimate**: 1 hour
**Depends On**: T-AUTH-005

**Description**: Create user login page

**Files to Create**:
- `frontend/app/(auth)/login/page.tsx`

**Features**:
- Form with email, password fields
- React Hook Form integration
- Zod validation
- Loading state
- Error display
- Link to signup page
- Store JWT on success
- Redirect to dashboard

**Acceptance Criteria**:
- [ ] Page accessible at `/login`
- [ ] Form validates with Zod schema
- [ ] Submits to Better Auth login
- [ ] Stores JWT token in localStorage
- [ ] Redirects to `/dashboard` on success
- [ ] Shows generic error for invalid credentials
- [ ] Link to `/signup` for new users

**Test Cases**:
- [ ] Can log in with correct credentials
- [ ] Shows error for wrong password
- [ ] Shows error for non-existent email
- [ ] JWT token stored after login

### T-AUTH-009: Create Auth Hook
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-AUTH-004

**Description**: Create `use-auth` hook for state management

**Files to Create**:
- `frontend/hooks/use-auth.ts`

**Hook Interface**:
```typescript
{
  user: User | null
  loading: boolean
  error: Error | null
  login: (credentials) => Promise<void>
  logout: () => Promise<void>
  signup: (data) => Promise<void>
}
```

**Acceptance Criteria**:
- [ ] Hook returns user, loading, error states
- [ ] Provides login, logout, signup functions
- [ ] Persists auth state across refreshes
- [ ] Checks for existing token on mount
- [ ] Updates state after login/logout

### T-AUTH-010: Create Auth Provider
**Priority**: High
**Estimate**: 30 min
**Depends On**: T-AUTH-009

**Description**: Create context provider for authentication

**Files to Create**:
- `frontend/components/providers/auth-provider.tsx`

**Files to Modify**:
- `frontend/app/layout.tsx` (wrap with provider)

**Acceptance Criteria**:
- [ ] Provider wraps app in root layout
- [ ] Provides auth context to children
- [ ] Initializes auth state on mount
- [ ] Auth state accessible via useAuth hook

---

## Phase 4: Route Protection

### T-AUTH-011: Implement Middleware
**Priority**: High
**Estimate**: 45 min
**Depends On**: T-AUTH-009

**Description**: Create middleware to protect routes

**Files to Create**:
- `frontend/middleware.ts`

**Protected Routes**:
- `/dashboard` - requires auth
- `/tasks` - requires auth

**Public Routes**:
- `/` - public
- `/login` - redirect to `/dashboard` if authenticated
- `/signup` - redirect to `/dashboard` if authenticated

**Logic**:
```typescript
if (isProtectedRoute && !hasToken) {
  return NextResponse.redirect('/login')
}
if (isAuthRoute && hasToken) {
  return NextResponse.redirect('/dashboard')
}
```

**Acceptance Criteria**:
- [ ] Unauthenticated users redirected from `/dashboard`
- [ ] Unauthenticated users redirected from `/tasks`
- [ ] Authenticated users redirected from `/login`
- [ ] Authenticated users redirected from `/signup`
- [ ] Public routes accessible to all

**Test Cases**:
- [ ] Logged out user redirected from `/dashboard`
- [ ] Logged in user redirected from `/login`
- [ ] Everyone can access `/`

### T-AUTH-012: Update Landing Page
**Priority**: Medium
**Estimate**: 15 min
**Depends On**: T-AUTH-011

**Description**: Update root page with redirect logic

**Files to Modify**:
- `frontend/app/page.tsx`

**Logic**:
- Check if user is authenticated
- Redirect to `/dashboard` if authenticated
- Redirect to `/login` if not authenticated

**Acceptance Criteria**:
- [ ] Authenticated users see `/dashboard`
- [ ] Unauthenticated users see `/login`
- [ ] No flickering during redirect

---

## Phase 5: Navigation & Logout

### T-AUTH-013: Create Navigation Component
**Priority**: Medium
**Estimate**: 45 min
**Depends On**: T-AUTH-009

**Description**: Build navigation header with user menu

**Files to Create**:
- `frontend/components/ui/navigation.tsx`

**Features**:
- App logo/name
- User name display (when logged in)
- Logout button
- Responsive design (hamburger on mobile)

**Acceptance Criteria**:
- [ ] Shows user name when logged in
- [ ] Shows logout button
- [ ] Hides user menu when logged out
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation)

### T-AUTH-014: Implement Logout
**Priority**: Medium
**Estimate**: 20 min
**Depends On**: T-AUTH-013

**Description**: Implement logout functionality

**Actions**:
1. Clear JWT from localStorage
2. Call Better Auth logout
3. Clear user state
4. Redirect to `/login`

**Acceptance Criteria**:
- [ ] Logout button triggers logout
- [ ] JWT token cleared from localStorage
- [ ] User state cleared
- [ ] Redirects to `/login`
- [ ] Cannot access protected routes after logout

**Test Cases**:
- [ ] Logout clears token
- [ ] Logout redirects to login
- [ ] Cannot access `/dashboard` after logout

---

## Phase 6: Testing & Polish

### T-AUTH-015: End-to-End Testing
**Priority**: High
**Estimate**: 1 hour

**Description**: Test complete authentication flows

**Test Scenarios**:

**Signup Flow**:
- [ ] Can sign up with valid name, email, password
- [ ] Cannot sign up with invalid email
- [ ] Cannot sign up with password < 8 chars
- [ ] Cannot sign up with duplicate email
- [ ] Password is hashed in database
- [ ] Redirected to login after signup

**Login Flow**:
- [ ] Can log in with correct credentials
- [ ] Cannot log in with wrong password
- [ ] Cannot log in with non-existent email
- [ ] JWT token stored after login
- [ ] Redirected to dashboard after login
- [ ] Generic error message shown

**Logout Flow**:
- [ ] Logout button visible when logged in
- [ ] JWT token cleared on logout
- [ ] Redirected to login after logout
- [ ] Cannot access protected routes after logout

**Route Protection**:
- [ ] Unauthenticated user redirected from `/dashboard`
- [ ] Authenticated user can access `/dashboard`
- [ ] Authenticated user redirected from `/login`

**JWT Verification**:
- [ ] Valid JWT grants access to API
- [ ] Expired JWT returns 401
- [ ] Invalid JWT returns 401
- [ ] Missing JWT returns 401

**Authorization**:
- [ ] User A cannot access User B's data
- [ ] API returns 403 for wrong user_id

**Acceptance Criteria**:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly

---

## Dependencies Graph

```
T-AUTH-001 ✅ User Model
T-AUTH-002 ✅ JWT Middleware
    │
    ├── T-AUTH-003 → Install Deps
    │       ├── T-AUTH-004 → Better Auth Client
    │       │       ├── T-AUTH-006 → API Client
    │       │       ├── T-AUTH-009 → Auth Hook
    │       │       │       ├── T-AUTH-010 → Auth Provider
    │       │       │       ├── T-AUTH-011 → Middleware
    │       │       │       │       └── T-AUTH-012 → Landing Page
    │       │       │       └── T-AUTH-013 → Navigation
    │       │       │               └── T-AUTH-014 → Logout
    │       │       └── T-AUTH-015 → Testing
    │       └── T-AUTH-005 → Validation
    │               ├── T-AUTH-007 → Signup Page
    │               └── T-AUTH-008 → Login Page
    └──────────────────────────────┘
```

## Completion Checklist

- [x] Backend foundation complete
- [ ] Frontend dependencies installed
- [ ] Better Auth configured
- [ ] Validation schemas created
- [ ] API client implemented
- [ ] Signup page working
- [ ] Login page working
- [ ] Auth state management working
- [ ] Route protection working
- [ ] Navigation with logout working
- [ ] All tests passing

**Total Tasks**: 15 (2 complete, 13 pending)
**Estimated Total Time**: ~7 hours

---

**Next Steps**:
1. Start with T-AUTH-003 (Install Dependencies)
2. Follow dependency order
3. Test each phase before moving to next
4. Create PHR after completion
