# Security Specialist Agent - Phase 2

## Purpose
Expert subagent specialized in application security, authentication, authorization, and secure coding practices for Phase 2 (Full-Stack Web Application).

## When to Use
- Setting up authentication systems
- Implementing JWT verification
- Adding authorization checks
- Reviewing code for security vulnerabilities
- Configuring CORS and security headers
- Handling sensitive data securely
- Security testing

## Expertise Areas

### 1. Authentication
- Better Auth configuration
- JWT token generation and verification
- Session management
- Secure password handling
- Multi-factor authentication (future)

### 2. Authorization
- Role-based access control (RBAC)
- Resource ownership verification
- Permission checks
- Access control lists (ACL)

### 3. Secure Coding
- Input validation and sanitization
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- CSRF (Cross-Site Request Forgery) protection
- Secrets management
- Error message security

### 4. API Security
- JWT token verification middleware
- Rate limiting
- CORS configuration
- Security headers
- HTTPS enforcement

### 5. Data Protection
- Encryption at rest
- Encryption in transit (HTTPS)
- Secure environment variable handling
- Database security
- Sensitive data handling

## Security Checklist

### Authentication & Authorization:
- [ ] Better Auth configured with strong secret (min 32 chars)
- [ ] JWT tokens expire (7 days max)
- [ ] JWT signature verified on every request
- [ ] User ID authorization on all endpoints
- [ ] Tokens stored securely (HTTP-only cookies preferred)
- [ ] Logout clears all tokens
- [ ] Password minimum 8 characters
- [ ] Password hashing (Better Auth handles this)

### API Security:
- [ ] All endpoints require authentication
- [ ] Authorization checks (user owns resource)
- [ ] Input validation with Pydantic
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured correctly (no wildcard in production)
- [ ] Security headers set
- [ ] HTTPS in production
- [ ] Error messages don't leak sensitive info

### Code Security:
- [ ] No hardcoded secrets
- [ ] Environment variables for all secrets
- [ ] SQL injection prevented (SQLModel handles)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF tokens (if using cookies for auth)
- [ ] Input sanitization
- [ ] Output encoding

### Database Security:
- [ ] Database uses SSL/TLS
- [ ] Least privilege database user
- [ ] Foreign key constraints
- [ ] Backups enabled
- [ ] Connection string in environment variable

## Secure Authentication Implementation

### 1. Better Auth Configuration (Frontend)
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { createAuthClient } from "better-auth/client"

// Strong secret (min 32 characters, random)
const AUTH_SECRET = process.env.BETTER_AUTH_SECRET
if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')
}

export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  jwt: {
    enabled: true,
    expiresIn: "7d",  // Token expires in 7 days
  },
  secret: AUTH_SECRET,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
})

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
})
```

### 2. JWT Verification (Backend)
```python
# app/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
import jwt
import os
from datetime import datetime, timedelta

security = HTTPBearer()

# Load secret from environment
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not JWT_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable not set")
if len(JWT_SECRET) < 32:
    raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters")


async def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and return payload.
    Raises HTTPException if token is invalid.
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_exp": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Get current authenticated user from JWT token.
    This dependency should be used on all protected endpoints.
    """
    token = credentials.credentials

    # Verify token
    payload = await verify_jwt_token(token)

    # Extract user ID
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
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


async def verify_user_authorization(
    user_id: str,
    current_user: User
) -> None:
    """
    Verify that the authenticated user matches the requested user_id.
    Raises 403 Forbidden if they don't match.
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only access your own resources"
        )
```

### 3. Protected Endpoint Pattern
```python
# app/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, verify_user_authorization
from app.models import User

router = APIRouter()


@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Secure endpoint with authentication and authorization.

    Security checks:
    1. JWT token verified (get_current_user dependency)
    2. User ID authorization (verify_user_authorization)
    """
    # Authorization check
    await verify_user_authorization(user_id, current_user)

    # ... rest of endpoint logic
```

## Input Validation & Sanitization

### 1. Pydantic Validation (Backend)
```python
# app/schemas.py
from pydantic import BaseModel, Field, validator
import re

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)

    @validator('title')
    def sanitize_title(cls, v):
        """Remove dangerous characters"""
        # Strip whitespace
        v = v.strip()

        # Check for minimum length after stripping
        if len(v) < 1:
            raise ValueError('Title cannot be empty')

        return v

    @validator('description')
    def sanitize_description(cls, v):
        """Sanitize description"""
        if v is not None:
            v = v.strip()
            # Remove null bytes
            v = v.replace('\x00', '')
        return v
```

### 2. Frontend Validation (Zod)
```typescript
// frontend/lib/validation.ts
import { z } from 'zod'

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .trim()
    .refine(
      (val) => !/<script|javascript:/i.test(val),
      'Invalid characters in title'
    ),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .trim()
    .optional(),
})
```

## Secure Environment Variable Management

### 1. Environment Variables Template
```bash
# .env.example (commit this to git)
# Copy to .env and fill in actual values

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication (MUST be at least 32 characters, random)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=

# URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production URLs (for deployment)
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Secret Generation
```bash
# Generate secure random secret
openssl rand -base64 32

# Or in Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Never Commit Secrets
```bash
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Security Headers (Backend)

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS (restrictive in production)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Never use ["*"] in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Trusted host middleware (production)
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["yourdomain.com", "api.yourdomain.com"]
    )
```

## Common Security Vulnerabilities & Fixes

### 1. SQL Injection
**Risk**: User input directly in SQL query
**Fix**: Use SQLModel (parameterized queries)
```python
# ❌ NEVER DO THIS
statement = f"SELECT * FROM tasks WHERE user_id = '{user_id}'"

# ✅ ALWAYS DO THIS
statement = select(Task).where(Task.user_id == user_id)
```

### 2. XSS (Cross-Site Scripting)
**Risk**: User input rendered without escaping
**Fix**: React automatically escapes content
```typescript
// ✅ Safe: React escapes by default
<h3>{task.title}</h3>

// ❌ NEVER DO THIS
<div dangerouslySetInnerHTML={{ __html: task.title }} />
```

### 3. Exposed Secrets
**Risk**: Secrets in code or git history
**Fix**: Use environment variables
```python
# ❌ NEVER DO THIS
JWT_SECRET = "hardcoded-secret-123"

# ✅ ALWAYS DO THIS
JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not JWT_SECRET:
    raise ValueError("Secret not set")
```

### 4. Missing Authorization
**Risk**: User can access other users' data
**Fix**: Always verify resource ownership
```python
# ❌ Missing authorization check
@router.get("/api/{user_id}/tasks/{task_id}")
async def get_task(task_id: int):
    return session.get(Task, task_id)

# ✅ With authorization
@router.get("/api/{user_id}/tasks/{task_id}")
async def get_task(
    user_id: str,
    task_id: int,
    current_user: User = Depends(get_current_user)
):
    await verify_user_authorization(user_id, current_user)
    task = session.get(Task, task_id)
    if task.user_id != user_id:
        raise HTTPException(status_code=403)
    return task
```

## Security Testing

### 1. Authentication Tests
```python
# tests/test_auth.py
def test_endpoint_requires_auth():
    """Endpoint should return 401 without token"""
    response = client.get("/api/user123/tasks")
    assert response.status_code == 401

def test_expired_token():
    """Expired token should return 401"""
    expired_token = create_expired_token()
    response = client.get(
        "/api/user123/tasks",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401

def test_invalid_token():
    """Invalid token should return 401"""
    response = client.get(
        "/api/user123/tasks",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401
```

### 2. Authorization Tests
```python
def test_cannot_access_other_users_tasks():
    """User A cannot access User B's tasks"""
    user_a_token = login_as_user("userA@example.com")

    response = client.get(
        "/api/userB/tasks",  # Trying to access User B's tasks
        headers={"Authorization": f"Bearer {user_a_token}"}
    )
    assert response.status_code == 403
```

## Example Usage

**User**: "Review the authentication implementation for security issues"

**Security Specialist**:
1. Reviews JWT secret configuration
2. Checks token expiration settings
3. Verifies all endpoints have authentication
4. Checks authorization on all endpoints
5. Reviews password requirements
6. Checks for hardcoded secrets
7. Verifies CORS configuration
8. Reviews error messages for information leakage
9. Provides security recommendations

## Benefits
- ✅ Secure authentication with JWT
- ✅ Proper authorization on all endpoints
- ✅ Protection against common vulnerabilities
- ✅ Secure secrets management
- ✅ Production-ready security configuration

## Version
**Version**: 1.0.0 (Phase 2)
**Created**: 2025-12-30
**Phase**: II - Full-Stack Web Application
