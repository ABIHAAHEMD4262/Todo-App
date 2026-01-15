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
    python3-dev \
    libffi-dev \
    openssl-dev

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