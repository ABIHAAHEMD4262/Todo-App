# Kubernetes Playground - Zero Installation Guide

Since Minikube requires disk space, you can use FREE online Kubernetes clusters for Phase 4.

## Option 1: Play with Kubernetes (PWK) - BEST FOR PHASE 4

**URL**: https://labs.play-with-k8s.com/

**Features:**
- ✅ FREE Kubernetes cluster for 4 hours
- ✅ Full kubectl access
- ✅ Can deploy our Helm chart
- ✅ Web-based terminal (no installation!)
- ✅ Supports Ingress, Services, etc.

**How to Use:**

1. **Go to**: https://labs.play-with-k8s.com/
2. **Login** with Docker Hub account (create if needed)
3. **Click "Start"** - creates a 4-hour session
4. **Click "+ ADD NEW INSTANCE"** - creates a cluster node
5. **Initialize cluster:**
   ```bash
   # Run in PWK terminal
   kubeadm init --apiserver-advertise-address $(hostname -i) --pod-network-cidr 10.5.0.0/16

   # Setup kubectl
   mkdir -p $HOME/.kube
   sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
   sudo chown $(id -u):$(id -g) $HOME/.kube/config

   # Install network plugin
   kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml
   ```

6. **Upload your files:**
   - Copy/paste k8s manifests or Helm chart
   - Or use `kubectl apply -f <url>` if files are on GitHub

---

## Option 2: Killercoda Kubernetes Playground

**URL**: https://killercoda.com/playgrounds/scenario/kubernetes

**Features:**
- ✅ FREE Kubernetes cluster (1 hour)
- ✅ Pre-configured kubectl
- ✅ Web-based VS Code editor
- ✅ Faster setup than PWK

**How to Use:**

1. Go to: https://killercoda.com/playgrounds/scenario/kubernetes
2. Click "Start Scenario"
3. Cluster is ready immediately!
4. Use the built-in editor to create files
5. Run kubectl commands in terminal

---

## Option 3: Google Cloud Shell (GKE Autopilot)

**URL**: https://shell.cloud.google.com/

**Features:**
- ✅ FREE $300 credit for 90 days (new users)
- ✅ Real production Kubernetes (GKE)
- ✅ Web-based terminal + editor
- ✅ Can keep running longer

**How to Use:**

1. Go to: https://console.cloud.google.com/
2. Sign up for free trial ($300 credit)
3. Open Cloud Shell (icon at top right)
4. Create GKE Autopilot cluster:
   ```bash
   gcloud container clusters create-auto todo-app \
     --region=us-central1
   ```
5. Connect to cluster:
   ```bash
   gcloud container clusters get-credentials todo-app --region=us-central1
   ```

---

## Deploying Todo App on Any Playground

### Quick Deploy (Kubernetes Manifests)

```bash
# Clone or copy your files
git clone https://github.com/yourusername/todo-app.git
cd todo-app

# Create secrets (replace with real values)
cat > k8s/secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  database-url: "postgresql://user:pass@host:5432/db?sslmode=require"
  better-auth-secret: "your-secret-here"
  openai-api-key: "sk-your-key"
EOF

# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment-frontend.yaml
kubectl apply -f k8s/deployment-backend.yaml
kubectl apply -f k8s/service-frontend.yaml
kubectl apply -f k8s/service-backend.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa-frontend.yaml
kubectl apply -f k8s/hpa-backend.yaml

# Check deployment
kubectl get all -n todo-app
```

### Deploy with Helm (Better!)

```bash
# Install Helm (if not available)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Deploy with Helm
helm install todo-app ./helm-chart \
  --set secrets.databaseUrl="postgresql://..." \
  --set secrets.betterAuthSecret="..." \
  --set secrets.openaiApiKey="..." \
  --create-namespace

# Check status
kubectl get all -n todo-app
helm status todo-app
```

---

## Accessing Your App

### Port Forward (Works on all playgrounds)

```bash
# Frontend
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:3000

# Backend
kubectl port-forward -n todo-app svc/todo-app-backend 8000:8000

# Then open in browser (PWK shows clickable links)
```

### Using Ingress (Play with K8s)

```bash
# Get node IP
kubectl get nodes -o wide

# Add to /etc/hosts on your local machine
<node-ip> todo.local

# Access: http://todo.local
```

---

## Taking Screenshots for Hackathon

1. **Deployment Status:**
   ```bash
   kubectl get all -n todo-app
   kubectl get pods -n todo-app -o wide
   ```

2. **Helm Release:**
   ```bash
   helm list
   helm status todo-app
   ```

3. **Pod Logs:**
   ```bash
   kubectl logs -n todo-app <pod-name>
   ```

4. **Application Running:**
   - Use port-forward
   - Take screenshot of frontend in browser
   - Take screenshot of backend /docs

---

## Recommendation

For **Phase 4 Hackathon**, I recommend:

1. **Play with Kubernetes** - Easiest, free, no installation
2. **Document with screenshots** - Shows Kubernetes deployment
3. **Use our Helm chart** - Demonstrates advanced Kubernetes knowledge

This satisfies Phase 4 requirements without needing Minikube locally!

---

**Created**: 2026-01-12
**Phase**: 4 - Kubernetes Deployment
