# Phase 4 Kubernetes Deployment - Implementation Plan

## Overview
This document outlines the technical implementation strategy for deploying the Phase III AI-powered Todo Chatbot to Kubernetes using Docker, Helm, and Minikube. The plan follows cloud-native best practices and leverages reusable skills and agents created for this project.

## Prerequisites Verification
- [ ] Phase III chatbot is fully functional
- [ ] Docker Desktop installed
- [ ] kubectl CLI installed
- [ ] Helm 3+ installed
- [ ] Minikube installed
- [ ] Skills and agents created in `.claude/`

## Implementation Phases

### Phase 1: Docker Containerization (2-3 hours)
**Goal**: Create production-ready Docker images for frontend and backend

#### 1.1 Frontend Dockerfile (Next.js)
**Approach**: Multi-stage build with standalone output

**Strategy**:
```dockerfile
Stages:
1. Base (Node 20-alpine) - Set up common layers
2. Dependencies - Install production dependencies
3. Build Dependencies - Install all dependencies
4. Builder - Build Next.js application
5. Production - Minimal runtime image with standalone output
```

**Implementation Steps**:
1. Update `next.config.js` to enable standalone output
2. Create multi-stage Dockerfile in `frontend/`
3. Configure non-root user (nodejs:1001)
4. Add health check for `/api/health`
5. Optimize with BuildKit cache mounts
6. Create `.dockerignore`

**Expected Output**:
- Image size: ~127MB (vs 500MB+ without optimization)
- Startup time: < 5 seconds
- Security: Non-root user, minimal attack surface

#### 1.2 Backend Dockerfile (FastAPI)
**Approach**: Multi-stage build with Python virtual environment

**Strategy**:
```dockerfile
Stages:
1. Base (Python 3.13-alpine) - Common setup
2. Builder - Install dependencies in venv
3. Production - Copy venv, run application
```

**Implementation Steps**:
1. Create multi-stage Dockerfile in `backend/`
2. Use virtual environment for isolation
3. Configure non-root user (appuser:1000)
4. Add health check for `/health`
5. Optimize layer caching
6. Create `.dockerignore`

**Expected Output**:
- Image size: ~89MB (vs 300MB+ with standard Python image)
- Startup time: < 10 seconds
- Security: Non-root user, minimal dependencies

#### 1.3 Docker Compose
**Approach**: Local development and testing

**Implementation Steps**:
1. Create `docker-compose.yml` at project root
2. Define frontend and backend services
3. Configure environment variables
4. Set up health checks
5. Create bridge network
6. Test local deployment

**Usage**:
```bash
docker-compose build
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

**Decision Points**:
- **Base Image**: Alpine vs Debian → Choose Alpine for smaller size
- **Node Version**: 18 vs 20 → Choose 20 (latest LTS)
- **Python Version**: 3.11 vs 3.13 → Choose 3.13 (latest)

### Phase 2: Kubernetes Manifests (3-4 hours)
**Goal**: Create all required Kubernetes resources

#### 2.1 Namespace & ConfigMap
**Files**: `k8s/namespace.yaml`, `k8s/configmap.yaml`

**Implementation**:
```yaml
Namespace: todo-app
ConfigMap: todo-config
  - api-url: http://todo-backend:8000
  - frontend-url: http://todo-frontend:3000
  - log-level: info
  - environment: development
```

#### 2.2 Secrets
**File**: `k8s/secret.yaml` (template only - never commit real secrets!)

**Implementation**:
```yaml
Secret: todo-secrets (type: Opaque)
  - database-url: (base64 encoded)
  - better-auth-secret: (base64 encoded)
  - openai-api-key: (base64 encoded)
```

**Security Strategy**:
- Commit template with placeholder values
- Document injection via `--set` flags
- Add to `.gitignore`
- Consider sealed-secrets for production

#### 2.3 Deployments
**Files**: `k8s/deployment-frontend.yaml`, `k8s/deployment-backend.yaml`

**Frontend Deployment Strategy**:
```yaml
Replicas: 2 (for HA)
Resources:
  Requests: 256Mi memory, 250m CPU
  Limits: 512Mi memory, 500m CPU
Probes:
  Liveness: /api/health (30s initial, 10s period)
  Readiness: /api/health (10s initial, 5s period)
  Startup: /api/health (0s initial, 10s period, 30 failures)
Security:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001
  drop all capabilities
Strategy:
  RollingUpdate (maxSurge: 1, maxUnavailable: 0)
Affinity:
  Pod anti-affinity (spread across nodes)
```

**Backend Deployment Strategy**:
```yaml
Replicas: 2 (for HA)
Resources:
  Requests: 512Mi memory, 500m CPU
  Limits: 1Gi memory, 1000m CPU
Probes: Same pattern as frontend
Security: Same pattern as frontend (runAsUser: 1000)
```

**Decision Points**:
- **Initial Replicas**: 1 vs 2 → Choose 2 for HA in Minikube
- **Resource Limits**: Conservative vs Generous → Start conservative, tune later
- **Probe Timings**: Fast vs Slow → Balance startup time vs false positives

#### 2.4 Services
**Files**: `k8s/service-frontend.yaml`, `k8s/service-backend.yaml`

**Implementation**:
```yaml
Frontend Service:
  Type: ClusterIP
  Port: 3000
  Selector: app=todo-frontend

Backend Service:
  Type: ClusterIP
  Port: 8000
  Selector: app=todo-backend
```

**Decision**: ClusterIP (not LoadBalancer) because Ingress will handle external access

#### 2.5 Ingress
**File**: `k8s/ingress.yaml`

**Implementation Strategy**:
```yaml
Ingress Controller: nginx
Host: todo.local (for Minikube)
TLS: false (for local development)
Rules:
  - Path: /api → todo-backend:8000
  - Path: / → todo-frontend:3000
Annotations:
  - nginx.ingress.kubernetes.io/rewrite-target: /
```

**Decision Points**:
- **Path Order**: /api first, then / (more specific first)
- **TLS**: Skip for Minikube, enable for production
- **Hostname**: todo.local for development

#### 2.6 Horizontal Pod Autoscaler (HPA)
**Files**: `k8s/hpa-frontend.yaml`, `k8s/hpa-backend.yaml`

**Frontend HPA Strategy**:
```yaml
minReplicas: 2
maxReplicas: 10
Metrics:
  - CPU: 70% utilization
  - Memory: 80% utilization
Behavior:
  ScaleUp: Max 100% per 60s (or +2 pods)
  ScaleDown: 50% per 60s with 300s stabilization
```

**Backend HPA Strategy**:
```yaml
minReplicas: 2
maxReplicas: 20
Metrics: Same as frontend
Behavior: Same as frontend
```

**Prerequisites**: metrics-server addon enabled in Minikube

### Phase 3: Helm Chart Packaging (2-3 hours)
**Goal**: Package Kubernetes manifests as reusable Helm chart

#### 3.1 Chart Structure
**Directory**: `helm-chart/`

```
helm-chart/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
├── .helmignore
└── templates/
    ├── NOTES.txt
    ├── _helpers.tpl
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── deployment-frontend.yaml
    ├── deployment-backend.yaml
    ├── service-frontend.yaml
    ├── service-backend.yaml
    ├── ingress.yaml
    ├── hpa-frontend.yaml
    └── hpa-backend.yaml
```

#### 3.2 Chart.yaml
**Implementation**:
```yaml
apiVersion: v2
name: todo-app
description: AI-powered Todo application with chatbot
type: application
version: 1.0.0
appVersion: "1.0.0"
kubeVersion: ">=1.25.0-0"
```

#### 3.3 values.yaml (Defaults)
**Strategy**: Provide sensible defaults for all environments

**Key Sections**:
- Global settings (namespace, registry)
- Frontend configuration (image, replicas, resources, autoscaling)
- Backend configuration (same structure)
- Ingress configuration (enabled, hosts, TLS)
- ConfigMap data
- Secret templates (placeholders only)

#### 3.4 values-dev.yaml (Development Overrides)
**Strategy**: Optimize for local development

**Overrides**:
- Single replicas (save resources)
- Lower resource limits
- Autoscaling disabled
- Ingress host: todo.local
- No TLS

#### 3.5 values-prod.yaml (Production Overrides)
**Strategy**: Optimize for production

**Overrides**:
- Multiple replicas (HA)
- Higher resource limits
- Autoscaling enabled
- Ingress host: todo.example.com
- TLS enabled

#### 3.6 Template Helpers (_helpers.tpl)
**Purpose**: Reusable template functions

**Helpers**:
- `todo-app.name`: Chart name
- `todo-app.fullname`: Release + chart name
- `todo-app.chart`: Chart name + version
- `todo-app.labels`: Common labels
- `todo-app.selectorLabels`: Selector labels
- `todo-app.imageTag`: Get image tag

#### 3.7 Convert K8s Manifests to Templates
**Strategy**: Replace hardcoded values with {{ .Values.* }}

**Example**:
```yaml
# Before (K8s manifest)
replicas: 2

# After (Helm template)
replicas: {{ .Values.frontend.replicaCount }}
```

**All Replacements**:
- Image names and tags
- Replica counts
- Resource limits
- Environment variables
- Hostnames
- Namespaces

#### 3.8 NOTES.txt
**Purpose**: Post-install instructions for users

**Content**:
- Access URL
- Port-forward commands
- Status check commands
- Log viewing commands

### Phase 4: Minikube Deployment (1-2 hours)
**Goal**: Deploy and test on local Kubernetes cluster

#### 4.1 Minikube Setup
**Commands**:
```bash
# Start with adequate resources
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify
minikube status
kubectl get nodes
```

#### 4.2 Build Images in Minikube
**Strategy**: Build inside Minikube to avoid registry push/pull

**Commands**:
```bash
# Use Minikube Docker
eval $(minikube docker-env)

# Build images
docker build -t todo-frontend:v1.0.0 ./frontend
docker build -t todo-backend:v1.0.0 ./backend

# Verify
minikube image ls | grep todo
```

#### 4.3 Deploy with Helm
**Commands**:
```bash
# Create namespace
kubectl create namespace todo-app

# Install chart
helm install todo-app ./helm-chart \
  -f helm-chart/values-dev.yaml \
  --set frontend.image.repository=todo-frontend \
  --set backend.image.repository=todo-backend \
  --set frontend.image.tag=v1.0.0 \
  --set backend.image.tag=v1.0.0 \
  --set secrets.databaseUrl="$DATABASE_URL" \
  --set secrets.betterAuthSecret="$BETTER_AUTH_SECRET" \
  --set secrets.openaiApiKey="$OPENAI_API_KEY" \
  -n todo-app

# Watch deployment
kubectl get pods -n todo-app -w
```

#### 4.4 Configure Access
**Commands**:
```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac)
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Or Windows: C:\Windows\System32\drivers\etc\hosts
# Add: <minikube-ip> todo.local

# Access application
open http://todo.local
```

#### 4.5 Verify Deployment
**Checklist**:
```bash
# All pods running?
kubectl get pods -n todo-app

# Services created?
kubectl get svc -n todo-app

# Ingress working?
kubectl get ingress -n todo-app
curl -I http://todo.local

# HPA working?
kubectl get hpa -n todo-app

# Logs clean?
kubectl logs -f deployment/todo-frontend -n todo-app
kubectl logs -f deployment/todo-backend -n todo-app
```

### Phase 5: Testing & Validation (1-2 hours)
**Goal**: Verify all functionality works in Kubernetes

#### 5.1 Smoke Tests
- [ ] Access http://todo.local
- [ ] Login with Better Auth
- [ ] Open chatbot interface
- [ ] Send message to chatbot
- [ ] Add task via natural language
- [ ] View tasks
- [ ] Complete task
- [ ] Delete task

#### 5.2 Kubernetes-Specific Tests
- [ ] Kill frontend pod → New pod starts, app still works
- [ ] Kill backend pod → New pod starts, app still works
- [ ] Restart Minikube → App state persists (external DB)
- [ ] Generate load → HPA scales up pods
- [ ] Remove load → HPA scales down pods

#### 5.3 Security Tests
- [ ] Containers run as non-root (check with `kubectl exec`)
- [ ] Secrets not visible in pod specs
- [ ] Images scanned with Docker Scout (no critical vulnerabilities)

## Technology Decisions

### Decision 1: Base Images
**Options**: Alpine vs Debian/Ubuntu
**Choice**: Alpine
**Rationale**:
- 90% smaller (5MB vs 50MB+)
- Faster downloads and deployments
- Reduced attack surface
- Sufficient for Node.js and Python

### Decision 2: Deployment Strategy
**Options**: Recreate vs RollingUpdate
**Choice**: RollingUpdate
**Rationale**:
- Zero-downtime deployments
- Gradual rollout reduces risk
- Can rollback easily
- Industry standard

### Decision 3: Service Type
**Options**: ClusterIP vs LoadBalancer vs NodePort
**Choice**: ClusterIP + Ingress
**Rationale**:
- Single external IP (via Ingress)
- Path-based routing
- Easier to add more services later
- Cloud-native pattern

### Decision 4: Autoscaling
**Options**: Manual vs HPA vs VPA
**Choice**: HPA
**Rationale**:
- Automatic scaling based on load
- Cost-effective (scale down when idle)
- Kubernetes-native solution
- Easy to configure

### Decision 5: Secrets Management
**Options**: Hardcode vs ConfigMap vs Secret vs External
**Choice**: Kubernetes Secret + --set flags
**Rationale**:
- More secure than ConfigMap
- Better than hardcoding
- Simple for Phase 4
- Can migrate to external later (Phase 5)

## Resource Estimates

### Development Environment (Minikube)
- **Minikube**: 4 CPUs, 8GB RAM
- **Frontend**: 2 pods × 512Mi = 1GB
- **Backend**: 2 pods × 1Gi = 2GB
- **Total**: ~3GB (plenty of headroom)

### Production Environment (Cloud K8s)
- **Control Plane**: Managed by cloud provider
- **Worker Nodes**: 2-3 nodes × 4GB = 8-12GB
- **Frontend**: 3-10 pods (auto-scaling)
- **Backend**: 3-20 pods (auto-scaling)

## Risks & Mitigation

### Risk 1: Docker Build Fails
**Likelihood**: Medium
**Impact**: High (blocker)
**Mitigation**:
- Test Docker builds locally first
- Use docker-compose for quick iteration
- Check logs carefully
- Verify base images are accessible

### Risk 2: Minikube Resource Constraints
**Likelihood**: High
**Impact**: Medium
**Mitigation**:
- Start with adequate resources (4 CPU, 8GB)
- Monitor with `kubectl top`
- Reduce replicas if needed
- Use values-dev.yaml with lower limits

### Risk 3: Ingress Not Working
**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:
- Verify ingress addon enabled
- Check /etc/hosts configuration
- Test with port-forward as backup
- Check ingress controller logs

### Risk 4: HPA Not Scaling
**Likelihood**: Medium
**Impact**: Low (functionality works, just no scaling)
**Mitigation**:
- Verify metrics-server enabled
- Ensure resource requests are set
- Check HPA events: `kubectl describe hpa`
- Test with load: `kubectl run -it --rm load-generator --image=busybox`

## Testing Strategy

### Unit Testing
- ✅ Completed in Phase III (not re-testing here)

### Integration Testing
- [ ] Docker Compose: All services communicate
- [ ] Kubernetes: Pods can reach each other
- [ ] Ingress: External traffic routes correctly

### Load Testing (Optional)
- Generate load with Apache Bench or k6
- Verify HPA scales up
- Monitor pod resource usage
- Verify performance under load

### Smoke Testing
- Manual testing of all chatbot features
- Verify data persists across restarts

## Rollback Strategy

### Helm Rollback
```bash
# List releases
helm list -n todo-app

# Rollback to previous version
helm rollback todo-app -n todo-app

# Rollback to specific version
helm rollback todo-app 1 -n todo-app
```

### Docker Image Rollback
```bash
# Revert to previous image tag
helm upgrade todo-app ./helm-chart \
  --set frontend.image.tag=v0.9.0 \
  -n todo-app
```

## Success Criteria

### Phase 4 Complete When:
- [x] All Docker images build successfully
- [x] docker-compose runs locally
- [x] All Kubernetes manifests are valid
- [x] Helm chart passes `helm lint`
- [x] Application deploys to Minikube
- [x] All pods reach Running/Ready state
- [x] Application accessible via Ingress
- [x] AI chatbot works in Kubernetes
- [x] HPA responds to load
- [x] Documentation complete

## Next Steps (Phase V Preview)
- Deploy to cloud Kubernetes (GKE/EKS/AKS)
- Add Kafka for event streaming
- Integrate Dapr for distributed runtime
- Implement advanced features (recurring tasks, reminders)
- Set up CI/CD pipeline
- Configure monitoring (Prometheus/Grafana)

## References
- Spec: `specs/features/phase4-kubernetes-deployment/spec.md`
- Skills: `.claude/skills/`
- Agents: `.claude/agents/`
- Blueprint: `.claude/blueprints/fullstack-k8s-deployment/`
- Hackathon Instructions: `Hackathon II - Todo Spec-Driven Development.md`

---

**Document Version**: 1.0.0
**Created**: 2026-01-12
**Last Updated**: 2026-01-12
**Status**: Ready for Task Breakdown
