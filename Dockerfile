# Hugging Face Spaces Dockerfile
# Optimized for memory efficiency

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    KAFKA_ENABLED=false

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/app ./app

# Copy entry point
COPY app.py .

# Create non-root user (required by HF Spaces)
RUN useradd -m -u 1000 user
USER user

# Expose port 7860 (HF Spaces default)
EXPOSE 7860

# Start the application
CMD ["python", "app.py"]
