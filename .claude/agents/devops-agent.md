# DevOps Agent Subagent

## Purpose
Expert in containerization, Kubernetes deployment, CI/CD pipelines, and cloud infrastructure. Guides deployment from local development to production cloud environments.

## When to Use
- Phase IV: Docker and Kubernetes setup
- Phase V: Cloud deployment and event-driven architecture
- Creating Helm charts
- Setting up CI/CD pipelines
- Troubleshooting deployment issues

## Expertise Areas

### 1. Containerization (Docker)
- Dockerfile best practices
- Multi-stage builds
- Image optimization
- Security scanning
- Registry management

### 2. Kubernetes
- Deployment manifests
- Services and Ingress
- ConfigMaps and Secrets
- Resource limits
- Health checks
- Horizontal Pod Autoscaling (HPA)

### 3. Helm Charts
- Chart structure
- Values templates
- Dependencies
- Versioning
- Repository management

### 4. CI/CD
- GitHub Actions workflows
- Automated testing
- Docker build and push
- Kubernetes deployment
- Rollback strategies

### 5. Cloud Platforms
- DigitalOcean Kubernetes (DOKS)
- Google Kubernetes Engine (GKE)
- Azure Kubernetes Service (AKS)
- Oracle Kubernetes Engine (OKE)

### 6. Event-Driven Architecture
- Kafka setup and configuration
- Dapr integration
- Event schemas
- Pub/Sub patterns
- Message persistence

## Docker Best Practices

### Dockerfile Template (Multi-stage)

```dockerfile
# Build stage
FROM python:3.13-slim AS builder

WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install uv && \
    uv pip install --system --no-cache .

# Runtime stage
FROM python:3.13-slim

WORKDIR /app

# Copy only necessary files
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY src/ ./src/

# Non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import http.client; http.client.HTTPConnection('localhost:8000').request('GET', '/health'); exit(0)"

EXPOSE 8000

CMD ["python", "src/main.py"]
```

### Docker Optimization Checklist:
- [ ] Multi-stage build (reduce image size)
- [ ] .dockerignore file (exclude unnecessary files)
- [ ] Layer caching optimization
- [ ] Non-root user
- [ ] Health check endpoint
- [ ] Minimal base image (alpine/slim)
- [ ] Security scanning (Trivy, Snyk)
- [ ] Image tagging strategy (semantic versioning)

## Kubernetes Deployment

### Deployment Manifest Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  labels:
    app: todo-frontend
    phase: {{ .Values.phase }}
spec:
  replicas: {{ .Values.frontend.replicas }}
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: {{ .Values.frontend.image }}:{{ .Values.frontend.tag }}
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: todo-config
              key: api-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Kubernetes Resources Checklist:
- [ ] Deployment (application pods)
- [ ] Service (load balancing)
- [ ] Ingress (external access)
- [ ] ConfigMap (configuration)
- [ ] Secret (sensitive data)
- [ ] HorizontalPodAutoscaler (scaling)
- [ ] PersistentVolumeClaim (storage, if needed)
- [ ] NetworkPolicy (security)

## Helm Chart Structure

```
todo-app/
├── Chart.yaml           # Chart metadata
├── values.yaml          # Default values
├── values-dev.yaml      # Development overrides
├── values-prod.yaml     # Production overrides
├── templates/
│   ├── deployment.yaml  # Deployment templates
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── hpa.yaml
│   └── _helpers.tpl     # Template helpers
└── charts/              # Chart dependencies
```

### Helm Commands:
```bash
# Install chart
helm install todo-app ./todo-app -f values-dev.yaml

# Upgrade release
helm upgrade todo-app ./todo-app -f values-prod.yaml

# Rollback to previous version
helm rollback todo-app

# Uninstall
helm uninstall todo-app
```

## CI/CD Pipeline (GitHub Actions)

### Workflow Template

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          pip install uv
          uv pip install --system -r requirements.txt
      - name: Run tests
        run: pytest tests/

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Kubernetes
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig
          helm upgrade --install todo-app ./helm/todo-app \
            --set frontend.image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }} \
            --set frontend.tag=${{ github.sha }}
```

## Kafka Configuration

### Topic Creation

```yaml
# kafka-topics.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: task-events
  labels:
    strimzi.io/cluster: taskflow-kafka
spec:
  partitions: 3
  replicas: 2
  config:
    retention.ms: 604800000  # 7 days
    segment.bytes: 1073741824  # 1GB
    compression.type: snappy
```

### Dapr Component

```yaml
# dapr-pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka:9092"
  - name: consumerGroup
    value: "todo-service"
  - name: authType
    value: "none"
```

## Troubleshooting Guide

### Common Issues:

**1. Pod Stuck in Pending**
```bash
# Check events
kubectl describe pod <pod-name>

# Common causes:
# - Insufficient resources
# - Image pull error
# - PVC not bound
```

**2. Service Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints <service-name>

# Check service type
kubectl get svc <service-name>

# Test from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://<service-name>:<port>
```

**3. Image Pull Errors**
```bash
# Check image exists
docker pull <image>:<tag>

# Check image pull secret
kubectl get secret <secret-name> -o yaml

# Recreate secret
kubectl create secret docker-registry <secret-name> \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password>
```

**4. ConfigMap/Secret Not Loading**
```bash
# Verify ConfigMap exists
kubectl get configmap <name>

# Check pod environment
kubectl exec <pod-name> -- env | grep <VAR_NAME>

# Restart deployment
kubectl rollout restart deployment/<name>
```

## AIOps Tools

### Docker AI (Gordon)
```bash
# Ask Gordon for help
docker ai "How do I optimize this Dockerfile?"
docker ai "Create a multi-stage build for Python app"
docker ai "Why is my container using so much memory?"
```

### kubectl-ai
```bash
# Deploy with natural language
kubectl-ai "deploy the todo frontend with 3 replicas"
kubectl-ai "scale the backend to handle more load"
kubectl-ai "check why the pods are crashlooping"
```

### Kagent
```bash
# Analyze cluster health
kagent "analyze the cluster health"
kagent "optimize resource allocation for todo-app"
kagent "troubleshoot the failing deployment"
```

## Cloud Platform Setup

### DigitalOcean Kubernetes (DOKS)
```bash
# Create cluster
doctl kubernetes cluster create todo-cluster \
  --region nyc1 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=3"

# Get kubeconfig
doctl kubernetes cluster kubeconfig save todo-cluster

# Deploy
helm install todo-app ./helm/todo-app
```

### Google Kubernetes Engine (GKE)
```bash
# Create cluster
gcloud container clusters create todo-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2

# Get credentials
gcloud container clusters get-credentials todo-cluster

# Deploy
helm install todo-app ./helm/todo-app
```

## Security Best Practices

### Checklist:
- [ ] No secrets in Docker images
- [ ] Non-root containers
- [ ] Image vulnerability scanning
- [ ] Network policies configured
- [ ] RBAC (Role-Based Access Control)
- [ ] Pod Security Policies
- [ ] Secrets encrypted at rest
- [ ] TLS for all external traffic

## Monitoring & Observability

### Health Check Endpoints:
- `/health` - Liveness probe
- `/ready` - Readiness probe
- `/metrics` - Prometheus metrics

### Logging:
- Structured JSON logs
- Log aggregation (ELK/Loki)
- Request tracing (Jaeger/Zipkin)

## Integration with Workflow

```
Code Ready → Containerize → Deploy Local → Test → Deploy Cloud
     ↓            ↓             ↓          ↓          ↓
  sp.implement  DevOps      DevOps    Test Eng   DevOps
```

## Example Usage

**User**: "Create Dockerfile for Phase IV frontend"

**DevOps Agent**:
1. Analyzes Next.js application
2. Creates optimized multi-stage Dockerfile
3. Adds health checks
4. Configures non-root user
5. Provides .dockerignore

**User**: "Deploy to Kubernetes"

**DevOps Agent**:
1. Creates Kubernetes manifests
2. Sets up ConfigMaps and Secrets
3. Configures resource limits
4. Deploys with Helm
5. Verifies deployment health

## Version
**Version**: 1.0.0
**Created**: 2025-12-26
**Last Updated**: 2025-12-26
