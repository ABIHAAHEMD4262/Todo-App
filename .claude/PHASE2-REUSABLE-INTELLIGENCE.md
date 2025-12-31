# Phase 2: Reusable Intelligence - Skills & Agents

**Comprehensive Guide to Using Claude Code Skills and Agents for Phase 2 (Full-Stack Web Application)**

---

## Overview

This document describes the **Reusable Intelligence** system created for Phase 2 of the Hackathon II Todo App. By leveraging specialized **Skills** and **Agents**, you can accelerate development while maintaining high code quality and consistent patterns.

### What is Reusable Intelligence?

**Reusable Intelligence** consists of:
- **Skills**: Specialized, reusable capabilities that provide expert knowledge and code patterns
- **Agents**: Autonomous subagents that can perform complex, multi-step tasks

This earns you **+200 bonus points** for the hackathon!

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 2 ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │     SKILLS       │           │     AGENTS       │        │
│  │  (Knowledge)     │           │  (Executors)     │        │
│  ├──────────────────┤           ├──────────────────┤        │
│  │ Frontend UI      │           │ Frontend         │        │
│  │ Backend API      │           │ Specialist       │        │
│  │ Database Schema  │           │                  │        │
│  │ Auth Setup       │           │ Backend          │        │
│  │ Full-Stack       │           │ Specialist       │        │
│  │ Integration      │           │                  │        │
│  └──────────────────┘           │ FullStack        │        │
│                                 │ Architect        │        │
│                                 │                  │        │
│                                 │ Security         │        │
│                                 │ Specialist       │        │
│                                 └──────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Skills (Reusable Knowledge)

Skills are specialized knowledge bases that provide patterns, best practices, and code examples.

### 1. Frontend UI/UX Skill
**Location**: `.claude/skills/phase2-frontend-ui/SKILL.md`

**Purpose**: Expert knowledge for building Next.js 16+ frontend with React and Tailwind CSS

**Use When**:
- Creating React components
- Building responsive UI layouts
- Implementing forms with validation
- Setting up Next.js App Router pages
- Optimizing frontend performance

**Key Capabilities**:
- ✅ Next.js 16+ App Router patterns
- ✅ Server vs Client Component selection
- ✅ Tailwind CSS utility-first styling
- ✅ TypeScript type safety
- ✅ Form handling with React Hook Form + Zod
- ✅ API integration patterns

**Example Usage**:
```
"Create a task list component with filtering using the phase2-frontend-ui skill"
```

---

### 2. Backend API Skill
**Location**: `.claude/skills/phase2-backend-api/SKILL.md`

**Purpose**: Expert knowledge for building FastAPI REST APIs with SQLModel

**Use When**:
- Creating REST API endpoints
- Implementing request/response validation
- Setting up database queries
- Handling authentication and authorization
- Error handling

**Key Capabilities**:
- ✅ FastAPI route handlers
- ✅ Pydantic request/response models
- ✅ SQLModel database queries
- ✅ JWT authentication middleware
- ✅ HTTP status codes and error handling
- ✅ CORS configuration

**Example Usage**:
```
"Create CRUD API endpoints for tasks using the phase2-backend-api skill"
```

---

### 3. Database Schema Skill
**Location**: `.claude/skills/phase2-database-schema/SKILL.md`

**Purpose**: Expert knowledge for database design with SQLModel and PostgreSQL

**Use When**:
- Designing database models
- Creating relationships and foreign keys
- Adding indexes for performance
- Setting up migrations with Alembic
- Optimizing queries

**Key Capabilities**:
- ✅ SQLModel model definition
- ✅ Relationship mapping
- ✅ Index strategy
- ✅ Migration management
- ✅ Connection pooling
- ✅ Query optimization

**Example Usage**:
```
"Design the database schema for multi-user todo app using the phase2-database-schema skill"
```

---

### 4. Authentication Setup Skill
**Location**: `.claude/skills/phase2-auth-setup/SKILL.md`

**Purpose**: Expert knowledge for implementing Better Auth with JWT

**Use When**:
- Setting up Better Auth
- Creating login/signup pages
- Implementing JWT verification
- Protecting routes and endpoints
- Managing user sessions

**Key Capabilities**:
- ✅ Better Auth configuration
- ✅ JWT token handling
- ✅ Authentication pages (login/signup)
- ✅ Protected route middleware
- ✅ Backend JWT verification
- ✅ Secure token storage

**Example Usage**:
```
"Set up authentication with Better Auth using the phase2-auth-setup skill"
```

---

### 5. Full-Stack Integration Skill
**Location**: `.claude/skills/phase2-fullstack-integration/SKILL.md`

**Purpose**: Expert knowledge for connecting frontend and backend

**Use When**:
- Integrating Next.js with FastAPI
- Setting up API client configuration
- Handling CORS
- Testing end-to-end workflows
- Preparing for deployment

**Key Capabilities**:
- ✅ API client with error handling
- ✅ CORS configuration
- ✅ Environment variable setup
- ✅ Integration testing
- ✅ Docker Compose for local dev
- ✅ Deployment configurations

**Example Usage**:
```
"Integrate the frontend and backend using the phase2-fullstack-integration skill"
```

---

## Agents (Autonomous Executors)

Agents are specialized subagents that can autonomously perform complex, multi-step tasks.

### 1. Frontend Specialist Agent
**Location**: `.claude/agents/phase2-frontend-specialist.md`

**Expertise**:
- Next.js 16+ (App Router)
- React best practices
- TypeScript
- Tailwind CSS
- Form handling
- API integration

**Use When**:
- Building React components
- Creating Next.js pages
- Implementing UI/UX designs
- Handling client-side state
- Optimizing frontend performance

**Example Usage**:
```
"Ask the Frontend Specialist agent to build a task list with filtering and sorting"
```

**What It Does**:
1. Analyzes requirements
2. Defines TypeScript interfaces
3. Chooses Server vs Client Component
4. Implements component with Tailwind CSS
5. Adds accessibility features
6. Tests responsiveness

---

### 2. Backend Specialist Agent
**Location**: `.claude/agents/phase2-backend-specialist.md`

**Expertise**:
- FastAPI
- SQLModel (ORM)
- PostgreSQL
- JWT authentication
- REST API design

**Use When**:
- Creating API endpoints
- Designing database models
- Implementing business logic
- Setting up authentication
- Writing database queries

**Example Usage**:
```
"Ask the Backend Specialist agent to create the complete task management API"
```

**What It Does**:
1. Defines SQLModel database models
2. Creates Pydantic request/response schemas
3. Implements all CRUD endpoints
4. Adds JWT authentication
5. Adds authorization checks
6. Handles errors properly
7. Writes comprehensive tests

---

### 3. FullStack Architect Agent
**Location**: `.claude/agents/phase2-fullstack-architect.md`

**Expertise**:
- System architecture
- API contract design
- Frontend ↔ Backend integration
- End-to-end workflows
- Deployment coordination

**Use When**:
- Planning full-stack features
- Coordinating frontend and backend work
- Designing API contracts
- Debugging cross-stack issues
- Preparing for deployment

**Example Usage**:
```
"Ask the FullStack Architect agent to build the complete task management feature"
```

**What It Does**:
1. Reads specification
2. Designs API contract
3. Coordinates Frontend Specialist and Backend Specialist
4. Ensures type consistency
5. Tests integration
6. Prepares deployment

---

### 4. Security Specialist Agent
**Location**: `.claude/agents/phase2-security-specialist.md`

**Expertise**:
- Authentication security
- Authorization patterns
- Secure coding practices
- Input validation
- Secrets management

**Use When**:
- Setting up authentication
- Implementing JWT verification
- Adding authorization checks
- Reviewing code for security
- Handling sensitive data

**Example Usage**:
```
"Ask the Security Specialist agent to review the authentication implementation"
```

**What It Does**:
1. Reviews JWT configuration
2. Checks token expiration
3. Verifies endpoint authentication
4. Checks authorization
5. Reviews password requirements
6. Checks for hardcoded secrets
7. Verifies CORS configuration
8. Provides security recommendations

---

## How to Use Skills and Agents

### Using Skills

Skills provide knowledge and patterns. Reference them in your prompts:

**Example 1**: Direct Skill Usage
```
"Using the phase2-frontend-ui skill, create a responsive task card component"
```

**Example 2**: Combined Skills
```
"Using both phase2-frontend-ui and phase2-backend-api skills,
build the add task feature"
```

### Using Agents

Agents perform complex, multi-step tasks autonomously:

**Example 1**: Single Agent
```
"Ask the Frontend Specialist agent to build the entire task management UI"
```

**Example 2**: Agent Coordination
```
"Ask the FullStack Architect agent to coordinate the Frontend Specialist
and Backend Specialist to build the complete task feature"
```

**Example 3**: Security Review
```
"Ask the Security Specialist agent to review all authentication
and authorization code"
```

---

## Complete Workflow Example

Here's how to build the entire Phase 2 application using skills and agents:

### Step 1: Planning
```
"Ask the FullStack Architect agent to read specs/phase2-webapp/spec.md
and create an implementation plan"
```

### Step 2: Database Design
```
"Using the phase2-database-schema skill, design the database models
for users and tasks"
```

### Step 3: Backend Development
```
"Ask the Backend Specialist agent to implement all REST API endpoints
for task management with JWT authentication"
```

### Step 4: Frontend Development
```
"Ask the Frontend Specialist agent to build the complete UI including:
- Login/Signup pages
- Task list with filtering
- Add/Edit task forms
- Responsive layout"
```

### Step 5: Authentication Setup
```
"Using the phase2-auth-setup skill, integrate Better Auth on frontend
and JWT verification on backend"
```

### Step 6: Integration
```
"Using the phase2-fullstack-integration skill, connect the frontend
and backend with proper error handling"
```

### Step 7: Security Review
```
"Ask the Security Specialist agent to review all code for security
vulnerabilities and provide recommendations"
```

### Step 8: Testing
```
"Ask the FullStack Architect agent to test the complete end-to-end
workflow from login to task management"
```

---

## Benefits of Reusable Intelligence

### For Development:
- ✅ **Faster Development**: Pre-built patterns and workflows
- ✅ **Consistent Code**: Same patterns across the codebase
- ✅ **Best Practices**: Expert knowledge built-in
- ✅ **Fewer Bugs**: Proven, tested patterns

### For Learning:
- ✅ **Educational**: Learn modern patterns
- ✅ **Well-Documented**: Comprehensive examples
- ✅ **Industry Standards**: Production-ready code

### For Hackathon:
- ✅ **+200 Bonus Points**: Reusable Intelligence bonus
- ✅ **Higher Quality**: Better code quality
- ✅ **Complete Features**: More features implemented
- ✅ **Better Presentation**: Organized, professional

---

## File Structure

```
.claude/
├── skills/
│   ├── phase2-frontend-ui/
│   │   └── SKILL.md
│   ├── phase2-backend-api/
│   │   └── SKILL.md
│   ├── phase2-database-schema/
│   │   └── SKILL.md
│   ├── phase2-auth-setup/
│   │   └── SKILL.md
│   └── phase2-fullstack-integration/
│       └── SKILL.md
├── agents/
│   ├── phase2-frontend-specialist.md
│   ├── phase2-backend-specialist.md
│   ├── phase2-fullstack-architect.md
│   └── phase2-security-specialist.md
└── PHASE2-REUSABLE-INTELLIGENCE.md (this file)
```

---

## Quick Reference

### When to Use What:

| Task | Use This |
|------|----------|
| Build React component | Frontend Specialist Agent |
| Create API endpoint | Backend Specialist Agent |
| Design database | Database Schema Skill |
| Set up auth | Auth Setup Skill OR Security Specialist Agent |
| Connect frontend ↔ backend | FullStack Integration Skill |
| Build complete feature | FullStack Architect Agent |
| Security review | Security Specialist Agent |
| UI/UX patterns | Frontend UI Skill |
| API patterns | Backend API Skill |

---

## Tips for Maximum Benefit

1. **Start with Architecture**: Use FullStack Architect to plan before coding
2. **Use Specialists**: Delegate to Frontend/Backend Specialists for focused work
3. **Security First**: Involve Security Specialist early, not as afterthought
4. **Reference Skills**: Skills provide the knowledge, Agents execute
5. **Iterate**: Use agents multiple times to refine code

---

## Next Steps

1. **Review Skills**: Read each skill's SKILL.md to understand capabilities
2. **Review Agents**: Read each agent's .md to understand workflows
3. **Try Examples**: Run the example prompts above
4. **Build Phase 2**: Use agents and skills to complete the hackathon
5. **Earn Bonus**: Document your use of Reusable Intelligence (+200 points!)

---

## Questions?

For issues or questions about using skills and agents:
1. Check the individual skill/agent documentation
2. Review code examples in each file
3. Try simpler prompts first, then combine

---

**Created**: 2025-12-30
**Version**: 1.0.0
**Phase**: II - Full-Stack Web Application
**Bonus Points**: +200 for Reusable Intelligence

**Happy Coding with AI-Powered Development! 🚀**
