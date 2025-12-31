# Todo App Overview

## Purpose
A todo application that evolves from a console app to a cloud-native AI chatbot, demonstrating mastery of Spec-Driven Development and modern cloud technologies.

## Current Phase
**Phase II: Full-Stack Web Application**

Transform the Phase I console app into a modern, multi-user web application with persistent storage, authentication, and a responsive UI.

## Project Goals
1. Master Spec-Driven Development using Claude Code and Spec-Kit Plus
2. Build a production-ready full-stack application
3. Implement secure authentication and multi-user support
4. Deploy to cloud platforms (Vercel + Railway/Render)
5. Prepare foundation for Phase III (AI Chatbot)

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **Form Validation**: React Hook Form + Zod
- **HTTP Client**: Fetch API
- **Deployment**: Vercel

### Backend
- **Framework**: Python FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: JWT (integrated with Better Auth)
- **Validation**: Pydantic v2
- **Deployment**: Railway or Render

### Development Tools
- **Spec-Driven Development**: Claude Code + Spec-Kit Plus
- **Reusable Intelligence**: Custom Skills and Agents
- **Version Control**: Git + GitHub
- **Local Development**: Docker Compose (optional)

## Features Status

### Phase II Features (Current)
- [ ] **Basic Level** (Required - 5 features)
  - [ ] Add Task
  - [ ] View Task List
  - [ ] Update Task
  - [ ] Delete Task
  - [ ] Mark Task as Complete
- [ ] **User Authentication** (Required)
  - [ ] User Signup
  - [ ] User Login
  - [ ] User Logout
  - [ ] Protected Routes
- [ ] **Dashboard** (Bonus)
  - [ ] Task Statistics
  - [ ] Recent Activity
  - [ ] Quick Actions

### Future Phases
- **Phase III**: AI-Powered Todo Chatbot (OpenAI ChatKit + MCP)
- **Phase IV**: Local Kubernetes Deployment (Minikube + Helm)
- **Phase V**: Advanced Cloud Deployment (Kafka + Dapr + DOKS)

## Success Criteria
- ✅ All 5 Basic Level features implemented as web application
- ✅ User authentication with Better Auth + JWT
- ✅ Multi-user support (user isolation)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ RESTful API with proper authentication
- ✅ Data persisted in Neon PostgreSQL database
- ✅ Deployed frontend on Vercel
- ✅ Deployed backend accessible via API

## Out of Scope (Future Phases)
- ❌ AI Chatbot interface (Phase III)
- ❌ Kubernetes deployment (Phase IV)
- ❌ Advanced features like recurring tasks, due dates (Phase V)
- ❌ Intermediate features (priorities, tags, search) - Optional for bonus

## Repository Structure
```
hackathon-todo/
├── .spec-kit/                # Spec-Kit configuration
├── specs/                    # Specifications (organized)
│   ├── features/            # Feature specifications
│   ├── api/                 # API specifications
│   ├── database/            # Database specifications
│   └── ui/                  # UI specifications
├── frontend/                # Next.js application
├── backend/                 # FastAPI application
├── CLAUDE.md               # Root Claude Code instructions
└── README.md               # Project documentation
```

## Links
- **Hackathon**: Hackathon II - Todo Spec-Driven Development.md
- **Phase II Detailed Spec**: @specs/phase2-webapp/spec.md (legacy)
- **GitHub Repository**: [To be added]
- **Deployed App**: [To be added]

---

**Last Updated**: 2025-12-30
**Status**: In Progress - Phase II
**Next Milestone**: Complete Phase II by December 14, 2025
