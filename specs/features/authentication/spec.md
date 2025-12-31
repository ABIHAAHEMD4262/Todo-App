# Feature: User Authentication

## Overview
Secure user authentication system using Better Auth with JWT tokens, enabling multi-user support and protecting user data isolation.

## Hackathon Requirements
This feature fulfills the **Authentication requirement**:
- ✅ Implement user signup/signin using Better Auth
- ✅ Secure REST API with JWT tokens
- ✅ Multi-user support with data isolation

## User Stories

### US-1.1: User Registration
**As a** new user
**I want to** create an account with email and password
**So that** I can securely access my personal todo list

**Acceptance Criteria**:
- User can navigate to signup page at `/signup`
- User enters name, email, and password (min 8 characters)
- Email validation (proper format)
- Password strength validation
- Duplicate email prevented with clear error message
- Success message and redirect to login
- User record created in database with hashed password

**Validation Rules**:
- Name: Required, 1-255 characters, trimmed
- Email: Required, valid email format, max 255 characters, unique
- Password: Required, min 8 characters, max 128 characters

### US-1.2: User Login
**As a** registered user
**I want to** log in with my credentials
**So that** I can access my todo list

**Acceptance Criteria**:
- User can navigate to login page at `/login`
- User enters email and password
- Credentials validated against database
- JWT token generated and stored
- Redirect to `/dashboard` on success
- Error message for invalid credentials (generic for security)
- "Remember me" functionality (optional)

### US-1.3: User Logout
**As a** logged-in user
**I want to** log out of my account
**So that** I can protect my data on shared devices

**Acceptance Criteria**:
- Logout button visible when logged in (in header/user menu)
- Clicking logout clears authentication tokens
- User redirected to login page
- Session invalidated
- Cannot access protected pages after logout

### US-1.4: Protected Routes
**As a** system
**I want to** protect authenticated pages
**So that** only logged-in users can access their data

**Acceptance Criteria**:
- Unauthenticated users redirected to `/login`
- Authenticated users can access `/dashboard` and `/tasks`
- JWT token verified on every API request
- Token expiration handled gracefully (auto-logout)
- Auto-redirect to login on token expiry
- Middleware protects routes consistently

## Technical Specifications

### Better Auth Configuration

**Frontend Configuration** (`frontend/lib/auth.ts`)
```typescript
import { createAuthClient } from "better-auth/client"

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  jwt: {
    enabled: true,
    expiresIn: "7d"
  },
  secret: process.env.BETTER_AUTH_SECRET,
  database: {
    type: "postgres",
    url: process.env.DATABASE_URL
  }
})
```

**Backend JWT Verification** (`backend/app/auth.py`)
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.exec(
        select(User).where(User.id == user_id)
    ).first()

    if user is None:
        raise HTTPException(status_code=401)

    return user
```

### Frontend Components

**Login Page** (`app/(auth)/login/page.tsx`)
- Form with email and password fields
- Zod validation schema
- React Hook Form integration
- Error messages displayed
- JWT token stored in localStorage
- Success redirects to `/dashboard`

**Signup Page** (`app/(auth)/signup/page.tsx`)
- Form with name, email, password fields
- Zod validation schema
- React Hook Form integration
- Password strength indicator (optional)
- Error messages displayed inline
- Success redirects to `/login`

**Auth Provider** (`components/providers/auth-provider.tsx`)
- Wraps application with auth context
- Provides `useAuth` hook
- Returns: user, loading, logout function
- Handles token refresh

**Protected Route Middleware** (`middleware.ts`)
- Checks for auth token
- Redirects to `/login` if not authenticated
- Redirects to `/dashboard` if authenticated user visits `/login`
- Protects `/dashboard` and `/tasks` routes

**Navigation Component** (`components/ui/navigation.tsx`)
- Shows user name when logged in
- Logout button
- User menu dropdown
- Responsive (hamburger on mobile)

### API Endpoints

**Authentication Endpoints** (via Better Auth):
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

All other API endpoints require JWT authentication in the `Authorization: Bearer <token>` header.

### Database Schema

See @specs/database/schema.md for complete schema.

**Users Table** (Managed by Better Auth):
- id (varchar, primary key)
- email (varchar 255, unique, indexed)
- name (varchar 255)
- password_hash (varchar 255) - Better Auth manages hashing
- created_at (timestamp)

## Authentication Flow

### Registration Flow
```
1. User fills signup form (name, email, password)
   ↓
2. Frontend validates with Zod
   ↓
3. Frontend calls POST /api/auth/signup via Better Auth
   ↓
4. Better Auth hashes password (bcrypt), creates user in DB
   ↓
5. User created → Success message + redirect to /login
```

### Login Flow
```
1. User fills login form (email, password)
   ↓
2. Frontend validates with Zod
   ↓
3. Frontend calls POST /api/auth/login via Better Auth
   ↓
4. Better Auth verifies credentials, generates JWT (7-day expiration)
   ↓
5. JWT stored in localStorage (or HTTP-only cookie)
   ↓
6. Redirect to /dashboard
```

### Protected API Request Flow
```
1. Frontend makes API call (e.g., GET /api/user123/tasks)
   ↓
2. Frontend includes JWT in Authorization: Bearer <token> header
   ↓
3. Backend extracts token from header
   ↓
4. Backend verifies JWT signature and expiration
   ↓
5. Backend extracts user_id from token payload (sub claim)
   ↓
6. Backend checks user_id matches URL parameter
   ↓
7. Backend executes query filtered by user_id
   ↓
8. Backend returns user's data only
```

### Logout Flow
```
1. User clicks logout button
   ↓
2. Frontend clears JWT from localStorage
   ↓
3. Frontend calls Better Auth logout endpoint
   ↓
4. Redirect to /login page
```

## Security Specifications

### Password Security
- **Hashing**: bcrypt (handled by Better Auth)
- **Min Length**: 8 characters
- **Max Length**: 128 characters
- **Requirements**: No special requirements (optional: uppercase, number, special char)
- **Storage**: Never store plaintext passwords

### JWT Security
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Secret**: Min 32 characters, randomly generated
- **Shared Secret**: Same `BETTER_AUTH_SECRET` used by frontend and backend
- **Storage**: localStorage (or HTTP-only cookies for enhanced security)
- **Transmission**: HTTPS only in production

### Authorization Security
- JWT verification on every protected endpoint
- User ID extracted from token (sub claim)
- User ID must match URL parameter (`/api/{user_id}/...`)
- Database queries filtered by authenticated user_id
- No access to other users' data

### CORS Configuration
- Allow frontend URL only (no wildcard in production)
- Allow credentials
- Allow methods: GET, POST, PUT, PATCH, DELETE
- Allow headers: Content-Type, Authorization

### Environment Security
- No secrets in code
- Environment variables for all credentials
- `.env` files in `.gitignore`
- Different secrets for dev/prod

## Error Handling

### Frontend Errors
- **Invalid email format**: "Please enter a valid email address"
- **Password too short**: "Password must be at least 8 characters"
- **Duplicate email**: "An account with this email already exists"
- **Invalid credentials**: "Invalid email or password" (generic for security)
- **Token expired**: Auto-redirect to `/login` with message "Session expired"
- **Network errors**: "Unable to connect. Please try again."

### Backend Errors
- **401 Unauthorized**: Missing, invalid, or expired token
- **403 Forbidden**: User doesn't own the resource
- **409 Conflict**: Email already exists (signup)
- **500 Internal Server Error**: Unexpected errors (logged, generic message)

## Test Cases

### Signup
- [ ] Can sign up with valid name, email, and password
- [ ] Cannot sign up with invalid email format
- [ ] Cannot sign up with password < 8 characters
- [ ] Cannot sign up with duplicate email
- [ ] Password is hashed in database (not plaintext)
- [ ] User redirected to login after successful signup

### Login
- [ ] Can log in with correct email and password
- [ ] Cannot log in with wrong password
- [ ] Cannot log in with non-existent email
- [ ] JWT token stored after successful login
- [ ] User redirected to dashboard after login
- [ ] Error message shown for invalid credentials

### Logout
- [ ] Logout button visible when logged in
- [ ] JWT token cleared on logout
- [ ] User redirected to login page
- [ ] Cannot access protected pages after logout

### Protected Routes
- [ ] Unauthenticated user redirected from /dashboard
- [ ] Unauthenticated user redirected from /tasks
- [ ] Authenticated user can access /dashboard
- [ ] Authenticated user can access /tasks
- [ ] Authenticated user redirected from /login to /dashboard

### JWT Verification
- [ ] Valid JWT token grants access
- [ ] Expired JWT token returns 401
- [ ] Invalid JWT token returns 401
- [ ] Missing JWT token returns 401
- [ ] JWT with wrong user_id returns 403

### Authorization
- [ ] User A cannot access User B's tasks
- [ ] User A cannot update User B's task
- [ ] User A cannot delete User B's task
- [ ] API returns 403 for unauthorized access

## Environment Variables

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ character random string>
```

**Backend** (`.env`):
```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<same as frontend>
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

**Generate Secret**:
```bash
openssl rand -base64 32
```

## Dependencies

### Frontend
- `better-auth` - Authentication library
- `jose` or `jsonwebtoken` - JWT handling
- `zod` - Validation
- `react-hook-form` - Form management

### Backend
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing (used by Better Auth)
- `sqlmodel` - ORM

---

**Status**: ✅ Specification Complete
**Phase**: II
**Priority**: Critical (Required for hackathon)
**Dependencies**: Database schema must be defined
**Blocks**: All task management features require authentication
