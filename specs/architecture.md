# System Architecture - Phase II

## Overview
Phase II transforms the console app into a full-stack web application with client-server architecture, persistent storage, and secure authentication.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                  ┌──────────────────┐    │
│  │   Frontend       │                  │    Backend       │    │
│  │   (Next.js 16+)  │◄────────────────▶│   (FastAPI)      │    │
│  │                  │   REST API       │                  │    │
│  │  - Pages         │   + JWT Auth     │  - API Routes    │    │
│  │  - Components    │   + CORS         │  - Models        │    │
│  │  - Better Auth   │                  │  - Auth Middleware│   │
│  │                  │                  │  - Validation    │    │
│  └──────────────────┘                  └──────────────────┘    │
│         │                                       │               │
│         │                                       │               │
│         └──────────────┬────────────────────────┘               │
│                        │                                        │
│                        ▼                                        │
│              ┌──────────────────┐                               │
│              │  Better Auth     │                               │
│              │  (Shared State)  │                               │
│              └──────────────────┘                               │
│                        │                                        │
│                        ▼                                        │
│              ┌──────────────────┐                               │
│              │   Neon Database  │                               │
│              │   (PostgreSQL)   │                               │
│              │                  │                               │
│              │  - users         │                               │
│              │  - tasks         │                               │
│              └──────────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (Next.js 16+)
**Responsibilities**:
- User interface rendering
- Client-side routing
- Form validation
- Authentication state management
- API communication

**Key Technologies**:
- Next.js App Router (Server + Client Components)
- TypeScript for type safety
- Tailwind CSS for styling
- Better Auth for authentication
- React Hook Form + Zod for validation

**Deployment**: Vercel

### Backend (FastAPI)
**Responsibilities**:
- RESTful API endpoints
- Business logic execution
- Database operations
- JWT token verification
- Authorization checks

**Key Technologies**:
- FastAPI for API framework
- SQLModel for ORM
- Pydantic for validation
- JWT for authentication

**Deployment**: Railway or Render

### Database (Neon PostgreSQL)
**Responsibilities**:
- Persistent data storage
- User account management
- Task storage with relationships
- Data integrity enforcement

**Key Features**:
- Serverless PostgreSQL
- Automatic backups
- Connection pooling
- SSL encryption

## Authentication Flow

### Registration Flow
```
1. User fills signup form (name, email, password)
2. Frontend validates with Zod
3. Frontend calls POST /api/auth/signup via Better Auth
4. Better Auth hashes password, creates user in DB
5. User created, redirect to login page
```

### Login Flow
```
1. User fills login form (email, password)
2. Frontend validates with Zod
3. Frontend calls POST /api/auth/login via Better Auth
4. Better Auth verifies credentials, generates JWT
5. JWT stored in localStorage (or HTTP-only cookie)
6. Redirect to /dashboard page
```

### Protected API Request Flow
```
1. Frontend makes API call (e.g., GET /api/user123/tasks)
2. Frontend includes JWT in Authorization header
3. Backend extracts token from header
4. Backend verifies JWT signature and expiration
5. Backend extracts user_id from token payload
6. Backend checks user_id matches URL parameter
7. Backend executes query filtered by user_id
8. Backend returns user's tasks only
```

### Logout Flow
```
1. User clicks logout button
2. Frontend clears JWT from localStorage
3. Frontend calls Better Auth logout
4. Redirect to login page
```

## Data Flow

### Task Creation Flow
```
User → Add Task Form → Validation (Zod)
  → API Call (POST /api/{user_id}/tasks)
  → Backend Validation (Pydantic)
  → Database Insert (SQLModel)
  → Response to Frontend
  → UI Update (Optimistic)
```

### Task List Retrieval Flow
```
User → Dashboard/Tasks Page Load
  → API Call (GET /api/{user_id}/tasks?status=all)
  → Backend Query (filtered by user_id)
  → Database Select (with indexes)
  → Response to Frontend
  → UI Render (Server or Client Component)
```

## Security Architecture

### Authentication Security
- JWT tokens with 7-day expiration
- Strong secret (min 32 characters, random)
- Passwords hashed with bcrypt (Better Auth)
- HTTPS only in production
- HTTP-only cookies (preferred) or localStorage with XSS protection

### Authorization Security
- JWT verification on every protected endpoint
- User ID authorization (user owns resource)
- No direct database access without user context
- Cascade delete (tasks deleted when user deleted)

### Input Security
- Pydantic validation on all inputs (backend)
- Zod validation on all forms (frontend)
- SQL injection prevented (SQLModel parameterized queries)
- XSS prevented (React escaping by default)
- String trimming and sanitization

### API Security
- CORS configured (no wildcard in production)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting (optional, recommended for production)

## Performance Optimization

### Database Performance
- Indexes on frequently queried columns (user_id, completed)
- Composite index for common query pattern
- Connection pooling (5 connections, 10 overflow)
- Efficient queries (no N+1 problems)

### Frontend Performance
- Server Components by default (less JavaScript)
- Client Components only when needed
- Image optimization (next/image)
- Font optimization (next/font)
- Code splitting (dynamic imports)
- Optimistic UI updates

### API Performance
- Fast response times (<500ms p95)
- Efficient database queries
- Proper HTTP caching headers
- Compression (gzip)

## Scalability Considerations

### Current Phase (Phase II)
- Designed for 1000+ users
- Support 10,000+ tasks per user
- Database indexes for query performance
- Connection pooling
- Stateless API (horizontal scaling ready)

### Future Phases
- **Phase III**: Add MCP tools and OpenAI Agents SDK
- **Phase IV**: Containerization + Kubernetes orchestration
- **Phase V**: Event-driven architecture with Kafka + Dapr

## Deployment Architecture

### Development Environment
```
Localhost:3000 (Frontend) ← → Localhost:8000 (Backend)
                              ↓
                    Neon PostgreSQL (Cloud)
```

### Production Environment
```
Vercel (Frontend) ← → Railway/Render (Backend)
                       ↓
                 Neon PostgreSQL (Cloud)
```

## Error Handling Strategy

### Frontend Error Handling
- Centralized error handler hook
- Toast notifications for errors
- Redirect to login on 401
- User-friendly error messages
- Loading states during requests

### Backend Error Handling
- Global exception handlers
- Proper HTTP status codes
- Structured error responses
- Logging for debugging
- Graceful degradation

## Monitoring & Observability

### Phase II (Basic)
- Console logging
- Error tracking
- API response time monitoring

### Future Phases
- Structured logging (JSON format)
- Distributed tracing
- Metrics collection (Prometheus)
- Dashboards (Grafana)
- Alerting (PagerDuty)

---

**Architecture Status**: ✅ Approved for Phase II
**Last Updated**: 2025-12-30
**Next Review**: Phase III Planning
