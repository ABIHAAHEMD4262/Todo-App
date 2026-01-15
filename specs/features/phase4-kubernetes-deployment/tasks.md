# Phase 4 Kubernetes Deployment - Task Breakdown

## Overview
This document breaks down the Phase 4 implementation into actionable, testable tasks. Each task includes acceptance criteria, dependencies, and estimated effort.

## Task Categories
- **[DOCKER]**: Docker containerization tasks
- **[K8S]**: Kubernetes manifest tasks
- **[HELM]**: Helm chart tasks
- **[DEPLOY]**: Deployment and testing tasks
- **[DOC]**: Documentation tasks

---

## Epic 1: Docker Containerization

### TASK-001: Update Next.js Configuration for Standalone Output
**Category**: [DOCKER]
**Priority**: High
**Effort**: 15 minutes
**Dependencies**: None

**Description**: Configure Next.js to generate standalone output for optimized Docker deployment.

**Steps**:
1. Open `frontend/next.config.js`
2. Add `output: 'standalone'` to config
3. Test local build: `npm run build`
4. Verify `.next/standalone` directory is created

**Acceptance Criteria**:
- [ ] `next.config.js` has `output: 'standalone'`
- [ ] `npm run build` succeeds
- [ ] `.next/standalone/` directory exists after build
- [ ] Standalone server starts: `node .next/standalone/server.js`

---

### TASK-002: Create Frontend Dockerfile
**Category**: [DOCKER]
**Priority**: High
**Effort**: 1 hour
**Dependencies**: TASK-001

**Description**: Create multi-stage Dockerfile for Next.js frontend using Alpine Linux and latest best practices.

**Use Skill**: `@.claude/skills/docker-containerization/SKILL.md`

**Steps**:
1. Create `frontend/Dockerfile`
2. Implement stages: base, deps, build-deps, builder, production
3. Configure non-root user (nodejs:1001)
4. Add health check endpoint
5. Optimize with BuildKit cache mounts
6. Create `frontend/.dockerignore`

**Acceptance Criteria**:
- [ ] Multi-stage Dockerfile with 5 stages
- [ ] Uses Node 20-alpine base image
- [ ] Non-root user configured (nodejs:1001)
- [ ] Health check included
- [ ] .dockerignore excludes node_modules, .next, .git
- [ ] Build succeeds: `docker build -t todo-frontend:test ./frontend`
- [ ] Image size < 150MB
- [ ] Container starts successfully
- [ ] Health check passes

**Test**:
```bash
docker build -t todo-frontend:test ./frontend
docker run -p 3000:3000 -e DATABASE_URL="$DATABASE_URL" todo-frontend:test
curl http://localhost:3000/api/health
```

---

### TASK-003: Create Backend Dockerfile
**Category**: [DOCKER]
**Priority**: High
**Effort**: 1 hour
**Dependencies**: None

**Description**: Create multi-stage Dockerfile for FastAPI backend using Python 3.13-alpine and virtual environment.

**Use Skill**: `@.claude/skills/docker-containerization/SKILL.md`

**Steps**:
1. Create `backend/Dockerfile`
2. Implement stages: base, builder, production
3. Use virtual environment for Python dependencies
4. Configure non-root user (appuser:1000)
5. Add health check endpoint
6. Create `backend/.dockerignore`

**Acceptance Criteria**:
- [ ] Multi-stage Dockerfile with 3 stages
- [ ] Uses Python 3.13-alpine base image
- [ ] Virtual environment used
- [ ] Non-root user configured (appuser:1000)
- [ ] Health check included
- [ ] .dockerignore excludes __pycache__, .venv, .env
- [ ] Build succeeds: `docker build -t todo-backend:test ./backend`
- [ ] Image size < 100MB
- [ ] Container starts successfully
- [ ] Health check passes

**Test**:
```bash
docker build -t todo-backend:test ./backend
docker run -p 8000:8000 -e DATABASE_URL="$DATABASE_URL" todo-backend:test
curl http://localhost:8000/health
```

---

### TASK-004: Create Docker Compose Configuration
**Category**: [DOCKER]
**Priority**: Medium
**Effort**: 30 minutes
**Dependencies**: TASK-002, TASK-003

**Description**: Create docker-compose.yml for local development and testing of both services.

**Use Skill**: `@.claude/skills/docker-containerization/SKILL.md`

**Steps**:
1. Create `docker-compose.yml` at project root
2. Define frontend service (port 3000)
3. Define backend service (port 8000)
4. Configure environment variables
5. Set up health checks
6. Create bridge network
7. Add restart policies

**Acceptance Criteria**:
- [ ] docker-compose.yml exists at project root
- [ ] Frontend and backend services defined
- [ ] Environment variables configured
- [ ] Health checks included
- [ ] Network created
- [ ] `docker-compose build` succeeds
- [ ] `docker-compose up` starts both services
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000

**Test**:
```bash
docker-compose build
docker-compose up -d
curl http://localhost:3000/api/health
curl http://localhost:8000/health
docker-compose down
```

---

## Epic 2: Kubernetes Manifests

### TASK-005: Create Namespace Manifest
**Category**: [K8S]
**Priority**: High
**Effort**: 10 minutes
**Dependencies**: None

**Description**: Create Kubernetes namespace for the application.

**Steps**:
1. Create `k8s/namespace.yaml`
2. Define namespace: `todo-app`
3. Add labels

**Acceptance Criteria**:
- [ ] File `k8s/namespace.yaml` exists
- [ ] Namespace name: `todo-app`
- [ ] Labels include environment
- [ ] Valid YAML: `kubectl apply --dry-run=client -f k8s/namespace.yaml`

---

### TASK-006: Create ConfigMap Manifest
**Category**: [K8S]
**Priority**: High
**Effort**: 15 minutes
**Dependencies**: TASK-005

**Description**: Create ConfigMap for non-sensitive configuration.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/configmap.yaml`
2. Add configuration data:
   - api-url: http://todo-backend:8000
   - frontend-url: http://todo-frontend:3000
   - log-level: info
   - environment: development

**Acceptance Criteria**:
- [ ] File `k8s/configmap.yaml` exists
- [ ] All configuration keys defined
- [ ] No sensitive data included
- [ ] Valid YAML

---

### TASK-007: Create Secret Manifest Template
**Category**: [K8S]
**Priority**: High
**Effort**: 15 minutes
**Dependencies**: TASK-005

**Description**: Create Secret template (placeholders only, never commit real secrets).

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/secret.yaml.template`
2. Add placeholder values:
   - database-url: "REPLACE_WITH_DATABASE_URL"
   - better-auth-secret: "REPLACE_WITH_SECRET"
   - openai-api-key: "REPLACE_WITH_API_KEY"
3. Add to `.gitignore`: `k8s/secret.yaml`
4. Document in README how to inject secrets

**Acceptance Criteria**:
- [ ] File `k8s/secret.yaml.template` exists
- [ ] Placeholder values used (not real secrets)
- [ ] `k8s/secret.yaml` added to .gitignore
- [ ] README documents secret injection
- [ ] Type: Opaque
- [ ] stringData format used

---

### TASK-008: Create Frontend Deployment Manifest
**Category**: [K8S]
**Priority**: High
**Effort**: 1 hour
**Dependencies**: TASK-005, TASK-006, TASK-007

**Description**: Create Kubernetes Deployment for frontend with production-ready configuration.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/deployment-frontend.yaml`
2. Configure 2 replicas
3. Set resource requests (256Mi, 250m CPU)
4. Set resource limits (512Mi, 500m CPU)
5. Add liveness probe (/api/health)
6. Add readiness probe (/api/health)
7. Add startup probe (/api/health)
8. Configure security context (non-root, drop capabilities)
9. Add pod anti-affinity
10. Configure rolling update strategy

**Acceptance Criteria**:
- [ ] Deployment name: todo-frontend
- [ ] 2 replicas configured
- [ ] Resource requests and limits set
- [ ] All three probes configured
- [ ] Security context configured
- [ ] Pod anti-affinity configured
- [ ] Rolling update strategy configured
- [ ] Valid YAML
- [ ] Dry-run succeeds

**Test**:
```bash
kubectl apply --dry-run=client -f k8s/deployment-frontend.yaml
```

---

### TASK-009: Create Backend Deployment Manifest
**Category**: [K8S]
**Priority**: High
**Effort**: 1 hour
**Dependencies**: TASK-005, TASK-006, TASK-007

**Description**: Create Kubernetes Deployment for backend with production-ready configuration.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/deployment-backend.yaml`
2. Configure 2 replicas
3. Set resource requests (512Mi, 500m CPU)
4. Set resource limits (1Gi, 1000m CPU)
5. Add health probes (/health)
6. Configure security context
7. Add pod anti-affinity
8. Configure rolling update strategy

**Acceptance Criteria**:
- [ ] Deployment name: todo-backend
- [ ] 2 replicas configured
- [ ] Resource requests and limits set
- [ ] All three probes configured
- [ ] Security context configured
- [ ] Pod anti-affinity configured
- [ ] Rolling update strategy configured
- [ ] Valid YAML
- [ ] Dry-run succeeds

---

### TASK-010: Create Service Manifests
**Category**: [K8S]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: TASK-008, TASK-009

**Description**: Create Kubernetes Services for frontend and backend.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/service-frontend.yaml`
   - Type: ClusterIP
   - Port: 3000
   - Selector: app=todo-frontend
2. Create `k8s/service-backend.yaml`
   - Type: ClusterIP
   - Port: 8000
   - Selector: app=todo-backend

**Acceptance Criteria**:
- [ ] Both service files exist
- [ ] Type: ClusterIP
- [ ] Correct ports configured
- [ ] Selectors match deployment labels
- [ ] Valid YAML
- [ ] Dry-run succeeds

---

### TASK-011: Create Ingress Manifest
**Category**: [K8S]
**Priority**: High
**Effort**: 45 minutes
**Dependencies**: TASK-010

**Description**: Create Ingress for external access with path-based routing.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/ingress.yaml`
2. Configure NGINX ingress class
3. Set host: todo.local
4. Add path rules:
   - /api → todo-backend:8000
   - / → todo-frontend:3000
5. Add annotations for rewrite

**Acceptance Criteria**:
- [ ] File `k8s/ingress.yaml` exists
- [ ] Ingress class: nginx
- [ ] Host: todo.local
- [ ] Path /api routes to backend
- [ ] Path / routes to frontend
- [ ] Annotations configured
- [ ] Valid YAML
- [ ] Dry-run succeeds

---

### TASK-012: Create HPA Manifests
**Category**: [K8S]
**Priority**: Medium
**Effort**: 30 minutes
**Dependencies**: TASK-008, TASK-009

**Description**: Create Horizontal Pod Autoscalers for automatic scaling.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Create `k8s/hpa-frontend.yaml`
   - minReplicas: 2, maxReplicas: 10
   - CPU: 70%, Memory: 80%
2. Create `k8s/hpa-backend.yaml`
   - minReplicas: 2, maxReplicas: 20
   - CPU: 70%, Memory: 80%

**Acceptance Criteria**:
- [ ] Both HPA files exist
- [ ] Min/max replicas configured
- [ ] CPU and memory metrics configured
- [ ] Scale-up/down behavior configured
- [ ] Valid YAML
- [ ] Dry-run succeeds

---

## Epic 3: Helm Chart Packaging

### TASK-013: Create Helm Chart Structure
**Category**: [HELM]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: None

**Description**: Create Helm chart directory structure.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create directory: `helm-chart/`
2. Create subdirectories: `templates/`, `charts/`
3. Create files: `Chart.yaml`, `values.yaml`, `.helmignore`

**Acceptance Criteria**:
- [ ] Directory structure created
- [ ] All required files exist
- [ ] .helmignore configured

---

### TASK-014: Create Chart.yaml
**Category**: [HELM]
**Priority**: High
**Effort**: 15 minutes
**Dependencies**: TASK-013

**Description**: Create Helm chart metadata file.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/Chart.yaml`
2. Set apiVersion: v2
3. Set name: todo-app
4. Set version: 1.0.0
5. Set appVersion: "1.0.0"
6. Add description, keywords, maintainers

**Acceptance Criteria**:
- [ ] File exists
- [ ] All required fields present
- [ ] Valid YAML
- [ ] `helm lint` passes

---

### TASK-015: Create values.yaml with Defaults
**Category**: [HELM]
**Priority**: High
**Effort**: 1 hour
**Dependencies**: TASK-013

**Description**: Create default values file with all configuration options.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/values.yaml`
2. Define global settings
3. Define frontend configuration
4. Define backend configuration
5. Define ingress configuration
6. Define config data
7. Define secret templates
8. Add comments for all values

**Acceptance Criteria**:
- [ ] All configuration options included
- [ ] Sensible defaults provided
- [ ] All values documented with comments
- [ ] Valid YAML
- [ ] `helm lint` passes

---

### TASK-016: Create values-dev.yaml
**Category**: [HELM]
**Priority**: Medium
**Effort**: 20 minutes
**Dependencies**: TASK-015

**Description**: Create development environment overrides.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/values-dev.yaml`
2. Override for single replicas
3. Override for lower resource limits
4. Override for todo.local hostname
5. Disable autoscaling

**Acceptance Criteria**:
- [ ] File exists
- [ ] Development-specific overrides
- [ ] Valid YAML

---

### TASK-017: Create values-prod.yaml
**Category**: [HELM]
**Priority**: Medium
**Effort**: 20 minutes
**Dependencies**: TASK-015

**Description**: Create production environment overrides.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/values-prod.yaml`
2. Override for multiple replicas
3. Override for higher resource limits
4. Override for production hostname
5. Enable autoscaling

**Acceptance Criteria**:
- [ ] File exists
- [ ] Production-specific overrides
- [ ] Valid YAML

---

### TASK-018: Create Template Helpers
**Category**: [HELM]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: TASK-013

**Description**: Create reusable template helper functions.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/templates/_helpers.tpl`
2. Add helper: todo-app.name
3. Add helper: todo-app.fullname
4. Add helper: todo-app.chart
5. Add helper: todo-app.labels
6. Add helper: todo-app.selectorLabels
7. Add helper: todo-app.imageTag

**Acceptance Criteria**:
- [ ] File exists
- [ ] All helpers defined
- [ ] Helpers work in templates
- [ ] `helm template` renders correctly

---

### TASK-019: Convert K8s Manifests to Helm Templates
**Category**: [HELM]
**Priority**: High
**Effort**: 2 hours
**Dependencies**: TASK-005 through TASK-012, TASK-018

**Description**: Convert all Kubernetes manifests to Helm templates with parameterization.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
For each K8s manifest:
1. Copy to `helm-chart/templates/`
2. Replace hardcoded values with `{{ .Values.* }}`
3. Replace names with `{{ include "todo-app.fullname" . }}`
4. Add labels using helpers
5. Add conditionals where needed

**Acceptance Criteria**:
- [ ] All manifests converted
- [ ] No hardcoded values remain
- [ ] Template helpers used
- [ ] `helm template` renders valid K8s YAML
- [ ] `helm lint` passes

---

### TASK-020: Create NOTES.txt
**Category**: [HELM]
**Priority**: Medium
**Effort**: 20 minutes
**Dependencies**: TASK-013

**Description**: Create post-installation instructions for users.

**Use Skill**: `@.claude/skills/helm-charts/SKILL.md`

**Steps**:
1. Create `helm-chart/templates/NOTES.txt`
2. Add access URL instructions
3. Add status check commands
4. Add log viewing commands
5. Add port-forward alternatives

**Acceptance Criteria**:
- [ ] File exists
- [ ] Clear instructions provided
- [ ] Includes all access methods
- [ ] Displays after `helm install`

---

## Epic 4: Minikube Deployment

### TASK-021: Set Up Minikube
**Category**: [DEPLOY]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: None

**Description**: Install and configure Minikube for local Kubernetes testing.

**Use Skill**: `@.claude/skills/minikube-local-k8s/SKILL.md`

**Steps**:
1. Verify Minikube installation: `minikube version`
2. Start Minikube: `minikube start --cpus=4 --memory=8192`
3. Enable ingress addon: `minikube addons enable ingress`
4. Enable metrics-server: `minikube addons enable metrics-server`
5. Verify: `kubectl get nodes`

**Acceptance Criteria**:
- [ ] Minikube installed
- [ ] Cluster started with 4 CPUs, 8GB RAM
- [ ] Ingress addon enabled
- [ ] Metrics-server addon enabled
- [ ] `kubectl get nodes` shows Ready status
- [ ] `minikube status` shows running

---

### TASK-022: Build Docker Images in Minikube
**Category**: [DEPLOY]
**Priority**: High
**Effort**: 20 minutes
**Dependencies**: TASK-002, TASK-003, TASK-021

**Description**: Build Docker images inside Minikube to avoid registry push/pull.

**Use Skill**: `@.claude/skills/minikube-local-k8s/SKILL.md`

**Steps**:
1. Use Minikube Docker: `eval $(minikube docker-env)`
2. Build frontend: `docker build -t todo-frontend:v1.0.0 ./frontend`
3. Build backend: `docker build -t todo-backend:v1.0.0 ./backend`
4. Verify: `minikube image ls | grep todo`

**Acceptance Criteria**:
- [ ] Minikube Docker environment active
- [ ] Frontend image built
- [ ] Backend image built
- [ ] Images visible in `minikube image ls`

---

### TASK-023: Deploy Application with Helm
**Category**: [DEPLOY]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: TASK-014 through TASK-020, TASK-022

**Description**: Deploy the application to Minikube using Helm chart.

**Use Skill**: `@.claude/skills/minikube-local-k8s/SKILL.md`

**Steps**:
1. Create namespace: `kubectl create namespace todo-app`
2. Install Helm chart with dev values and secret injection
3. Watch pods: `kubectl get pods -n todo-app -w`
4. Wait for all pods to be Ready

**Acceptance Criteria**:
- [ ] Namespace created
- [ ] Helm install succeeds
- [ ] All pods reach Running state
- [ ] All pods reach Ready state
- [ ] Services created
- [ ] Ingress created
- [ ] HPA created
- [ ] No pod errors in logs

**Command**:
```bash
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
```

---

### TASK-024: Configure Application Access
**Category**: [DEPLOY]
**Priority**: High
**Effort**: 10 minutes
**Dependencies**: TASK-023

**Description**: Configure local machine to access application via Ingress.

**Use Skill**: `@.claude/skills/minikube-local-k8s/SKILL.md`

**Steps**:
1. Get Minikube IP: `minikube ip`
2. Add to /etc/hosts: `echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts`
3. Verify Ingress: `kubectl get ingress -n todo-app`

**Acceptance Criteria**:
- [ ] Minikube IP obtained
- [ ] /etc/hosts updated
- [ ] Ingress shows ADDRESS
- [ ] Can resolve todo.local: `ping todo.local`

---

### TASK-025: Verify Application Functionality
**Category**: [DEPLOY]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: TASK-024

**Description**: Test that all application features work in Kubernetes.

**Steps**:
1. Access http://todo.local
2. Log in with Better Auth
3. Open chatbot
4. Send message
5. Add task via natural language
6. View tasks
7. Complete task
8. Delete task
9. Check logs for errors

**Acceptance Criteria**:
- [ ] Application loads at http://todo.local
- [ ] Login works
- [ ] Chatbot interface loads
- [ ] Can send messages
- [ ] Can add tasks
- [ ] Can view tasks
- [ ] Can complete tasks
- [ ] Can delete tasks
- [ ] No errors in logs

---

### TASK-026: Test Kubernetes-Specific Features
**Category**: [DEPLOY]
**Priority**: Medium
**Effort**: 30 minutes
**Dependencies**: TASK-025

**Description**: Verify Kubernetes orchestration features work correctly.

**Use Skill**: `@.claude/skills/k8s-deployment/SKILL.md`

**Steps**:
1. Test pod restart: Delete frontend pod, verify new pod starts
2. Test pod restart: Delete backend pod, verify new pod starts
3. Test data persistence: Restart Minikube, verify data persists
4. Test HPA: Generate load, verify pods scale up
5. Test HPA: Remove load, verify pods scale down

**Acceptance Criteria**:
- [ ] Deleted pods restart automatically
- [ ] Application continues working after pod restarts
- [ ] Data persists across Minikube restart
- [ ] HPA scales up under load
- [ ] HPA scales down after load removed
- [ ] `kubectl get hpa -n todo-app` shows metrics

---

## Epic 5: Documentation

### TASK-027: Create Main README Section for Phase 4
**Category**: [DOC]
**Priority**: High
**Effort**: 30 minutes
**Dependencies**: All deployment tasks complete

**Description**: Add Phase 4 deployment section to main README.md.

**Steps**:
1. Add "Phase 4: Kubernetes Deployment" section
2. Document prerequisites
3. Document deployment steps
4. Add troubleshooting tips
5. Link to detailed guides

**Acceptance Criteria**:
- [ ] Section added to README.md
- [ ] Prerequisites listed
- [ ] Quick start guide included
- [ ] Links to detailed docs
- [ ] Troubleshooting section

---

### TASK-028: Create Deployment Guide
**Category**: [DOC]
**Priority**: High
**Effort**: 45 minutes
**Dependencies**: All deployment tasks complete

**Description**: Create comprehensive Minikube deployment guide.

**Steps**:
1. Create `docs/deployment-minikube.md`
2. Document step-by-step deployment
3. Include all commands
4. Add verification steps
5. Add troubleshooting section

**Acceptance Criteria**:
- [ ] File created
- [ ] Step-by-step instructions
- [ ] All commands included and tested
- [ ] Verification steps included
- [ ] Troubleshooting section comprehensive

---

### TASK-029: Create Troubleshooting Guide
**Category**: [DOC]
**Priority**: Medium
**Effort**: 30 minutes
**Dependencies**: TASK-025, TASK-026

**Description**: Document common issues and solutions.

**Steps**:
1. Create `docs/troubleshooting-phase4.md`
2. Document ImagePullBackOff solutions
3. Document CrashLoopBackOff solutions
4. Document Ingress issues
5. Document HPA issues
6. Add debugging commands

**Acceptance Criteria**:
- [ ] File created
- [ ] At least 5 common issues documented
- [ ] Solutions provided for each issue
- [ ] Debugging commands included

---

### TASK-030: Update .env.example for Phase 4
**Category**: [DOC]
**Priority**: Low
**Effort**: 10 minutes
**Dependencies**: None

**Description**: Ensure .env.example has all required variables for Phase 4.

**Steps**:
1. Review current .env.example
2. Add any missing Phase 4 variables
3. Add comments explaining usage

**Acceptance Criteria**:
- [ ] All required variables present
- [ ] Comments explain each variable
- [ ] No real secrets included

---

## Task Summary

### By Epic
- **Epic 1: Docker**: 4 tasks (~3 hours)
- **Epic 2: Kubernetes**: 8 tasks (~6 hours)
- **Epic 3: Helm**: 8 tasks (~6 hours)
- **Epic 4: Deployment**: 6 tasks (~3 hours)
- **Epic 5: Documentation**: 4 tasks (~2 hours)

### Total Effort
- **30 tasks**
- **~20 hours** (estimated)

### Critical Path
1. TASK-001 → TASK-002 → TASK-004 → TASK-022 → TASK-023 → TASK-024 → TASK-025

### Recommended Execution Order
**Phase 1 (Docker)**: TASK-001, TASK-002, TASK-003, TASK-004
**Phase 2 (K8s Manifests)**: TASK-005 through TASK-012
**Phase 3 (Helm)**: TASK-013 through TASK-020
**Phase 4 (Deploy)**: TASK-021 through TASK-026
**Phase 5 (Docs)**: TASK-027 through TASK-030

## Task Tracking

Use this checklist to track progress:

### Epic 1: Docker ✓
- [ ] TASK-001: Update Next.js config
- [ ] TASK-002: Frontend Dockerfile
- [ ] TASK-003: Backend Dockerfile
- [ ] TASK-004: Docker Compose

### Epic 2: Kubernetes ✓
- [ ] TASK-005: Namespace
- [ ] TASK-006: ConfigMap
- [ ] TASK-007: Secret template
- [ ] TASK-008: Frontend Deployment
- [ ] TASK-009: Backend Deployment
- [ ] TASK-010: Services
- [ ] TASK-011: Ingress
- [ ] TASK-012: HPA

### Epic 3: Helm ✓
- [ ] TASK-013: Chart structure
- [ ] TASK-014: Chart.yaml
- [ ] TASK-015: values.yaml
- [ ] TASK-016: values-dev.yaml
- [ ] TASK-017: values-prod.yaml
- [ ] TASK-018: Template helpers
- [ ] TASK-019: Convert manifests
- [ ] TASK-020: NOTES.txt

### Epic 4: Deployment ✓
- [ ] TASK-021: Minikube setup
- [ ] TASK-022: Build images
- [ ] TASK-023: Helm deploy
- [ ] TASK-024: Configure access
- [ ] TASK-025: Verify functionality
- [ ] TASK-026: Test K8s features

### Epic 5: Documentation ✓
- [ ] TASK-027: README section
- [ ] TASK-028: Deployment guide
- [ ] TASK-029: Troubleshooting guide
- [ ] TASK-030: Update .env.example

---

**Document Version**: 1.0.0
**Created**: 2026-01-12
**Last Updated**: 2026-01-12
**Status**: Ready for Implementation
