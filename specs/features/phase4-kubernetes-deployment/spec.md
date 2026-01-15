# Feature: Phase 4 - Kubernetes Deployment

## Overview
Deploy the Phase III AI-powered Todo Chatbot to a local Kubernetes cluster using Minikube, Helm Charts, Docker containers, and AI-assisted DevOps tools (kubectl-ai, kagent, Docker AI/Gordon). This phase transforms the application into a cloud-native, containerized, orchestrated system ready for production deployment.

## Phase Dependencies
- **Phase III Completed**: AI chatbot with OpenAI ChatKit, Agents SDK, and MCP server
- **Working Application**: Frontend (Next.js), Backend (FastAPI), External Database (Neon PostgreSQL)

## User Stories

### As a DevOps Engineer
- I can containerize the frontend and backend applications using Docker
- I can deploy the application to a local Kubernetes cluster (Minikube)
- I can manage deployments using Helm charts
- I can access the application through Kubernetes Ingress
- I can scale the application horizontally using HPA (Horizontal Pod Autoscaler)
- I can monitor application health and logs
- I can use AI-assisted tools (kubectl-ai, kagent, Gordon) for Kubernetes operations

### As a Developer
- I can test Kubernetes deployment locally before cloud deployment
- I can understand the containerized architecture
- I can debug containerized applications
- I can make changes and redeploy easily

### As a User
- I can access the same AI chatbot functionality as Phase III
- The application remains responsive and available
- My data persists across pod restarts

## Requirements

### Functional Requirements

#### FR1: Docker Containerization
1. **Frontend Container**: Dockerize Next.js application
   - Multi-stage build for optimization
   - Production-ready image with minimal size
   - Health check endpoint
   - Non-root user for security

2. **Backend Container**: Dockerize FastAPI application
   - Multi-stage build for optimization
   - Python dependencies properly installed
   - Health check endpoint
   - Non-root user for security

3. **Local Development**: docker-compose.yml for local testing
   - Frontend and backend services
   - Environment variable configuration
   - Volume mounts for development
   - Health checks

#### FR2: Kubernetes Resources
1. **Deployments**: Create Kubernetes Deployment manifests
   - Frontend deployment with 2+ replicas
   - Backend deployment with 2+ replicas
   - Resource limits (CPU, memory)
   - Health probes (liveness, readiness, startup)
   - Rolling update strategy

2. **Services**: Create Kubernetes Service manifests
   - Frontend service (ClusterIP)
   - Backend service (ClusterIP)
   - Service discovery for inter-pod communication

3. **Ingress**: Create Ingress manifest for external access
   - Path-based routing: / → frontend, /api → backend
   - NGINX Ingress Controller
   - Host-based routing (todo.local for Minikube)

4. **ConfigMaps**: Configuration for non-sensitive data
   - API URLs
   - Log levels
   - Environment identifiers

5. **Secrets**: Secure storage for sensitive data
   - Database connection string
   - Better Auth secret
   - OpenAI API key

6. **HPA (Horizontal Pod Autoscaler)**: Auto-scaling configuration
   - Frontend: 2-10 replicas based on CPU (70%)
   - Backend: 2-20 replicas based on CPU (70%)
   - Metrics-server enabled

#### FR3: Helm Chart Packaging
1. **Chart Structure**: Complete Helm chart
   - Chart.yaml with metadata
   - values.yaml with defaults
   - values-dev.yaml (development overrides)
   - values-prod.yaml (production overrides)
   - templates/ with all K8s manifests

2. **Templating**: Helm templates for reusability
   - Parameterized image tags
   - Parameterized replicas
   - Parameterized resource limits
   - Environment-specific configurations

3. **Chart Management**: Version control and releases
   - Semantic versioning
   - Release management
   - Rollback capability

#### FR4: Minikube Deployment
1. **Local Cluster**: Minikube setup
   - Cluster with adequate resources (4 CPUs, 8GB RAM)
   - Ingress addon enabled
   - Metrics-server addon enabled
   - Dashboard addon (optional)

2. **Image Management**: Container images in Minikube
   - Build images in Minikube Docker
   - Or load images from local Docker
   - Image pull policy configuration

3. **Application Deployment**: Deploy via Helm
   - Install Helm chart
   - Configure with values-dev.yaml
   - Inject secrets via --set flags
   - Verify successful deployment

4. **Access Configuration**: Application accessibility
   - Update /etc/hosts for Ingress hostname
   - Access via http://todo.local
   - Alternative: port-forward for direct access
   - Alternative: minikube tunnel for LoadBalancer

### Technical Requirements

#### TR1: Docker Best Practices (2025)
- Multi-stage builds for minimal image size
- Alpine Linux base images where possible
- Non-root users (nodejs:1001, appuser:1000)
- Health check endpoints (/api/health)
- .dockerignore to exclude unnecessary files
- BuildKit cache mounts for faster builds
- Security scanning with Docker Scout

#### TR2: Kubernetes Best Practices (2025)
- Resource requests and limits defined
- Health probes configured (liveness, readiness, startup)
- Security contexts (non-root, drop capabilities)
- Pod anti-affinity for high availability
- Rolling update strategy (maxSurge: 1, maxUnavailable: 0)
- Namespace isolation
- Labels and selectors properly configured

#### TR3: Helm Best Practices (2025)
- Semantic versioning (1.0.0)
- Template helpers in _helpers.tpl
- Values documented with comments
- Multiple values files for environments
- NOTES.txt for post-install instructions
- Helm lint validation
- Dependencies properly managed

#### TR4: Cloud-Native Patterns
- 12-Factor App compliance
- Stateless application design
- Configuration via environment variables
- Externalized secrets
- Logs to stdout/stderr
- Health checks for orchestration
- Graceful shutdown handling

### Non-Functional Requirements

#### NFR1: Scalability
- Horizontal scaling via HPA
- Stateless pods (can be killed/restarted)
- Multiple replicas for high availability
- Load balancing across pods

#### NFR2: Reliability
- Pod restarts don't lose data (external database)
- Conversation state persisted to database
- Rolling updates ensure zero downtime
- Health checks restart unhealthy pods

#### NFR3: Security
- Containers run as non-root users
- Secrets stored in Kubernetes Secrets (not code)
- Minimal base images (reduced attack surface)
- Image vulnerability scanning
- Network policies (optional)

#### NFR4: Observability
- Structured logs to stdout
- Health check endpoints
- Resource metrics (CPU, memory)
- Pod status monitoring
- Kubernetes events tracking

#### NFR5: Performance
- Multi-stage builds reduce image size by 50-80%
- Resource limits prevent resource starvation
- HPA ensures adequate capacity under load
- Efficient container startup (< 30 seconds)

## Acceptance Criteria

### Docker Containerization
- [ ] Frontend Dockerfile creates working container (< 150MB)
- [ ] Backend Dockerfile creates working container (< 100MB)
- [ ] docker-compose.yml runs both services successfully
- [ ] Containers pass health checks
- [ ] Containers run as non-root users
- [ ] Images pass Docker Scout vulnerability scan

### Kubernetes Deployment
- [ ] All Kubernetes manifests are valid (kubectl apply succeeds)
- [ ] Frontend deployment has 2+ running pods
- [ ] Backend deployment has 2+ running pods
- [ ] Services are created and accessible
- [ ] Ingress is created and routes traffic correctly
- [ ] ConfigMap contains non-sensitive configuration
- [ ] Secret contains sensitive data (not committed to Git)
- [ ] HPA is configured and responds to load

### Helm Chart
- [ ] Helm chart passes `helm lint`
- [ ] Chart installs successfully: `helm install todo-app ./helm-chart`
- [ ] Chart upgrades successfully: `helm upgrade todo-app ./helm-chart`
- [ ] Values files work for dev and prod environments
- [ ] NOTES.txt displays helpful post-install instructions
- [ ] Chart can be packaged: `helm package ./helm-chart`

### Minikube Deployment
- [ ] Minikube starts with adequate resources
- [ ] Ingress addon is enabled
- [ ] Metrics-server addon is enabled
- [ ] Application deploys successfully
- [ ] All pods reach Running/Ready state
- [ ] Application is accessible at http://todo.local
- [ ] AI chatbot functionality works in Kubernetes
- [ ] HPA scales pods based on load

### Application Functionality
- [ ] Users can log in via Better Auth
- [ ] Users can interact with AI chatbot
- [ ] Users can add tasks via natural language
- [ ] Users can view tasks via natural language
- [ ] Users can complete tasks via natural language
- [ ] Users can delete tasks via natural language
- [ ] Users can update tasks via natural language
- [ ] Conversation history persists across pod restarts
- [ ] Task data persists across pod restarts

### AI-Assisted DevOps (Optional Bonus)
- [ ] Docker AI (Gordon) used for Dockerfile optimization
- [ ] kubectl-ai used for Kubernetes operations
- [ ] kagent used for cluster analysis (optional)

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│              Minikube Cluster                        │
│                                                      │
│  ┌──────────────┐                                   │
│  │   Ingress    │                                   │
│  │   (NGINX)    │                                   │
│  └──────┬───────┘                                   │
│         │                                           │
│    ┌────┴────┐                                      │
│    │         │                                      │
│ ┌──▼──┐   ┌─▼────┐                                │
│ │ /   │   │ /api │                                 │
│ │Front│   │  →   │                                 │
│ │ end │   │Backend│                                │
│ │Svc  │   │ Svc  │                                 │
│ └──┬──┘   └──┬───┘                                │
│    │         │                                      │
│ ┌──▼──────┐ │┌─▼─────────┐                        │
│ │Frontend │ ││ Backend   │                         │
│ │  Pods   │ ││  Pods     │                         │
│ │ (2-10)  │ ││ (2-20)    │                         │
│ │   HPA   │ ││   HPA     │                         │
│ └─────────┘ │└───────────┘                        │
└─────────────┼───────────────────────────────────────┘
              │
         ┌────▼──────────┐
         │   External    │
         │   Neon DB     │
         │  (PostgreSQL) │
         └───────────────┘
```

### Container Architecture
```
Frontend Container (Next.js)          Backend Container (FastAPI)
┌───────────────────────┐            ┌───────────────────────┐
│ Node.js 20-alpine     │            │ Python 3.13-alpine    │
│ ┌───────────────────┐ │            │ ┌───────────────────┐ │
│ │ Next.js App       │ │            │ │ FastAPI App       │ │
│ │ (standalone)      │ │            │ │ + OpenAI Agents   │ │
│ │                   │ │            │ │ + MCP Server      │ │
│ │ Port: 3000        │ │            │ │                   │ │
│ │ User: nextjs:1001 │ │            │ │ Port: 8000        │ │
│ │                   │ │            │ │ User: appuser:1000│ │
│ └───────────────────┘ │            │ └───────────────────┘ │
│ Size: ~127MB          │            │ Size: ~89MB           │
└───────────────────────┘            └───────────────────────┘
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Package applications |
| **Container Registry** | Docker Hub / GHCR | Store images |
| **Orchestration** | Kubernetes (Minikube) | Manage containers |
| **Package Manager** | Helm 3+ | Deploy to K8s |
| **Ingress Controller** | NGINX | Route external traffic |
| **Autoscaling** | HPA (metrics-server) | Scale based on load |
| **AI DevOps** | kubectl-ai, kagent, Gordon | AI-assisted operations |

## External Dependencies

### Required
- Docker Desktop (with Kubernetes enabled) or Minikube
- kubectl CLI
- Helm 3+
- Neon PostgreSQL database (external)
- OpenAI API (for chatbot)

### Optional
- kubectl-ai (AI-assisted Kubernetes)
- kagent (cluster analysis)
- Docker AI / Gordon (Docker optimization)

## Success Metrics

### Deployment Metrics
- **Image Size**: Frontend < 150MB, Backend < 100MB
- **Startup Time**: Pods ready within 30 seconds
- **Build Time**: Docker build < 5 minutes per service
- **Deployment Time**: Helm install < 2 minutes

### Runtime Metrics
- **Availability**: 99%+ (multiple replicas)
- **Response Time**: API response < 500ms (p95)
- **Resource Usage**: CPU < 70% average, Memory < 80% average
- **Auto-scaling**: HPA scales within 60 seconds of threshold

## Out of Scope

### Phase 4 Does NOT Include
- ❌ Cloud Kubernetes deployment (GKE/EKS/AKS) → Phase V
- ❌ Kafka event streaming → Phase V
- ❌ Dapr sidecar integration → Phase V
- ❌ Advanced Level features (recurring tasks, reminders) → Phase V
- ❌ Intermediate Level features (priorities, tags) → Phase V
- ❌ Multi-region deployment
- ❌ Service mesh (Istio/Linkerd)
- ❌ GitOps (ArgoCD/Flux)

## Risks and Mitigations

### Risk 1: Image Size Too Large
**Impact**: Slow deployments, high bandwidth usage
**Mitigation**:
- Use multi-stage builds
- Use Alpine base images
- Optimize dependency installation
- Use .dockerignore

### Risk 2: Minikube Resource Constraints
**Impact**: Pods crash due to insufficient resources
**Mitigation**:
- Start Minikube with 4 CPUs, 8GB RAM
- Set appropriate resource limits
- Monitor resource usage

### Risk 3: Ingress Not Working
**Impact**: Cannot access application
**Mitigation**:
- Enable ingress addon
- Update /etc/hosts correctly
- Use port-forward as fallback
- Use minikube tunnel for LoadBalancer

### Risk 4: Secrets Committed to Git
**Impact**: Security vulnerability
**Mitigation**:
- Use .gitignore for secret.yaml
- Inject secrets via --set flags
- Use external secret management
- Document secret management in README

### Risk 5: HPA Not Scaling
**Impact**: Poor performance under load
**Mitigation**:
- Enable metrics-server addon
- Verify resource requests are set
- Test HPA with load
- Monitor HPA events

## Documentation Requirements

### Required Documentation
1. **README.md**: Overview and quick start
2. **docs/deployment-minikube.md**: Detailed Minikube deployment guide
3. **docs/troubleshooting.md**: Common issues and solutions
4. **helm-chart/templates/NOTES.txt**: Post-install instructions
5. **.env.example**: Environment variable template
6. **specs/features/phase4-kubernetes-deployment/**: This spec, plan, tasks

### Optional Documentation
7. **docs/architecture.md**: Detailed architecture diagrams
8. **docs/docker.md**: Docker build guide
9. **docs/helm.md**: Helm chart customization guide

## Related Specifications
- Phase III Chatbot Spec: `specs/features/chatbot/spec.md`
- Database Schema: `specs/database/schema.md`
- API Endpoints: `specs/api/rest-endpoints.md`
- Architecture: `specs/architecture.md`

## Approval & Sign-Off

### Stakeholders
- **Product Owner**: [Name]
- **Technical Lead**: [Name]
- **DevOps Engineer**: [Name]

### Status
- [ ] Specification Approved
- [ ] Architecture Reviewed
- [ ] Security Reviewed
- [ ] Ready for Planning

---

**Document Version**: 1.0.0
**Created**: 2026-01-12
**Last Updated**: 2026-01-12
**Status**: Draft → Ready for Planning
