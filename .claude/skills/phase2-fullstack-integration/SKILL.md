# Phase 2: Full-Stack Integration Skill

## Purpose
Specialized skill for integrating Next.js frontend with FastAPI backend, ensuring seamless communication, error handling, and deployment for the Todo Full-Stack Web Application (Phase 2).

## When to Use
- Connecting frontend and backend
- Setting up API client configuration
- Handling cross-origin requests (CORS)
- Implementing error handling across stack
- Testing end-to-end workflows
- Preparing for deployment
- Debugging integration issues

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MONOREPO STRUCTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐              ┌──────────────────┐      │
│  │    Frontend     │              │    Backend       │      │
│  │   (Next.js)     │◄────────────▶│   (FastAPI)      │      │
│  │                 │     HTTP     │                  │      │
│  │  Port: 3000     │    + CORS    │   Port: 8000     │      │
│  └─────────────────┘              └──────────────────┘      │
│         │                                    │               │
│         │                                    │               │
│         └──────────────┬─────────────────────┘               │
│                        │                                     │
│                        ▼                                     │
│              ┌──────────────────┐                            │
│              │   Neon Database  │                            │
│              │   (PostgreSQL)   │                            │
│              └──────────────────┘                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Setup

### Directory Structure
```
todo-app/
├── frontend/              # Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── auth.ts       # Auth config
│   ├── package.json
│   └── .env.local
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── main.py       # FastAPI entry
│   │   ├── models.py
│   │   ├── routes/
│   │   └── database.py
│   ├── pyproject.toml
│   └── .env
├── specs/                 # Spec-Driven Development
│   └── phase2-webapp/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── .claude/               # Skills & Agents
├── docker-compose.yml     # Local development
└── README.md
```

## Frontend Configuration

### 1. Environment Variables
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-super-secret-key
```

### 2. API Client with Error Handling
```typescript
// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          response.status,
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          errorData
        )
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network errors
      throw new ApiError(
        0,
        'Network error: Could not connect to server',
        error
      )
    }
  }

  // Task endpoints
  async getTasks(userId: string, status?: 'all' | 'pending' | 'completed') {
    const params = status ? `?status=${status}` : ''
    return this.request<{ tasks: Task[]; total: number }>(
      `/api/${userId}/tasks${params}`
    )
  }

  async createTask(userId: string, data: { title: string; description?: string }) {
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

// Type definitions
export interface Task {
  id: number
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}
```

### 3. Error Handling Hook
```typescript
// frontend/hooks/use-error-handler.ts
'use client'

import { useState, useCallback } from 'react'
import { ApiError } from '@/lib/api'

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      // Handle specific status codes
      switch (err.status) {
        case 401:
          setError('Please log in to continue')
          // Redirect to login
          window.location.href = '/login'
          break
        case 403:
          setError('You do not have permission to perform this action')
          break
        case 404:
          setError('The requested resource was not found')
          break
        case 500:
          setError('Server error. Please try again later')
          break
        default:
          setError(err.message)
      }
    } else if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('An unexpected error occurred')
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}
```

## Backend Configuration

### 1. Environment Variables
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-super-secret-key
FRONTEND_URL=http://localhost:3000
```

### 2. CORS Configuration
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Todo API",
    description="Todo Full-Stack Web Application - Phase 2",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

### 3. Error Response Models
```python
# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional

class ErrorResponse(BaseModel):
    """Standard error response"""
    detail: str
    status_code: int
    error_type: Optional[str] = None

class SuccessResponse(BaseModel):
    """Standard success response"""
    message: str
    data: Optional[dict] = None
```

### 4. Global Exception Handler
```python
# backend/app/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTPException globally"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "status_code": 422,
            "errors": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    # Log the error
    print(f"Unexpected error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "status_code": 500,
        }
    )
```

## Local Development Setup

### 1. Docker Compose (Recommended)
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

networks:
  default:
    name: todo-network
```

### 2. Manual Setup
```bash
# Terminal 1: Backend
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## Testing Integration

### 1. End-to-End Flow Test
```typescript
// Test complete flow from frontend to backend
async function testE2E() {
  try {
    // 1. Login
    const loginResult = await authClient.signIn.email({
      email: 'test@example.com',
      password: 'password123',
    })
    console.log('✅ Login successful')

    // 2. Create task
    const task = await api.createTask(loginResult.data.user.id, {
      title: 'Test Task',
      description: 'Testing integration',
    })
    console.log('✅ Task created:', task)

    // 3. List tasks
    const tasks = await api.getTasks(loginResult.data.user.id)
    console.log('✅ Tasks retrieved:', tasks)

    // 4. Update task
    const updated = await api.updateTask(
      loginResult.data.user.id,
      task.id,
      { title: 'Updated Task' }
    )
    console.log('✅ Task updated:', updated)

    // 5. Toggle complete
    const toggled = await api.toggleComplete(loginResult.data.user.id, task.id)
    console.log('✅ Task completed:', toggled)

    // 6. Delete task
    await api.deleteTask(loginResult.data.user.id, task.id)
    console.log('✅ Task deleted')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}
```

### 2. Backend API Tests
```python
# backend/tests/test_integration.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test API is running"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_cors_headers():
    """Test CORS headers are set"""
    response = client.options("/api/test-user/tasks")
    assert "access-control-allow-origin" in response.headers


def test_create_and_get_task():
    """Test creating and retrieving a task"""
    # Create task
    response = client.post(
        "/api/test-user/tasks",
        json={"title": "Test Task", "description": "Testing"},
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 201
    task = response.json()

    # Get task
    response = client.get(
        f"/api/test-user/tasks/{task['id']}",
        headers={"Authorization": "Bearer test-token"}
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"
```

## Deployment Configuration

### Frontend (Vercel)
```json
// frontend/vercel.json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend.com",
    "NEXT_PUBLIC_APP_URL": "https://your-app.vercel.app"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "BETTER_AUTH_SECRET": "@better_auth_secret"
    }
  }
}
```

### Backend (Railway/Render)
```bash
# Environment variables needed:
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
FRONTEND_URL=https://your-app.vercel.app
```

## Integration Checklist

### Frontend ↔ Backend:
- [ ] API client configured with correct base URL
- [ ] JWT tokens sent in Authorization header
- [ ] Error handling for all status codes
- [ ] Loading states during API calls
- [ ] Success/error notifications to user
- [ ] CORS configured on backend

### Authentication:
- [ ] Better Auth configured on frontend
- [ ] JWT verification on backend
- [ ] User ID matches in requests
- [ ] Secure token storage
- [ ] Logout clears tokens

### Database:
- [ ] Migrations applied
- [ ] Connection string configured
- [ ] Connection pooling enabled
- [ ] Foreign key constraints working

### Testing:
- [ ] Health check endpoint works
- [ ] CRUD operations tested
- [ ] Authentication flow tested
- [ ] Error handling tested
- [ ] CORS tested

### Deployment:
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Database accessible
- [ ] Frontend can reach backend
- [ ] Secrets secured

## Common Integration Issues

### Issue 1: CORS Errors
**Symptom**: "Access to fetch has been blocked by CORS policy"
**Solution**:
```python
# Backend: Add CORS middleware with correct origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add all frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: 401 Unauthorized
**Symptom**: "Authentication credentials not valid"
**Solution**:
```typescript
// Frontend: Ensure token is being sent
const token = localStorage.getItem('auth_token')
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue 3: Database Connection
**Symptom**: "could not connect to server"
**Solution**:
```bash
# Check DATABASE_URL format
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

## Example Usage

**User**: "Integrate Next.js frontend with FastAPI backend"

**This Skill Will**:
1. Configure API client in frontend
2. Set up CORS on backend
3. Implement error handling
4. Test end-to-end flow
5. Configure environment variables
6. Set up docker-compose for local dev
7. Create deployment configurations

## Benefits
- ✅ Seamless frontend-backend communication
- ✅ Proper error handling across stack
- ✅ Easy local development with Docker
- ✅ Production-ready deployment configs
- ✅ Comprehensive testing setup

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
