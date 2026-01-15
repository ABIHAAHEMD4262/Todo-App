# Docker Containerization Skill

## Description
Expert knowledge for creating production-ready, optimized Dockerfiles for Next.js and FastAPI applications based on latest Docker best practices (2025). Implements multi-stage builds, security hardening, and image optimization.

## Capabilities
- Generate multi-stage Dockerfiles for Next.js 16+ with standalone output
- Generate optimized Dockerfiles for Python FastAPI applications
- Create docker-compose.yml for local development and testing
- Apply security best practices (non-root users, minimal base images)
- Configure health checks and resource limits
- Optimize build caching and image size
- Generate .dockerignore files

## Usage

This skill is invoked when:
- User asks to "containerize the application"
- User requests "create Dockerfiles"
- User wants to "set up Docker Compose"
- Implementation requires Docker setup for Phase 4 deployment

## Knowledge Base

### Next.js 16+ Production Dockerfile (Latest 2025 Pattern)

Based on official Docker documentation with Alpine Linux optimization:

```dockerfile
# ========================================
# Optimized Multi-Stage Dockerfile
# Next.js 16+ Application with Standalone Output
# ========================================

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ========================================
# Dependencies Stage (Production Only)
# ========================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev && \
    npm cache clean --force

# ========================================
# Build Dependencies Stage (All Dependencies)
# ========================================
FROM base AS build-deps

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies)
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM build-deps AS builder

# Copy application source
COPY --chown=nextjs:nodejs . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Build the application with standalone output
# This creates .next/standalone directory with minimal dependencies
RUN npm run build

# ========================================
# Production Stage (Minimal Runtime)
# ========================================
FROM base AS production

# Set environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Copy standalone output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create nextjs user and set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

**Next.js Configuration Requirements:**

Add to `next.config.js` to enable standalone output:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // This creates a minimal server bundle
}

module.exports = nextConfig
```

### FastAPI Production Dockerfile (Python 3.13 + Alpine)

Based on official Docker Python best practices:

```dockerfile
# ========================================
# Optimized Multi-Stage Dockerfile
# FastAPI Application with Python 3.13
# ========================================

FROM python:3.13-alpine AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apk add --no-cache \
    libpq \
    curl

WORKDIR /app

# ========================================
# Builder Stage (Install Dependencies)
# ========================================
FROM base AS builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev

# Create virtual environment
RUN python -m venv /app/venv

# Activate virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ========================================
# Production Stage
# ========================================
FROM base AS production

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/venv /app/venv

# Set PATH to use virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Copy application code
COPY ./app ./app

# Create non-root user
RUN adduser -D -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ========================================
# Development Stage (Optional)
# ========================================
FROM builder AS development

ENV PYTHONUNBUFFERED=1

# Copy application code
COPY . .

# Expose debug port
EXPOSE 8000 5678

# Install development dependencies
RUN pip install --no-cache-dir pytest pytest-cov debugpy

# Start with hot reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Docker Compose for Phase 4 Local Development

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: todo-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - todo-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: todo-backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - FRONTEND_URL=http://frontend:3000
    restart: unless-stopped
    networks:
      - todo-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  todo-network:
    driver: bridge

# For production, add volumes for persistent data if needed
# volumes:
#   postgres-data:
```

### .dockerignore Template

```
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
venv/
env/
ENV/

# Build outputs
.next/
dist/
build/
*.egg-info/

# Environment files
.env
.env.local
.env.*.local
.env.development
.env.production

# Version control
.git/
.gitignore
.gitattributes

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.pytest_cache/
.coverage
htmlcov/

# Documentation
README.md
docs/
*.md

# CI/CD
.github/
.gitlab-ci.yml

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.cache/
.temp/
.tmp/
```

## Best Practices from Latest Docker Documentation (2025)

### Security
- ✅ Always use non-root users (nodejs:1001, appuser:1000)
- ✅ Use specific base image versions with Alpine Linux (smaller attack surface)
- ✅ Minimize image layers and installed packages
- ✅ Never include secrets in images (use environment variables)
- ✅ Scan images for vulnerabilities with `docker scout`
- ✅ Use read-only root filesystem where possible

### Performance
- ✅ Use multi-stage builds to minimize final image size (50-80% reduction)
- ✅ Leverage build cache with `--mount=type=cache`
- ✅ Copy package files before source code for better caching
- ✅ Use Alpine or slim base images (Alpine ~5MB vs Debian ~124MB)
- ✅ Use Next.js standalone output (reduces image size by 70%)

### Reliability
- ✅ Include health checks in Dockerfiles and Compose
- ✅ Set proper restart policies
- ✅ Configure resource limits (memory, CPU)
- ✅ Use proper signal handling for graceful shutdown
- ✅ Implement proper logging to stdout/stderr

### Build Optimization
- ✅ Use BuildKit features (`--mount=type=cache`)
- ✅ Minimize layer size with `&&` command chaining
- ✅ Clean up package manager cache in same layer
- ✅ Use `.dockerignore` to exclude unnecessary files
- ✅ Order commands from least to most frequently changing

## Docker Commands for Phase 4

```bash
# Build images
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# Build specific stage (for testing)
docker build --target development -t todo-backend:dev ./backend

# Build with BuildKit (faster)
DOCKER_BUILDKIT=1 docker build -t todo-frontend:latest ./frontend

# Run with docker-compose
docker-compose up -d
docker-compose logs -f
docker-compose down

# Tag and push to registry
docker tag todo-frontend:latest yourusername/todo-frontend:v1.0.0
docker push yourusername/todo-frontend:v1.0.0

# Scan for vulnerabilities
docker scout cves todo-frontend:latest

# Inspect image size
docker images todo-frontend:latest
docker history todo-frontend:latest

# Run container manually (for debugging)
docker run -p 3000:3000 --env-file .env todo-frontend:latest

# Execute command in running container
docker exec -it todo-frontend sh

# View logs
docker logs -f todo-frontend
```

## Validation Checklist

When generating Docker configurations, ensure:

- [ ] Multi-stage builds used (base, deps, build, production)
- [ ] Non-root user configured (nodejs:1001 or appuser:1000)
- [ ] Health checks defined in Dockerfile
- [ ] .dockerignore file excludes unnecessary files
- [ ] Environment variables used for configuration
- [ ] Alpine or slim base images selected
- [ ] Build cache optimization with `--mount=type=cache`
- [ ] Security scanning recommendations included
- [ ] Next.js standalone output enabled
- [ ] Python virtual environment used
- [ ] Resource limits defined in docker-compose
- [ ] Restart policies configured

## Examples

### Example 1: Generate Frontend Dockerfile
**Input**: "Create a production Dockerfile for the Next.js frontend"
**Output**: Multi-stage Dockerfile with standalone output, nextjs user, health check

### Example 2: Generate Backend Dockerfile
**Input**: "Create a production Dockerfile for the FastAPI backend"
**Output**: Multi-stage Dockerfile with virtual environment, non-root user, Alpine base

### Example 3: Generate Docker Compose
**Input**: "Set up docker-compose for local development"
**Output**: Complete docker-compose.yml with frontend, backend, health checks, networks

## Related Skills
- `helm-charts` - For Kubernetes deployment
- `k8s-deployment` - For orchestration patterns
- `cloud-native-patterns` - For 12-factor app principles
- `minikube-local-k8s` - For local testing

## References
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Best Practices 2025](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [FastAPI in Containers](https://fastapi.tiangolo.com/deployment/docker/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
