# Implementation Plan: User Authentication

**Feature**: Authentication | **Date**: 2025-12-30 | **Branch**: master
**Spec**: `specs/features/authentication/spec.md`

## Summary

Implement secure user authentication using Better Auth with JWT tokens to enable multi-user support and protect user data isolation. The system will handle user registration, login, logout, and provide JWT-based API protection.

## Technical Approach

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ──JWT──▶│    Backend   │ ──SQL──▶│  Database   │
│  (Next.js)  │         │   (FastAPI)  │         │    (Neon)   │
│             │         │              │         │             │
│ Better Auth │         │  JWT Verify  │         │ users table │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Components

**Frontend** (`frontend/`):
- `lib/auth.ts` - Better Auth client configuration
- `lib/api.ts` - API client with JWT injection
- `lib/validation.ts` - Zod schemas for forms
- `hooks/use-auth.ts` - Auth state management hook
- `components/providers/auth-provider.tsx` - Auth context provider
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `middleware.ts` - Route protection

**Backend** (`backend/app/`):
- `auth.py` - JWT verification (✅ already implemented)
- `models.py` - User model (✅ already implemented)

### Authentication Flow

1. **Signup**: User → Form → Better Auth → Hash Password → DB → Success
2. **Login**: User → Form → Better Auth → Verify → Generate JWT → Store → Redirect
3. **Protected Request**: Client → Add JWT → Backend → Verify → Authorize → Execute

## Implementation Strategy

### Phase 1: Backend Integration (✅ Complete)
- User model already defined in `backend/app/models.py`
- JWT verification already implemented in `backend/app/auth.py`
- Database migrations ready

### Phase 2: Frontend Setup (High Priority)
1. Install Better Auth and dependencies
2. Configure Better Auth client
3. Create API client with JWT headers
4. Create Zod validation schemas

### Phase 3: Auth UI (High Priority)
1. Build signup page with form validation
2. Build login page with form validation
3. Implement auth state management
4. Create auth context provider

### Phase 4: Route Protection (High Priority)
1. Implement middleware for route protection
2. Protect `/dashboard` and `/tasks` routes
3. Redirect logic for auth/unauth users

### Phase 5: Navigation & Logout (Medium Priority)
1. Create navigation component with user menu
2. Implement logout functionality
3. Display user name when logged in

### Phase 6: Testing & Polish (Medium Priority)
1. Test complete signup flow
2. Test complete login flow
3. Test route protection
4. Test logout flow
5. Test JWT verification and authorization

## Security Considerations

- **Passwords**: Hashed with bcrypt (min 8 chars)
- **JWT**: HS256, 7-day expiration, shared secret (min 32 chars)
- **Storage**: localStorage (Phase II), migrate to HTTP-only cookies (Production)
- **Authorization**: Always verify `user_id` matches JWT `sub` claim
- **Validation**: Zod (frontend) + Pydantic (backend)
- **Errors**: Generic messages (don't leak user existence)

## Dependencies

**Frontend**:
```bash
npm install better-auth zod react-hook-form @hookform/resolvers
```

**Backend**:
✅ Already installed: `python-jose`, `passlib`, `sqlmodel`

## Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<32+ char secret>
```

**Backend** (`.env`):
```
DATABASE_URL=postgresql://...  # Same as frontend
BETTER_AUTH_SECRET=<same as frontend>
FRONTEND_URL=http://localhost:3000
```

## Success Criteria

- [x] User model exists in database
- [x] JWT verification middleware implemented
- [ ] User can sign up with valid credentials
- [ ] User can log in with correct credentials
- [ ] JWT token generated and stored on login
- [ ] Protected routes redirect unauthenticated users
- [ ] User can logout and token is cleared
- [ ] Users can only access their own data

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Better Auth integration issues | Test early, have documentation ready |
| JWT secret leaked | Never commit, use .env, rotate in production |
| XSS attacks | Sanitize inputs, consider HTTP-only cookies |
| CORS misconfiguration | Test thoroughly, no wildcards in prod |

## Next Steps

1. ✅ Backend foundation complete
2. Run `/sp.tasks` to generate task breakdown
3. Implement frontend authentication UI
4. Test end-to-end authentication flow
5. Create PHR after completion
