# Cloud-Native Patterns Skill

## Description
Expert knowledge of cloud-native architecture patterns, 12-factor app principles, Kubernetes best practices, and modern application design patterns for building scalable, resilient, and maintainable cloud applications.

## Capabilities
- Apply 12-Factor App methodology
- Implement cloud-native design patterns
- Design for scalability and resilience
- Implement observability and monitoring
- Apply security best practices
- Design for stateless operation
- Implement configuration management
- Apply health check patterns

## Usage

This skill is invoked when:
- User asks about "cloud-native best practices"
- User requests "12-factor app principles"
- User wants architectural guidance
- Implementation requires cloud-native patterns

## Knowledge Base

### 12-Factor App Principles

#### 1. Codebase
**Principle**: One codebase tracked in version control, many deploys

**Implementation:**
```bash
# Single repository with multiple environment configs
todo-app/
├── .git/
├── frontend/
├── backend/
├── helm-chart/
│   ├── values-dev.yaml
│   ├── values-staging.yaml
│   └── values-prod.yaml
```

✅ One repository for the entire application
✅ Different configurations for different environments
✅ Same codebase deployed to dev, staging, prod

#### 2. Dependencies
**Principle**: Explicitly declare and isolate dependencies

**Frontend (package.json):**
```json
{
  "dependencies": {
    "next": "16.1.0",
    "react": "19.0.0"
  },
  "devDependencies": {
    "typescript": "5.3.0"
  }
}
```

**Backend (requirements.txt):**
```txt
fastapi==0.109.0
uvicorn==0.25.0
sqlmodel==0.0.14
```

**Docker:**
```dockerfile
# Explicit dependency installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

✅ Lock file versions (package-lock.json, requirements.txt)
✅ No implicit system dependencies
✅ Reproducible builds

#### 3. Config
**Principle**: Store config in the environment

**Bad:**
```python
# Hardcoded config - DON'T DO THIS
DATABASE_URL = "postgresql://prod-db:5432/mydb"
```

**Good:**
```python
# Environment-based config
import os
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
```

**Kubernetes:**
```yaml
env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: todo-secrets
      key: database-url
- name: LOG_LEVEL
  valueFrom:
    configMapKeyRef:
      name: todo-config
      key: log-level
```

✅ No hardcoded secrets or config
✅ Environment variables for configuration
✅ ConfigMaps for non-sensitive data
✅ Secrets for sensitive data

#### 4. Backing Services
**Principle**: Treat backing services as attached resources

**Implementation:**
```python
# Database connection via environment variable
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# OpenAI API via environment variable
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
```

✅ Database URL configurable
✅ Easy to swap between local/cloud databases
✅ No code changes for different environments

#### 5. Build, Release, Run
**Principle**: Strictly separate build and run stages

**Build Stage:**
```bash
# CI/CD: Build Docker images
docker build -t todo-frontend:v1.0.0 ./frontend
docker push registry.io/todo-frontend:v1.0.0
```

**Release Stage:**
```bash
# Combine build with config
helm package ./helm-chart
helm push todo-app-1.0.0.tgz oci://registry.io/charts
```

**Run Stage:**
```bash
# Deploy with config
helm install todo-app oci://registry.io/charts/todo-app \
  --set image.tag=v1.0.0 \
  --set secrets.databaseUrl=$DATABASE_URL
```

✅ Build creates immutable artifacts (Docker images)
✅ Release combines artifacts with config
✅ Run executes the release

#### 6. Processes
**Principle**: Execute the app as one or more stateless processes

**Stateless Backend:**
```python
# Store session in database, not in-memory
@app.post("/api/chat")
async def chat(message: str, conversation_id: int):
    # Load conversation from database
    conversation = await get_conversation(conversation_id)

    # Process message (stateless)
    response = await process_message(message, conversation)

    # Save to database
    await save_message(conversation_id, message, response)

    return {"response": response}
```

**Kubernetes:**
```yaml
# Multiple replicas of stateless pods
spec:
  replicas: 3  # Can scale horizontally
```

✅ No sticky sessions
✅ No in-memory state (use Redis/DB for sessions)
✅ Any pod can handle any request
✅ Easy horizontal scaling

#### 7. Port Binding
**Principle**: Export services via port binding

**Backend:**
```python
# Self-contained server
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
```

**Frontend:**
```javascript
// Next.js server
// next.config.js
module.exports = {
  env: {
    PORT: process.env.PORT || 3000
  }
}
```

**Docker:**
```dockerfile
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

✅ App exports HTTP as a service
✅ No dependency on web server injection
✅ Portable across environments

#### 8. Concurrency
**Principle**: Scale out via the process model

**Horizontal Pod Autoscaling:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Process Types:**
```yaml
# Web process
- name: web
  image: todo-backend
  command: ["uvicorn", "app.main:app"]

# Worker process (if needed)
- name: worker
  image: todo-backend
  command: ["celery", "worker"]
```

✅ Scale by adding more processes
✅ Different process types (web, worker, cron)
✅ Kubernetes manages process lifecycle

#### 9. Disposability
**Principle**: Maximize robustness with fast startup and graceful shutdown

**Fast Startup:**
```python
# Lazy initialization
@app.on_event("startup")
async def startup():
    # Quick startup tasks only
    await init_db_pool()

# Heavy tasks in background
asyncio.create_task(load_ml_model())
```

**Graceful Shutdown:**
```python
@app.on_event("shutdown")
async def shutdown():
    # Clean up connections
    await db_pool.close()
    await redis_client.close()
```

**Kubernetes:**
```yaml
# Startup probe for slow-starting apps
startupProbe:
  httpGet:
    path: /health
    port: 8000
  failureThreshold: 30
  periodSeconds: 10

# Graceful termination
terminationGracePeriodSeconds: 30
```

✅ Start in seconds, not minutes
✅ Handle SIGTERM gracefully
✅ No data loss on shutdown

#### 10. Dev/Prod Parity
**Principle**: Keep development, staging, and production as similar as possible

**Same Technology:**
```yaml
# Development
services:
  backend:
    image: todo-backend:latest
    environment:
      - DATABASE_URL=postgresql://localhost/todo_dev

# Production
spec:
  containers:
  - name: backend
    image: todo-backend:v1.0.0
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-secrets
          key: database-url
```

✅ Same Docker images in dev and prod
✅ Same database engine (PostgreSQL)
✅ Same dependencies versions

#### 11. Logs
**Principle**: Treat logs as event streams

**Application:**
```python
import logging

# Write to stdout (not files)
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
    stream=sys.stdout
)

logger.info("User logged in", extra={"user_id": user_id})
```

**Kubernetes:**
```bash
# View logs from kubectl
kubectl logs -f deployment/todo-backend -n todo-app

# Centralized logging (optional)
# EFK Stack (Elasticsearch, Fluentd, Kibana)
# Or cloud-native: Loki, CloudWatch, Stackdriver
```

✅ Log to stdout/stderr
✅ Structured logging (JSON)
✅ Let platform handle aggregation

#### 12. Admin Processes
**Principle**: Run admin/management tasks as one-off processes

**Kubernetes Jobs:**
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: todo-backend:v1.0.0
        command: ["alembic", "upgrade", "head"]
      restartPolicy: OnFailure
```

**Init Containers:**
```yaml
spec:
  initContainers:
  - name: db-migrate
    image: todo-backend:v1.0.0
    command: ["alembic", "upgrade", "head"]
  containers:
  - name: backend
    image: todo-backend:v1.0.0
```

✅ Database migrations as Jobs
✅ One-off tasks in same environment
✅ Same image, different command

## Cloud-Native Design Patterns

### Pattern 1: Health Check Pattern

**Endpoints:**
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    # Check dependencies
    try:
        await db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Not ready")
```

**Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
```

### Pattern 2: Sidecar Pattern

**Dapr Example (Phase V):**
```yaml
spec:
  containers:
  - name: app
    image: todo-backend
  - name: dapr-sidecar
    image: daprio/daprd
```

### Pattern 3: Circuit Breaker Pattern

```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_external_api():
    response = await httpx.get("https://api.example.com")
    return response.json()
```

### Pattern 4: Retry Pattern

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def fetch_data():
    return await external_api.get()
```

## Security Best Practices

### Container Security
- ✅ Run as non-root user
- ✅ Use minimal base images (Alpine)
- ✅ Scan images for vulnerabilities
- ✅ Drop all capabilities
- ✅ Read-only root filesystem (where possible)

### Network Security
- ✅ Use NetworkPolicies
- ✅ TLS for ingress
- ✅ Service mesh (optional)
- ✅ Secrets encryption at rest

### Secret Management
- ✅ Never commit secrets to Git
- ✅ Use Kubernetes Secrets
- ✅ External secret managers (AWS Secrets Manager, Vault)
- ✅ Rotate secrets regularly

## Observability

### Three Pillars

**1. Logging:**
```python
logger.info("User action", extra={
    "user_id": user_id,
    "action": "create_task",
    "task_id": task_id
})
```

**2. Metrics:**
```python
from prometheus_client import Counter, Histogram

request_count = Counter('http_requests_total', 'Total HTTP requests')
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')
```

**3. Tracing:**
```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process_task"):
    result = await process_task(task_id)
```

## Anti-Patterns to Avoid

❌ **Hardcoded Configuration**
```python
# BAD
DATABASE_URL = "postgresql://prod-db:5432/db"
```

❌ **In-Memory Sessions**
```python
# BAD
sessions = {}  # Lost when pod restarts
```

❌ **Storing Files Locally**
```python
# BAD
with open("/tmp/upload.jpg", "wb") as f:
    f.write(file_content)  # Lost when pod restarts
```

❌ **Manual Scaling**
```bash
# BAD
kubectl scale deployment backend --replicas=10  # Use HPA instead
```

❌ **Tightly Coupled Services**
```python
# BAD
from frontend_module import get_user  # Tight coupling
```

## Validation Checklist

- [ ] Application follows 12-factor principles
- [ ] Stateless design (no in-memory sessions)
- [ ] Configuration via environment variables
- [ ] Secrets externalized
- [ ] Health checks implemented
- [ ] Structured logging to stdout
- [ ] Resource limits defined
- [ ] Horizontal scaling enabled
- [ ] Graceful shutdown handling
- [ ] Security best practices applied

## Related Skills
- `docker-containerization` - For containerizing apps
- `k8s-deployment` - For Kubernetes deployment
- `helm-charts` - For templated deployments
- `minikube-local-k8s` - For local testing

## References
- [12-Factor App](https://12factor.net/)
- [Cloud Native Patterns](https://www.cnpatterns.org/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [CNCF Cloud Native Definition](https://github.com/cncf/toc/blob/main/DEFINITION.md)
