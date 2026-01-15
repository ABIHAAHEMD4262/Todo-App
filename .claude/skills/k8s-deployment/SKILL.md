# Kubernetes Deployment Skill

## Description
Expert knowledge for deploying containerized applications to Kubernetes clusters with production-ready configurations. Covers Deployments, Services, Ingress, ConfigMaps, Secrets, horizontal pod autoscaling, resource management, and health probes based on latest Kubernetes documentation (2025).

## Capabilities
- Generate Kubernetes Deployment manifests with best practices
- Create Service resources (ClusterIP, LoadBalancer, NodePort)
- Configure Ingress for external access with path-based routing
- Manage ConfigMaps for non-sensitive configuration
- Manage Secrets for sensitive data
- Implement Horizontal Pod Autoscaling (HPA) based on CPU/memory
- Configure resource requests and limits
- Implement liveness and readiness probes
- Set up pod anti-affinity for high availability

## Usage

This skill is invoked when:
- User asks to "deploy to Kubernetes"
- User requests "create Kubernetes manifests"
- User wants to "configure K8s resources"
- Implementation requires Kubernetes deployment for Phase 4

## Knowledge Base

### Deployment Manifest (Frontend - Next.js)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: todo-app
  labels:
    app: todo-frontend
    tier: frontend
    version: v1.0.0
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
        tier: frontend
        version: v1.0.0
    spec:
      # Security context for pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

      containers:
      - name: frontend
        image: yourusername/todo-frontend:v1.0.0
        imagePullPolicy: IfNotPresent

        ports:
        - name: http
          containerPort: 3000
          protocol: TCP

        # Environment variables from ConfigMap and Secret
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: todo-config
              key: api-url
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: better-auth-secret

        # Resource requests and limits
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

        # Liveness probe - checks if container is alive
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1

        # Readiness probe - checks if container is ready to serve traffic
        readinessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1

        # Startup probe - for slow-starting containers
        startupProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
          successThreshold: 1

        # Security context for container
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          capabilities:
            drop:
              - ALL

      # Pod anti-affinity for high availability
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - todo-frontend
              topologyKey: kubernetes.io/hostname
```

### Deployment Manifest (Backend - FastAPI)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo-app
  labels:
    app: todo-backend
    tier: backend
    version: v1.0.0
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
        tier: backend
        version: v1.0.0
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000

      containers:
      - name: backend
        image: yourusername/todo-backend:v1.0.0
        imagePullPolicy: IfNotPresent

        ports:
        - name: http
          containerPort: 8000
          protocol: TCP

        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: better-auth-secret
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: openai-api-key
        - name: FRONTEND_URL
          valueFrom:
            configMapKeyRef:
              name: todo-config
              key: frontend-url

        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"

        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3

        startupProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30

        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          capabilities:
            drop:
              - ALL

      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - todo-backend
              topologyKey: kubernetes.io/hostname
```

### Service Manifests

**Frontend Service (ClusterIP):**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend
  namespace: todo-app
  labels:
    app: todo-frontend
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: todo-frontend
```

**Backend Service (ClusterIP):**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
  namespace: todo-app
  labels:
    app: todo-backend
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app: todo-backend
```

### Ingress Manifest (Path-based Routing)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  namespace: todo-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - todo.example.com
    secretName: todo-tls-cert
  rules:
  - host: todo.example.com
    http:
      paths:
      # Backend API routes
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: todo-backend
            port:
              number: 8000
      # Frontend routes (catch-all)
      - path: /
        pathType: Prefix
        backend:
          service:
            name: todo-frontend
            port:
              number: 3000
```

### ConfigMap (Non-sensitive Configuration)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  namespace: todo-app
data:
  api-url: "http://todo-backend:8000"
  frontend-url: "http://todo-frontend:3000"
  log-level: "info"
  environment: "production"
```

### Secret (Sensitive Data)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  database-url: "postgresql://user:password@neon.tech:5432/tododb?sslmode=require"
  better-auth-secret: "your-secret-key-here"
  openai-api-key: "sk-your-openai-api-key"
```

**Important**: Never commit secrets to Git. Use sealed-secrets, external-secrets, or Kubernetes secret management.

### Horizontal Pod Autoscaler (HPA)

**Frontend HPA:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-frontend-hpa
  namespace: todo-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
```

**Backend HPA:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: todo-backend-hpa
  namespace: todo-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: todo-backend
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-app
  labels:
    name: todo-app
    environment: production
```

## Kubernetes Commands for Phase 4

```bash
# Create namespace
kubectl create namespace todo-app

# Apply manifests
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f deployment-frontend.yaml
kubectl apply -f deployment-backend.yaml
kubectl apply -f service-frontend.yaml
kubectl apply -f service-backend.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa-frontend.yaml
kubectl apply -f hpa-backend.yaml

# Or apply all at once
kubectl apply -f k8s/ -n todo-app

# Check deployments
kubectl get deployments -n todo-app
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get ingress -n todo-app
kubectl get hpa -n todo-app

# View pod logs
kubectl logs -f deployment/todo-frontend -n todo-app
kubectl logs -f deployment/todo-backend -n todo-app

# Describe resources (for debugging)
kubectl describe deployment todo-frontend -n todo-app
kubectl describe pod <pod-name> -n todo-app

# Execute command in pod
kubectl exec -it <pod-name> -n todo-app -- sh

# Port forward for local testing
kubectl port-forward service/todo-frontend 3000:3000 -n todo-app
kubectl port-forward service/todo-backend 8000:8000 -n todo-app

# Scale manually (if HPA not enabled)
kubectl scale deployment todo-frontend --replicas=5 -n todo-app

# Rollout commands
kubectl rollout status deployment/todo-frontend -n todo-app
kubectl rollout history deployment/todo-frontend -n todo-app
kubectl rollout undo deployment/todo-frontend -n todo-app

# Delete resources
kubectl delete -f k8s/ -n todo-app
kubectl delete namespace todo-app
```

## Best Practices from Latest K8s Documentation (2025)

### Resource Management
- ✅ Always set resource requests (guaranteed minimum)
- ✅ Always set resource limits (maximum allowed)
- ✅ Requests should be realistic based on actual usage
- ✅ Limits prevent resource starvation of other pods
- ✅ Use HPA for automatic scaling based on metrics

### Health Checks
- ✅ Implement liveness probes (restart unhealthy containers)
- ✅ Implement readiness probes (remove from service if not ready)
- ✅ Implement startup probes (for slow-starting apps)
- ✅ Use appropriate initialDelaySeconds and timeouts
- ✅ Fail fast but not too aggressively

### Security
- ✅ Run containers as non-root users
- ✅ Use SecurityContext to drop capabilities
- ✅ Use Secrets for sensitive data (not ConfigMaps)
- ✅ Enable RBAC for service accounts
- ✅ Use NetworkPolicies to restrict traffic
- ✅ Scan images for vulnerabilities

### High Availability
- ✅ Use pod anti-affinity to spread pods across nodes
- ✅ Set multiple replicas (minimum 2-3 for production)
- ✅ Use PodDisruptionBudgets for critical services
- ✅ Implement proper health checks
- ✅ Use RollingUpdate strategy for zero-downtime deployments

### Configuration Management
- ✅ Use ConfigMaps for non-sensitive configuration
- ✅ Use Secrets for sensitive data
- ✅ Never hardcode configuration in images
- ✅ Use environment variables for configuration
- ✅ Version your ConfigMaps and Secrets

## Validation Checklist

- [ ] Namespace created
- [ ] Deployments have resource requests and limits
- [ ] Health probes configured (liveness, readiness, startup)
- [ ] Services created with correct selectors
- [ ] Ingress configured for external access
- [ ] ConfigMaps created for non-sensitive config
- [ ] Secrets created for sensitive data (not committed to Git)
- [ ] HPA configured for automatic scaling
- [ ] Security context set (non-root user)
- [ ] Pod anti-affinity configured for HA
- [ ] Labels and selectors match
- [ ] Rolling update strategy configured

## Examples

### Example 1: Deploy Frontend
**Input**: "Deploy the Next.js frontend to Kubernetes"
**Output**: Deployment with 2 replicas, health checks, HPA, Service, Ingress

### Example 2: Configure HPA
**Input**: "Set up autoscaling for the backend based on CPU"
**Output**: HPA with minReplicas=2, maxReplicas=20, target CPU 70%

### Example 3: Create Ingress
**Input**: "Configure Ingress with path-based routing: /api → backend, / → frontend"
**Output**: Ingress manifest with path rules and TLS configuration

## Related Skills
- `docker-containerization` - For container images
- `helm-charts` - For templated deployments
- `minikube-local-k8s` - For local testing
- `cloud-native-patterns` - For best practices

## References
- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
