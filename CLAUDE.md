# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

---

# Hackathon II - Project-Specific Instructions

## Project Overview
**Todo App - Spec-Driven Development Hackathon**

Current Phase: **Phase II - Full-Stack Web Application**

Transform console app into a modern web application with:
- Next.js 16+ frontend
- FastAPI backend
- Neon PostgreSQL database
- Better Auth authentication
- Multi-user support

## Spec-Kit Organization

Specifications are organized in `/specs` following Spec-Kit conventions:

### Core Specs
- **`specs/overview.md`** - Project goals, tech stack, success criteria
- **`specs/architecture.md`** - System architecture, auth flow, data flow

### Feature Specs (`specs/features/`)
- **`task-crud.md`** - 5 Basic Level features (Add, View, Update, Delete, Mark Complete)
- **`authentication.md`** - User signup/login with Better Auth + JWT
- **`dashboard.md`** - Task statistics and activity feed (bonus feature)

### Technical Specs
- **`specs/api/rest-endpoints.md`** - Complete REST API documentation
- **`specs/database/schema.md`** - Database schema, indexes, migrations
- **`specs/ui/components.md`** - Component specifications
- **`specs/ui/pages.md`** - Page specifications

### Legacy Specs
- **`specs/phase2-webapp/`** - Original consolidated specs (spec.md, plan.md, tasks.md)

## Project Structure

```
hackathon-todo/
├── .spec-kit/config.yaml   # Spec-Kit configuration
├── specs/                  # Organized specifications
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── frontend/               # Next.js 16+ (App Router)
│   ├── CLAUDE.md          # Frontend-specific instructions
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   ├── lib/               # API client, utilities
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript types
├── backend/                # FastAPI
│   ├── CLAUDE.md          # Backend-specific instructions
│   ├── app/
│   │   ├── main.py        # Entry point
│   │   ├── models.py      # SQLModel models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── routes/        # API endpoints
│   │   └── auth.py        # JWT verification
│   └── migrations/        # Alembic
├── .claude/                # Reusable Intelligence
│   ├── skills/            # Domain expertise
│   └── agents/            # Autonomous specialists
└── CLAUDE.md              # This file
```

## Technology Stack

**Frontend**: Next.js 16+, TypeScript, Tailwind CSS, Better Auth
**Backend**: FastAPI, SQLModel, Pydantic v2
**Database**: Neon Serverless PostgreSQL
**Authentication**: Better Auth + JWT
**Deployment**: Vercel (frontend), Railway/Render (backend)

## Development Workflow

### Reading Specs
Always read relevant specs before implementing:

```
For authentication:
→ @specs/features/authentication.md
→ @specs/api/rest-endpoints.md (auth section)
→ @specs/database/schema.md (users table)
→ @backend/CLAUDE.md (backend patterns)
→ @frontend/CLAUDE.md (frontend patterns)
```

### Spec References
Use `@` to reference specs in conversations:
```
@specs/features/task-crud.md
@specs/api/rest-endpoints.md
@specs/database/schema.md
```

### Implementation Flow
```
1. Read feature spec → Understand requirements
2. Check API spec → Understand contracts
3. Check database spec → Understand schema
4. Implement backend → @backend/CLAUDE.md
5. Implement frontend → @frontend/CLAUDE.md
6. Test → Verify all acceptance criteria
```

## Hackathon Requirements (Phase II)

### Required Features (Basic Level)
1. ✅ Add Task
2. ✅ View Task List
3. ✅ Update Task
4. ✅ Delete Task
5. ✅ Mark as Complete

### Required: Authentication
- ✅ User Signup/Signin (Better Auth)
- ✅ JWT token authentication
- ✅ Protected routes and API endpoints

### Bonus: Dashboard (Optional)
- ✅ Task statistics (total, pending, completed, rate)
- ✅ Recent activity feed
- ✅ Quick actions

### Submission Requirements
- Public GitHub repository
- Deployed app (Vercel + Railway/Render)
- Demo video (max 90 seconds)
- README with setup instructions
- All specifications documented

**Due Date**: December 14, 2025

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
npm run build
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
alembic upgrade head     # Run migrations
```

### API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<openssl rand -base64 32>
```

### Backend (.env)
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<same as frontend>
FRONTEND_URL=http://localhost:3000
```

## Reusable Intelligence

### Skills (.claude/skills/)
- `phase2-frontend-ui` - Next.js 16+ patterns
- `phase2-backend-api` - FastAPI patterns
- `phase2-database-schema` - SQLModel patterns
- `phase2-auth-setup` - Better Auth + JWT
- `phase2-fullstack-integration` - Frontend ↔ Backend

### Agents (.claude/agents/)
- `phase2-frontend-specialist` - Frontend implementation
- `phase2-backend-specialist` - Backend implementation
- `phase2-fullstack-architect` - System design
- `phase2-security-specialist` - Security review

## Key Resources

- **Hackathon Instructions**: `Hackathon II - Todo Spec-Driven Development.md`
- **Submission Form**: https://forms.gle/KMKEKaFUD6ZX4UtY8
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Better Auth Docs**: https://better-auth.com/

---

**Status**: Phase II In Progress
**Last Updated**: 2025-12-30
**Next Milestone**: Complete implementation and deploy by Dec 14, 2025
