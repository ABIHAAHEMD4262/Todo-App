# Phase 2: Authentication Setup Skill

## Purpose
Specialized skill for implementing secure authentication using Better Auth with JWT tokens for the Todo Full-Stack Web Application (Phase 2).

## When to Use
- Setting up Better Auth in Next.js frontend
- Implementing JWT authentication
- Creating login/signup pages
- Protecting routes and API endpoints
- Managing user sessions
- Integrating auth with FastAPI backend

## Tech Stack Focus
- **Frontend Auth**: Better Auth (Next.js)
- **Backend Auth**: JWT token verification (FastAPI)
- **Token Type**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies + localStorage fallback
- **Security**: Secure secrets, token expiration, refresh tokens

## Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  Frontend   │────1───▶│ Better Auth │────2───▶│  Neon DB    │
│  (Next.js)  │         │  (Next.js)  │         │  (users)    │
│             │◀───3────│             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │
      │ 4. Include JWT in API calls
      ▼
┌─────────────┐         ┌─────────────┐
│             │         │             │
│  FastAPI    │────5───▶│   Verify    │
│  Backend    │         │   JWT       │
│             │◀───6────│   Token     │
└─────────────┘         └─────────────┘
```

## Better Auth Setup (Frontend)

### 1. Installation
```bash
cd frontend
npm install better-auth
```

### 2. Better Auth Configuration
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { createAuthClient } from "better-auth/client"

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
  jwt: {
    enabled: true,
    expiresIn: "7d",
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
    process.env.NEXT_PUBLIC_API_URL!,
  ],
})

// Client-side auth
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
})
```

### 3. Environment Variables
```bash
# frontend/.env.local
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Auth API Route
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

## Frontend Authentication Components

### 1. Signup Page
```typescript
// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      // Redirect to login or tasks page
      router.push('/login')
    } catch (err) {
      setError('An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">At least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
```

### 2. Login Page
```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      })

      if (result.error) {
        setError(result.error.message)
        return
      }

      // Store token for API calls
      if (result.data?.accessToken) {
        localStorage.setItem('auth_token', result.data.accessToken)
      }

      // Redirect to tasks page
      router.push('/tasks')
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Log In</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

### 3. Protected Route Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('better-auth.session_token')?.value

  // Protected routes
  const protectedRoutes = ['/tasks', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to tasks if accessing auth pages with token
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/tasks', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tasks/:path*', '/profile/:path*', '/login', '/signup'],
}
```

### 4. User Context Hook
```typescript
// hooks/use-auth.ts
'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((session) => {
      setUser(session?.user || null)
      setLoading(false)
    })
  }, [])

  const logout = async () => {
    await authClient.signOut()
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return { user, loading, logout }
}
```

## Backend JWT Verification (FastAPI)

### 1. JWT Verification Middleware
```python
# app/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
import jwt
import os

security = HTTPBearer()
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")

if not JWT_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable not set")


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Verify JWT token from Better Auth and return current user.
    Token is expected in Authorization: Bearer <token> header.
    """
    token = credentials.credentials

    try:
        # Decode JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
```

### 2. Protected Endpoint Example
```python
# app/routes/tasks.py
from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.models import User

router = APIRouter()


@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    List tasks for authenticated user.
    Automatically verifies JWT token and checks authorization.
    """
    # Verify user_id matches authenticated user
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # ... rest of endpoint logic
```

## Security Checklist

### Must Implement:
- [ ] BETTER_AUTH_SECRET is strong (min 32 characters)
- [ ] JWT tokens expire (7 days max)
- [ ] Tokens stored securely (HTTP-only cookies preferred)
- [ ] HTTPS in production
- [ ] CORS configured correctly
- [ ] Password minimum 8 characters
- [ ] Rate limiting on auth endpoints
- [ ] User input validation

### Backend Security:
- [ ] JWT verification on all protected endpoints
- [ ] User authorization checks (owns resource)
- [ ] Environment variables for secrets
- [ ] No secrets in code
- [ ] Proper error messages (don't leak info)
- [ ] SQL injection prevention (SQLModel handles)

### Frontend Security:
- [ ] Protected routes with middleware
- [ ] Logout clears tokens
- [ ] Token refresh on expiration
- [ ] No sensitive data in localStorage
- [ ] XSS prevention (React handles)

## Common Auth Flows

### 1. New User Registration
```
User → Signup Form → Better Auth → Database → Redirect to Login
```

### 2. User Login
```
User → Login Form → Better Auth → Generate JWT → Store Token → Redirect to App
```

### 3. Protected API Call
```
Frontend → Include JWT in Header → FastAPI → Verify JWT → Check Authorization → Return Data
```

### 4. Logout
```
User → Logout Button → Clear Token → Redirect to Login
```

## Example Usage

**User**: "Set up authentication for the todo app with Better Auth"

**This Skill Will**:
1. Install and configure Better Auth
2. Create signup/login pages
3. Implement JWT token handling
4. Set up protected routes
5. Add JWT verification to FastAPI
6. Create user context hook
7. Configure environment variables
8. Test authentication flow

## Benefits
- ✅ Secure JWT-based authentication
- ✅ User isolation (each user sees only their data)
- ✅ Easy Better Auth integration
- ✅ Protected routes and API endpoints
- ✅ Production-ready security

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
