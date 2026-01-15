# Todo App Helm Chart

A production-ready Helm chart for deploying the AI-powered Todo application with Next.js frontend and FastAPI backend to Kubernetes.

## Features

- ✅ Multi-environment support (dev, staging, prod)
- ✅ Horizontal Pod Autoscaling (HPA)
- ✅ Health probes (liveness, readiness, startup)
- ✅ Security contexts and pod anti-affinity
- ✅ Ingress with path-based routing
- ✅ ConfigMaps and Secrets management
- ✅ Service Account with RBAC
- ✅ Pod Disruption Budgets
- ✅ Resource requests and limits

## Prerequisites

- Kubernetes 1.25+
- Helm 3.0+
- kubectl configured
- Docker images built and available:
  - `todo-frontend:v1.0.0`
  - `todo-backend:v1.0.0`

## Installation

### Quick Start

```bash
# Install with default values
helm install todo-app ./helm-chart \
  --set secrets.databaseUrl="postgresql://..." \
  --set secrets.betterAuthSecret="..." \
  --set secrets.openaiApiKey="..."

# Or create a secrets file (don't commit!)
cat > secrets.yaml <<EOF
secrets:
  databaseUrl: "postgresql://user:password@neon.tech:5432/tododb?sslmode=require"
  betterAuthSecret: "your-secret-key-here"
  openaiApiKey: "sk-your-openai-api-key"
EOF

helm install todo-app ./helm-chart -f secrets.yaml
```

### Install for Specific Environment

```bash
# Development
helm install todo-app-dev ./helm-chart \
  -f helm-chart/values-dev.yaml \
  -f secrets.yaml

# Staging
helm install todo-app-staging ./helm-chart \
  -f helm-chart/values-staging.yaml \
  -f secrets.yaml

# Production
helm install todo-app-prod ./helm-chart \
  -f helm-chart/values-prod.yaml \
  -f secrets.yaml
```

### Install to Specific Namespace

```bash
helm install todo-app ./helm-chart \
  --create-namespace \
  --namespace todo-app \
  -f secrets.yaml
```

## Configuration

### Values Files

| File | Description | Use Case |
|------|-------------|----------|
| `values.yaml` | Default values | Base configuration |
| `values-dev.yaml` | Development overrides | Local/dev environment |
| `values-staging.yaml` | Staging overrides | Pre-production testing |
| `values-prod.yaml` | Production overrides | Production deployment |

### Key Configuration Options

#### Frontend

```yaml
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: v1.0.0
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
```

#### Backend

```yaml
backend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-backend
    tag: v1.0.0
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
```

#### Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: todo.example.com
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend
  tls:
    - secretName: todo-tls-cert
      hosts:
        - todo.example.com
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade todo-app ./helm-chart -f secrets.yaml

# Upgrade with specific image tag
helm upgrade todo-app ./helm-chart \
  --set imageTag=v1.1.0 \
  -f secrets.yaml

# Upgrade to production configuration
helm upgrade todo-app ./helm-chart \
  -f helm-chart/values-prod.yaml \
  -f secrets.yaml
```

## Rollback

```bash
# View release history
helm history todo-app

# Rollback to previous version
helm rollback todo-app

# Rollback to specific revision
helm rollback todo-app 3
```

## Uninstalling

```bash
# Uninstall release
helm uninstall todo-app

# Uninstall and delete namespace
helm uninstall todo-app
kubectl delete namespace todo-app
```

## Monitoring

### Check Deployment Status

```bash
# Get all resources
kubectl get all -n todo-app

# Check pods
kubectl get pods -n todo-app

# Check services
kubectl get svc -n todo-app

# Check ingress
kubectl get ingress -n todo-app

# Check HPA
kubectl get hpa -n todo-app
```

### View Logs

```bash
# Frontend logs
kubectl logs -f deployment/todo-app-frontend -n todo-app

# Backend logs
kubectl logs -f deployment/todo-app-backend -n todo-app

# All pods
kubectl logs -f -l app.kubernetes.io/name=todo-app -n todo-app
```

### Describe Resources

```bash
# Describe deployment
kubectl describe deployment todo-app-frontend -n todo-app

# Describe pod
kubectl describe pod <pod-name> -n todo-app

# Describe HPA
kubectl describe hpa todo-app-frontend -n todo-app
```

## Testing

### Port Forwarding

```bash
# Frontend
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:3000

# Backend
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000

# Then access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### Exec into Pod

```bash
# Get a shell
kubectl exec -it <pod-name> -n todo-app -- sh

# Run command
kubectl exec <pod-name> -n todo-app -- curl localhost:3000/api/health
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n todo-app

# View pod events
kubectl describe pod <pod-name> -n todo-app

# Check logs
kubectl logs <pod-name> -n todo-app
```

### ImagePullBackOff

```bash
# Check image name and tag in deployment
kubectl get deployment todo-app-frontend -n todo-app -o yaml | grep image:

# For Minikube, ensure you're using Minikube's Docker daemon
eval $(minikube docker-env)
docker images | grep todo
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n todo-app

# Check if pods are ready
kubectl get pods -n todo-app

# Test service directly
kubectl run -it --rm debug --image=alpine --restart=Never -- wget -qO- http://todo-app-backend:8000/health
```

### HPA Not Scaling

```bash
# Check metrics server
kubectl top nodes
kubectl top pods -n todo-app

# Install metrics server if missing (Minikube)
minikube addons enable metrics-server

# Check HPA status
kubectl describe hpa todo-app-frontend -n todo-app
```

## Customization

### Override Specific Values

```bash
# Override image tag
helm install todo-app ./helm-chart \
  --set imageTag=v2.0.0 \
  -f secrets.yaml

# Override replica count
helm install todo-app ./helm-chart \
  --set frontend.replicaCount=3 \
  --set backend.replicaCount=5 \
  -f secrets.yaml

# Disable autoscaling
helm install todo-app ./helm-chart \
  --set frontend.autoscaling.enabled=false \
  --set backend.autoscaling.enabled=false \
  -f secrets.yaml
```

### Use Custom Values File

Create `my-values.yaml`:

```yaml
imageTag: v1.2.0

frontend:
  replicaCount: 5

backend:
  resources:
    requests:
      memory: "1Gi"
      cpu: "1000m"

ingress:
  hosts:
    - host: my-todo.example.com
```

Install:

```bash
helm install todo-app ./helm-chart \
  -f my-values.yaml \
  -f secrets.yaml
```

## Security Best Practices

1. **Never commit secrets**: Keep secrets in a separate file not tracked by Git
2. **Use external secret management**: Consider using:
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - Sealed Secrets
3. **Enable TLS**: Use cert-manager for automatic SSL certificates
4. **Network policies**: Enable in production for pod-to-pod isolation
5. **RBAC**: Use minimal service account permissions

## Chart Structure

```
helm-chart/
├── Chart.yaml                      # Chart metadata
├── values.yaml                     # Default values
├── values-dev.yaml                 # Development overrides
├── values-staging.yaml             # Staging overrides
├── values-prod.yaml                # Production overrides
├── .helmignore                     # Files to ignore
├── README.md                       # This file
└── templates/
    ├── NOTES.txt                   # Post-install notes
    ├── _helpers.tpl                # Template helpers
    ├── namespace.yaml              # Namespace
    ├── configmap.yaml              # ConfigMap
    ├── secret.yaml                 # Secrets
    ├── serviceaccount.yaml         # Service Account
    ├── deployment-frontend.yaml    # Frontend deployment
    ├── deployment-backend.yaml     # Backend deployment
    ├── service-frontend.yaml       # Frontend service
    ├── service-backend.yaml        # Backend service
    ├── ingress.yaml                # Ingress
    ├── hpa-frontend.yaml           # Frontend HPA
    └── hpa-backend.yaml            # Backend HPA
```

## Helm Commands Reference

```bash
# Template (dry run)
helm template todo-app ./helm-chart -f secrets.yaml

# Template and debug
helm template todo-app ./helm-chart -f secrets.yaml --debug

# Install
helm install todo-app ./helm-chart -f secrets.yaml

# Upgrade
helm upgrade todo-app ./helm-chart -f secrets.yaml

# Install or upgrade (idempotent)
helm upgrade --install todo-app ./helm-chart -f secrets.yaml

# Uninstall
helm uninstall todo-app

# List releases
helm list

# Get values
helm get values todo-app

# Get manifest
helm get manifest todo-app

# History
helm history todo-app

# Rollback
helm rollback todo-app

# Package chart
helm package ./helm-chart

# Lint chart
helm lint ./helm-chart
```

## Support

For issues or questions:
- GitHub: https://github.com/yourusername/todo-app
- Docs: ../README.md
- Kubernetes manifests: ../k8s/README.md

---

**Chart Version**: 1.0.0
**App Version**: 1.0.0
**Kubernetes**: 1.25+
**Helm**: 3.0+
