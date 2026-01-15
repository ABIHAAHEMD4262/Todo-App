# Minikube Local Kubernetes Skill

## Description
Expert knowledge for setting up and managing local Kubernetes clusters with Minikube for Phase 4 development and testing. Covers installation, configuration, addons, deployment testing, and troubleshooting.

## Capabilities
- Install and configure Minikube
- Start/stop/delete Minikube clusters
- Enable necessary addons (ingress, metrics-server, dashboard)
- Configure resource limits for local development
- Test deployments locally before cloud deployment
- Access services via NodePort, LoadBalancer, or Ingress
- Debug pods and services in local cluster
- Use kubectl with Minikube

## Usage

This skill is invoked when:
- User asks to "set up Minikube"
- User requests "deploy locally to Kubernetes"
- User wants to "test Kubernetes deployment"
- Implementation requires local K8s cluster for Phase 4

## Knowledge Base

### Minikube Installation

**Windows (with WSL 2):**
```bash
# Download and install
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

**macOS:**
```bash
# Using Homebrew
brew install minikube

# Or direct download
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

**Linux:**
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Starting Minikube

```bash
# Start with default resources (2 CPUs, 2GB memory)
minikube start

# Start with custom resources (recommended for Phase 4)
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Start with specific Kubernetes version
minikube start --kubernetes-version=v1.28.0

# Start with Docker driver
minikube start --driver=docker

# Start with specific profile (multiple clusters)
minikube start -p todo-app-dev
```

### Essential Minikube Commands

```bash
# Cluster management
minikube status                    # Check cluster status
minikube stop                      # Stop cluster
minikube delete                    # Delete cluster
minikube pause                     # Pause cluster
minikube unpause                   # Unpause cluster

# Profile management
minikube profile list              # List all profiles
minikube profile todo-app-dev      # Switch profile

# Access cluster
minikube kubectl -- get pods       # Use built-in kubectl
minikube ssh                       # SSH into cluster node
minikube ip                        # Get cluster IP

# Service access
minikube service list              # List all services
minikube service <service-name>    # Open service in browser
minikube service <service-name> --url  # Get service URL
minikube tunnel                    # Create route to LoadBalancer services

# Dashboard
minikube dashboard                 # Open K8s dashboard
minikube dashboard --url           # Get dashboard URL

# Logs and debugging
minikube logs                      # View cluster logs
minikube logs -f                   # Follow cluster logs

# Resource management
minikube addons list               # List available addons
minikube addons enable <addon>     # Enable addon
minikube addons disable <addon>    # Disable addon
```

### Phase 4: Required Addons

```bash
# Enable ingress controller (NGINX)
minikube addons enable ingress

# Enable metrics server (for HPA)
minikube addons enable metrics-server

# Enable dashboard (optional, for visualization)
minikube addons enable dashboard

# Enable storage provisioner (for PVCs)
minikube addons enable storage-provisioner
minikube addons enable default-storageclass

# Verify addons
minikube addons list
```

### Deploy Todo App to Minikube

**Step 1: Start Minikube**
```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable metrics-server
```

**Step 2: Build and Load Images**
```bash
# Option 1: Build inside Minikube (recommended)
eval $(minikube docker-env)
docker build -t todo-frontend:v1.0.0 ./frontend
docker build -t todo-backend:v1.0.0 ./backend

# Option 2: Load from local Docker
docker build -t todo-frontend:v1.0.0 ./frontend
docker build -t todo-backend:v1.0.0 ./backend
minikube image load todo-frontend:v1.0.0
minikube image load todo-backend:v1.0.0

# Verify images
minikube image ls
```

**Step 3: Deploy with Helm**
```bash
# Create namespace
kubectl create namespace todo-app

# Install Helm chart
helm install todo-app ./helm-chart \
  -f values-dev.yaml \
  --set secrets.databaseUrl="postgresql://..." \
  --set secrets.betterAuthSecret="..." \
  --set secrets.openaiApiKey="sk-..." \
  -n todo-app

# Or deploy with kubectl
kubectl apply -f k8s/ -n todo-app
```

**Step 4: Access Application**
```bash
# Get Ingress IP
kubectl get ingress -n todo-app

# Add to /etc/hosts (Linux/macOS) or C:\Windows\System32\drivers\etc\hosts (Windows)
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Access application
# http://todo.local

# Alternative: Use minikube tunnel (for LoadBalancer)
minikube tunnel
# Then access via localhost

# Alternative: Use port-forward
kubectl port-forward service/todo-frontend 3000:3000 -n todo-app
kubectl port-forward service/todo-backend 8000:8000 -n todo-app
```

### Minikube Configuration for Phase 4

**Recommended Minikube Config:**
```bash
# Set default resources
minikube config set cpus 4
minikube config set memory 8192
minikube config set disk-size 20g

# Set default driver
minikube config set driver docker

# View configuration
minikube config view
```

### Troubleshooting

**Issue: Pods stuck in ImagePullBackOff**
```bash
# Check if image exists in Minikube
minikube image ls | grep todo

# Solution: Build or load image
eval $(minikube docker-env)
docker build -t todo-frontend:v1.0.0 ./frontend
```

**Issue: Ingress not working**
```bash
# Check if ingress addon is enabled
minikube addons list | grep ingress

# Enable if needed
minikube addons enable ingress

# Check ingress controller
kubectl get pods -n ingress-nginx

# Add host to /etc/hosts
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts
```

**Issue: HPA not scaling**
```bash
# Check if metrics-server is running
kubectl get pods -n kube-system | grep metrics-server

# Enable if needed
minikube addons enable metrics-server

# Check metrics availability
kubectl top pods -n todo-app
kubectl top nodes
```

**Issue: Insufficient resources**
```bash
# Check current resources
minikube config view

# Increase resources (requires restart)
minikube delete
minikube start --cpus=6 --memory=12288
```

**Issue: Service not accessible**
```bash
# Check service type
kubectl get svc -n todo-app

# For LoadBalancer, use minikube tunnel
minikube tunnel

# For NodePort, get URL
minikube service todo-frontend -n todo-app --url

# For ClusterIP, use port-forward
kubectl port-forward service/todo-frontend 3000:3000 -n todo-app
```

## Complete Minikube Workflow for Phase 4

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --disk-size=20g

# 2. Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Build images in Minikube
eval $(minikube docker-env)
docker-compose build

# 4. Create namespace
kubectl create namespace todo-app

# 5. Deploy with Helm
helm install todo-app ./helm-chart \
  -f values-dev.yaml \
  --set frontend.image.repository=todo-frontend \
  --set backend.image.repository=todo-backend \
  --set frontend.image.tag=v1.0.0 \
  --set backend.image.tag=v1.0.0 \
  --set secrets.databaseUrl="$DATABASE_URL" \
  --set secrets.betterAuthSecret="$BETTER_AUTH_SECRET" \
  --set secrets.openaiApiKey="$OPENAI_API_KEY" \
  -n todo-app

# 6. Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=todo-frontend -n todo-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=todo-backend -n todo-app --timeout=300s

# 7. Add Ingress host to /etc/hosts
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# 8. Access application
echo "Application available at: http://todo.local"

# 9. Monitor
kubectl get all -n todo-app
kubectl logs -f deployment/todo-frontend -n todo-app
```

## Minikube vs Cloud Kubernetes

| Feature | Minikube | Cloud K8s (GKE/EKS/AKS) |
|---------|----------|-------------------------|
| **Setup** | Minutes | Minutes to hours |
| **Cost** | Free | Pay per use |
| **Resources** | Limited by laptop | Virtually unlimited |
| **Networking** | Requires tunnel/port-forward | Native LoadBalancer |
| **Storage** | Local disk | Cloud persistent storage |
| **Addons** | Built-in | Separate installation |
| **Use Case** | Development, testing | Production |

## Best Practices

### Development Workflow
- ✅ Use Minikube for local development and testing
- ✅ Build images inside Minikube with `eval $(minikube docker-env)`
- ✅ Use resource limits to simulate production constraints
- ✅ Test with Helm charts before deploying to cloud
- ✅ Use ingress addon instead of port-forwarding for realistic testing

### Resource Management
- ✅ Allocate sufficient resources (4 CPUs, 8GB RAM minimum)
- ✅ Monitor resource usage with `minikube addons enable metrics-server`
- ✅ Clean up unused images and resources regularly
- ✅ Use `minikube pause` when not actively developing

### Image Management
- ✅ Build images inside Minikube to avoid registry push/pull
- ✅ Use `imagePullPolicy: IfNotPresent` in dev
- ✅ Tag images with version numbers
- ✅ Clean up old images with `minikube image rm`

## Validation Checklist

- [ ] Minikube installed and version verified
- [ ] Cluster started with sufficient resources (4 CPUs, 8GB RAM)
- [ ] Ingress addon enabled
- [ ] Metrics-server addon enabled
- [ ] Images built/loaded into Minikube
- [ ] Application deployed successfully
- [ ] Pods running and ready
- [ ] Services accessible (via Ingress, tunnel, or port-forward)
- [ ] HPA working (if enabled)
- [ ] Logs accessible and no errors

## Related Skills
- `docker-containerization` - For building images
- `k8s-deployment` - For Kubernetes manifests
- `helm-charts` - For Helm deployments
- `cloud-native-patterns` - For best practices

## References
- [Minikube Official Documentation](https://minikube.sigs.k8s.io/docs/)
- [Minikube Start Guide](https://minikube.sigs.k8s.io/docs/start/)
- [Minikube Handbook](https://minikube.sigs.k8s.io/docs/handbook/)
- [Minikube Addons](https://minikube.sigs.k8s.io/docs/handbook/addons/)
