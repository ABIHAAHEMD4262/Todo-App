---
title: Taskly Backend API
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Taskly - AI-Powered Todo Backend API

**Phase II + Phase III Implementation** | FastAPI + OpenAI Agents + MCP Server

This is the backend API for Taskly, a full-stack todo application with AI chatbot capabilities.

## Features

### Phase II - Web Application Backend
- ✅ **User Authentication** - JWT-based auth with Better Auth integration
- ✅ **Task CRUD** - Complete task management (Create, Read, Update, Delete)
- ✅ **Dashboard Statistics** - Task analytics and activity tracking
- ✅ **Multi-user Support** - Isolated user workspaces
- ✅ **PostgreSQL Database** - Neon serverless PostgreSQL

### Phase III - AI Chatbot
- 🤖 **Natural Language Interface** - Manage tasks through conversational AI
- 🛠️ **MCP Server** - Model Context Protocol server with task operation tools
- 🧠 **OpenAI Agents SDK** - Intelligent task understanding and execution
- 💬 **Conversation History** - Persistent chat sessions per user
- ⚡ **Real-time Processing** - Instant task operations via chat

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: Neon PostgreSQL (serverless)
- **ORM**: SQLModel
- **Authentication**: JWT (compatible with Better Auth)
- **AI**: OpenAI GPT-4 via Agents SDK
- **MCP**: Model Context Protocol 1.0
- **Deployment**: Docker (Hugging Face Spaces)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)

### Tasks
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

### Dashboard
- `GET /api/{user_id}/dashboard/stats` - Get user statistics

### AI Chat (Phase III)
- `POST /api/{user_id}/chat` - Send message to AI chatbot
- `GET /api/{user_id}/conversations` - List conversations
- `GET /api/{user_id}/conversations/{id}/messages` - Get conversation history

### Health
- `GET /health` - Health check
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

## Environment Variables

Required environment variables for deployment:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# Authentication
BETTER_AUTH_SECRET=<your-secret-key>

# OpenAI API (Phase III)
OPENAI_API_KEY=<your-openai-api-key>

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
VERCEL_URL=https://your-frontend.vercel.app
```

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Build image
docker build -t taskly-backend .

# Run container
docker run -p 7860:7860 --env-file .env taskly-backend
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database connection
│   ├── auth.py              # JWT authentication
│   ├── models.py            # SQLModel database models
│   ├── schemas.py           # Pydantic schemas
│   ├── agents.py            # OpenAI Agents SDK integration (Phase III)
│   └── routes/
│       ├── auth.py          # Auth endpoints
│       ├── tasks.py         # Task CRUD endpoints
│       ├── dashboard.py     # Dashboard endpoint
│       └── chat.py          # AI chat endpoint (Phase III)
├── mcp_server.py            # MCP server with task tools (Phase III)
├── migrations/              # Alembic database migrations
├── Dockerfile               # Docker configuration for HF Spaces
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Phase III - AI Chatbot Usage

The AI chatbot can understand natural language commands for task management:

**Examples:**
- "Add a task: Buy groceries for dinner"
- "Show me all my tasks"
- "Mark the groceries task as complete"
- "Delete the completed tasks"
- "What tasks do I have pending?"
- "Update my meeting task to include preparation notes"

The chatbot uses:
1. **OpenAI GPT-4** for natural language understanding
2. **MCP Tools** for executing task operations
3. **Database persistence** for conversation history

## Database Schema

### Users
- `id` (string, primary key)
- `email` (string, unique)
- `name` (string)
- `password_hash` (string)
- `created_at` (timestamp)

### Tasks
- `id` (integer, primary key)
- `user_id` (foreign key → users)
- `title` (string)
- `description` (text, optional)
- `completed` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Conversations (Phase III)
- `id` (integer, primary key)
- `user_id` (foreign key → users)
- `created_at` (timestamp)

### Messages (Phase III)
- `id` (integer, primary key)
- `conversation_id` (foreign key → conversations)
- `role` (string: 'user' | 'assistant')
- `content` (text)
- `created_at` (timestamp)

## Security

- **JWT Authentication** - All protected endpoints require valid JWT tokens
- **User Isolation** - Users can only access their own data
- **Password Hashing** - bcrypt for secure password storage
- **CORS** - Configured for trusted frontend origins only
- **Input Validation** - Pydantic schemas for all request/response data

## License

MIT License - Hackathon II Submission

## Links

- **Frontend**: https://taskley.vercel.app
- **GitHub**: https://github.com/ABIHAAHEMD4262/Todo-App
- **API Docs**: https://abihacodes-todoapp.hf.space/docs

---

**Built with ❤️ for Hackathon II - Todo App Evolution**
