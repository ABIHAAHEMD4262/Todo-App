# Kubernetes Manifests - Todo App Phase 4

This directory contains Kubernetes manifests for deploying the Todo App to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (Minikube, GKE, EKS, AKS, etc.)
- kubectl CLI installed and configured
- Docker images built and available:
  - `todo-frontend:v1.0.0`
  - `todo-backend:v1.0.0`

## Manifests Overview

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates `todo-app` namespace |
| `configmap.yaml` | Non-sensitive configuration (API URLs, log level) |
| `secret.yaml.template` | Template for secrets (DATABASE_URL, API keys) |
| `deployment-frontend.yaml` | Frontend deployment with 2 replicas |
| `deployment-backend.yaml` | Backend deployment with 2 replicas |
| `service-frontend.yaml` | ClusterIP service for frontend (port 3000) |
| `service-backend.yaml` | ClusterIP service for backend (port 8000) |
| `ingress.yaml` | Ingress for external access with path-based routing |
| `hpa-frontend.yaml` | Horizontal Pod Autoscaler for frontend (2-10 replicas) |
| `hpa-backend.yaml` | Horizontal Pod Autoscaler for backend (2-20 replicas) |

## Deployment Instructions

### 1. Create Secrets

First, create the secrets file from the template:

```bash
# Copy template
cp secret.yaml.template secret.yaml

# Edit secret.yaml and replace placeholders:
# - ${DATABASE_URL} - Your Neon PostgreSQL connection string
# - ${BETTER_AUTH_SECRET} - Your Better Auth secret key
# - ${OPENAI_API_KEY} - Your OpenAI API key
```

**IMPORTANT**: Never commit `secret.yaml` to Git. It's listed in `.gitignore`.

### 2. Apply Manifests

Apply manifests in the following order:

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create configuration
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Deploy applications
kubectl apply -f deployment-frontend.yaml
kubectl apply -f deployment-backend.yaml

# Create services
kubectl apply -f service-frontend.yaml
kubectl apply -f service-backend.yaml

# Create ingress
kubectl apply -f ingress.yaml

# Enable autoscaling
kubectl apply -f hpa-frontend.yaml
kubectl apply -f hpa-backend.yaml
```

Or apply all at once:

```bash
kubectl apply -f namespace.yaml -f configmap.yaml -f secret.yaml
kubectl apply -f deployment-frontend.yaml -f deployment-backend.yaml
kubectl apply -f service-frontend.yaml -f service-backend.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa-frontend.yaml -f hpa-backend.yaml
```

### 3. Verify Deployment

```bash
# Check namespace
kubectl get namespace todo-app

# Check all resources
kubectl get all -n todo-app

# Check pods
kubectl get pods -n todo-app

# Check services
kubectl get svc -n todo-app

# Check ingress
kubectl get ingress -n todo-app

# Check HPA
kubectl get hpa -n todo-app

# Check pod logs
kubectl logs -f <pod-name> -n todo-app

# Check pod details
kubectl describe pod <pod-name> -n todo-app
```

### 4. Access the Application

#### Minikube

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts)
<minikube-ip> todo.local

# Access application
http://todo.local
```

#### Cloud Kubernetes (GKE, EKS, AKS)

```bash
# Get external IP
kubectl get ingress -n todo-app

# Update DNS or /etc/hosts
<external-ip> todo.yourdomain.com

# Access application
http://todo.yourdomain.com
```

## Resource Configuration

### Frontend (Next.js)

- **Replicas**: 2 (min), 10 (max with HPA)
- **CPU**: 250m (request), 500m (limit)
- **Memory**: 256Mi (request), 512Mi (limit)
- **Autoscaling**: 70% CPU, 80% Memory

### Backend (FastAPI)

- **Replicas**: 2 (min), 20 (max with HPA)
- **CPU**: 500m (request), 1000m (limit)
- **Memory**: 512Mi (request), 1Gi (limit)
- **Autoscaling**: 70% CPU, 80% Memory

## Health Checks

### Frontend
- **Liveness**: GET `/api/health` (port 3000)
- **Readiness**: GET `/api/health` (port 3000)
- **Startup**: GET `/api/health` (port 3000)

### Backend
- **Liveness**: GET `/health` (port 8000)
- **Readiness**: GET `/health` (port 8000)
- **Startup**: GET `/health` (port 8000)

## Security Features

- Non-root users (frontend: 1001, backend: 1000)
- Read-only root filesystem (where applicable)
- Drop all capabilities
- No privilege escalation
- Pod anti-affinity for high availability
- Secrets management for sensitive data

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n todo-app

# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Check pod logs
kubectl logs <pod-name> -n todo-app
```

### ImagePullBackOff errors

```bash
# Verify image exists
docker images | grep todo

# For Minikube, use local images
eval $(minikube docker-env)
docker build -t todo-frontend:v1.0.0 ./frontend
docker build -t todo-backend:v1.0.0 ./backend
```

### Service not accessible

```bash
# Check service endpoints
kubectl get endpoints -n todo-app

# Port forward for testing
kubectl port-forward -n todo-app svc/todo-frontend 3000:3000
kubectl port-forward -n todo-app svc/todo-backend 8000:8000
```

### HPA not scaling

```bash
# Check metrics server
kubectl top nodes
kubectl top pods -n todo-app

# Check HPA status
kubectl describe hpa -n todo-app
```

## Updating the Deployment

```bash
# Update image
kubectl set image deployment/todo-frontend frontend=todo-frontend:v1.1.0 -n todo-app

# Or apply updated manifest
kubectl apply -f deployment-frontend.yaml

# Watch rollout
kubectl rollout status deployment/todo-frontend -n todo-app

# Rollback if needed
kubectl rollout undo deployment/todo-frontend -n todo-app
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace todo-app

# Or delete individually
kubectl delete -f hpa-backend.yaml -f hpa-frontend.yaml
kubectl delete -f ingress.yaml
kubectl delete -f service-backend.yaml -f service-frontend.yaml
kubectl delete -f deployment-backend.yaml -f deployment-frontend.yaml
kubectl delete -f secret.yaml -f configmap.yaml
kubectl delete -f namespace.yaml
```

## Next Steps

- Set up Helm chart for easier deployment (see `../helm/` directory)
- Configure TLS/SSL certificates with cert-manager
- Set up monitoring with Prometheus and Grafana
- Configure log aggregation with ELK stack
- Implement GitOps with ArgoCD or Flux

---

**Phase**: 4 - Kubernetes Deployment
**Last Updated**: 2026-01-12
**Kubernetes Version**: 1.28+
