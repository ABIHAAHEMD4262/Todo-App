#!/bin/bash
# Deploy Todo App to Play with Kubernetes (PWK)
# Copy and paste this entire script into PWK terminal

set -e

echo "🚀 Deploying Todo App to Kubernetes..."
echo "========================================"
echo ""

# Step 1: Initialize Kubernetes cluster (if not already done)
echo "📦 Step 1: Checking cluster status..."
if ! kubectl get nodes &>/dev/null; then
    echo "⚠️  Cluster not initialized. Please run these commands first:"
    echo ""
    echo "kubeadm init --apiserver-advertise-address \$(hostname -i) --pod-network-cidr 10.5.0.0/16"
    echo "mkdir -p \$HOME/.kube"
    echo "sudo cp -i /etc/kubernetes/admin.conf \$HOME/.kube/config"
    echo "sudo chown \$(id -u):\$(id -g) \$HOME/.kube/config"
    echo "kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml"
    echo ""
    exit 1
fi

echo "✅ Cluster is ready!"
kubectl get nodes
echo ""

# Step 2: Install Helm
echo "📦 Step 2: Installing Helm..."
if ! command -v helm &>/dev/null; then
    curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    echo "✅ Helm installed!"
else
    echo "✅ Helm already installed!"
fi
helm version
echo ""

# Step 3: Create namespace
echo "📦 Step 3: Creating namespace..."
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace created!"
echo ""

# Step 4: Create ConfigMap
echo "📦 Step 4: Creating ConfigMap..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  namespace: todo-app
data:
  api-url: "http://todo-backend:8000"
  frontend-url: "http://todo-frontend:3000"
  log-level: "info"
  environment: "playground"
EOF
echo "✅ ConfigMap created!"
echo ""

# Step 5: Create Secrets (REPLACE WITH YOUR REAL VALUES!)
echo "📦 Step 5: Creating Secrets..."
echo "⚠️  WARNING: Using placeholder secrets. Replace with real values for production!"
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  database-url: "postgresql://user:password@neon.tech:5432/tododb?sslmode=require"
  better-auth-secret: "your-secret-key-here-replace-me"
  openai-api-key: "sk-your-openai-api-key-here"
EOF
echo "✅ Secrets created!"
echo ""

# Step 6: Deploy Frontend
echo "📦 Step 6: Deploying Frontend..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: todo-app
  labels:
    app: todo-frontend
    tier: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
        tier: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/vercel/next.js:latest
        ports:
        - name: http
          containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: todo-config
              key: api-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend
  namespace: todo-app
spec:
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30080
  selector:
    app: todo-frontend
EOF
echo "✅ Frontend deployed!"
echo ""

# Step 7: Deploy Backend
echo "📦 Step 7: Deploying Backend..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo-app
  labels:
    app: todo-backend
    tier: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
        tier: backend
    spec:
      containers:
      - name: backend
        image: tiangolo/uvicorn-gunicorn-fastapi:python3.11
        ports:
        - name: http
          containerPort: 8000
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
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
  namespace: todo-app
spec:
  type: NodePort
  ports:
  - port: 8000
    targetPort: 8000
    nodePort: 30800
  selector:
    app: todo-backend
EOF
echo "✅ Backend deployed!"
echo ""

# Step 8: Check deployment status
echo "📊 Step 8: Checking deployment status..."
echo ""
echo "=== Namespace ==="
kubectl get namespace todo-app
echo ""

echo "=== Pods ==="
kubectl get pods -n todo-app -o wide
echo ""

echo "=== Services ==="
kubectl get svc -n todo-app
echo ""

echo "=== ConfigMaps ==="
kubectl get configmap -n todo-app
echo ""

echo "=== Secrets ==="
kubectl get secret -n todo-app
echo ""

# Step 9: Wait for pods to be ready
echo "⏳ Step 9: Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=todo-frontend -n todo-app --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=todo-backend -n todo-app --timeout=120s || true
echo ""

# Step 10: Display access information
echo "🎉 Deployment Complete!"
echo "========================================"
echo ""
echo "📊 Deployment Summary:"
kubectl get all -n todo-app
echo ""

echo "🌐 Access URLs:"
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
echo "Frontend: http://${NODE_IP}:30080"
echo "Backend:  http://${NODE_IP}:30800"
echo ""

echo "📝 Useful Commands:"
echo "# View all resources"
echo "kubectl get all -n todo-app"
echo ""
echo "# View pod logs"
echo "kubectl logs -f <pod-name> -n todo-app"
echo ""
echo "# Describe pod"
echo "kubectl describe pod <pod-name> -n todo-app"
echo ""
echo "# Port forward (if NodePort doesn't work)"
echo "kubectl port-forward -n todo-app svc/todo-frontend 3000:3000"
echo "kubectl port-forward -n todo-app svc/todo-backend 8000:8000"
echo ""

echo "✨ Todo App is now running on Kubernetes! ✨"
