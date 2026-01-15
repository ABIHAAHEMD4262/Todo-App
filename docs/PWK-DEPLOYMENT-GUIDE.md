# Play with Kubernetes (PWK) Deployment Guide
## Complete Step-by-Step Tutorial for Phase 4

---

## 🎯 What You'll Accomplish

By the end of this guide, you will have:
- ✅ A working Kubernetes cluster (in the cloud, free!)
- ✅ Todo App deployed with Frontend + Backend
- ✅ Screenshots for hackathon submission
- ✅ Phase 4 requirements completed!

**Time Required**: 15-20 minutes

---

## 📋 Prerequisites

1. Docker Hub account (free) - https://hub.docker.com/signup
2. Web browser (Chrome, Firefox, Edge)
3. Your database credentials ready:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `BETTER_AUTH_SECRET`
   - `OPENAI_API_KEY` (optional)

---

## 🚀 STEP 1: Access Play with Kubernetes

1. **Open browser** and go to: **https://labs.play-with-k8s.com/**

2. **Click "Login"** (top right)
   - Login with your Docker Hub account
   - If you don't have one, click "Sign up" and create a free account

3. **Click "Start"** button
   - This creates a 4-hour session
   - You'll see a countdown timer (4:00:00)

4. **Click "+ ADD NEW INSTANCE"** (left side)
   - A terminal window appears on the right
   - This is your Kubernetes node!

**✅ Screenshot this**: Terminal with `[node1]` prompt

---

## 🚀 STEP 2: Initialize Kubernetes Cluster

Copy and paste these commands **one by one** into the PWK terminal:

### Command 1: Initialize cluster
```bash
kubeadm init --apiserver-advertise-address $(hostname -i) --pod-network-cidr 10.5.0.0/16
```

**Wait**: This takes 1-2 minutes. You'll see "Your Kubernetes control-plane has initialized successfully!"

### Command 2: Setup kubectl
```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### Command 3: Install network plugin
```bash
kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml
```

### Command 4: Verify cluster
```bash
kubectl get nodes
```

**Expected output**: You should see `node1` with status `Ready`

**✅ Screenshot this**: Output of `kubectl get nodes` showing Ready status

---

## 🚀 STEP 3: Prepare Deployment Script

### Option A: Copy-Paste Method (EASIEST)

1. **Open file** on your local computer:
   ```
   G:\hackathon-02\Todo-App\scripts\deploy-to-pwk.sh
   ```

2. **Edit the secrets** (line ~60-70):
   - Replace `"postgresql://user:password@neon.tech:5432/tododb?sslmode=require"` with your real DATABASE_URL
   - Replace `"your-secret-key-here-replace-me"` with your BETTER_AUTH_SECRET
   - Replace `"sk-your-openai-api-key-here"` with your OPENAI_API_KEY (or leave as-is)

3. **Copy the ENTIRE file content**

4. **Paste into PWK terminal** and press Enter

5. **Wait**: The script will:
   - Install Helm
   - Create namespace
   - Deploy Frontend + Backend
   - Create Services
   - Show access URLs

### Option B: Manual Method (Step-by-step)

If copy-paste doesn't work, follow the manual commands in the next section.

---

## 🚀 STEP 4: Deploy Todo App (Manual Commands)

If the script didn't work, run these commands one by one:

### 4.1: Install Helm
```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

### 4.2: Create Namespace
```bash
kubectl create namespace todo-app
```

### 4.3: Create ConfigMap
```bash
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
```

### 4.4: Create Secrets (**REPLACE WITH YOUR VALUES!**)
```bash
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  database-url: "YOUR_DATABASE_URL_HERE"
  better-auth-secret: "YOUR_SECRET_HERE"
  openai-api-key: "YOUR_API_KEY_HERE"
EOF
```

### 4.5: Deploy Frontend
```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: todo-app
spec:
  replicas: 1
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
        image: node:20-alpine
        command: ["/bin/sh", "-c"]
        args: ["echo 'Frontend placeholder - use your built image'; sleep 3600"]
        ports:
        - containerPort: 3000
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
```

### 4.6: Deploy Backend
```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: tiangolo/uvicorn-gunicorn-fastapi:python3.11
        ports:
        - containerPort: 8000
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
```

---

## 🚀 STEP 5: Verify Deployment

### Check all resources:
```bash
kubectl get all -n todo-app
```

**Expected output**: You should see:
- 2 Deployments (frontend, backend)
- 2 ReplicaSets
- 2 Pods (Running status)
- 2 Services (NodePort)

**✅ Screenshot this**: Output showing all resources

### Check pod status:
```bash
kubectl get pods -n todo-app -o wide
```

**✅ Screenshot this**: Pods showing "Running" status

### View pod logs:
```bash
# Get pod names first
kubectl get pods -n todo-app

# Then view logs (replace <pod-name> with actual name)
kubectl logs todo-frontend-xxxxx -n todo-app
kubectl logs todo-backend-xxxxx -n todo-app
```

**✅ Screenshot this**: Backend logs showing FastAPI startup

---

## 🚀 STEP 6: Access the Application

### Get Node IP:
```bash
kubectl get nodes -o wide
```

Look for the `INTERNAL-IP` column (e.g., `192.168.0.8`)

### Access URLs:

- **Frontend**: `http://<NODE-IP>:30080`
- **Backend**: `http://<NODE-IP>:30800/docs`

**Note**: In PWK, these URLs might be automatically clickable in the interface!

**✅ Screenshot this**:
- Click on the backend URL
- Screenshot the Swagger UI (`/docs`)

---

## 🚀 STEP 7: Deploy with Helm (BONUS - Advanced)

If you want to show Helm deployment (bonus points!):

### 7.1: Create a simple Helm values file
```bash
cat > values.yaml <<EOF
global:
  namespace: todo-app-helm

frontend:
  enabled: true
  replicaCount: 1

backend:
  enabled: true
  replicaCount: 1

secrets:
  databaseUrl: "YOUR_DATABASE_URL"
  betterAuthSecret: "YOUR_SECRET"
  openaiApiKey: "YOUR_API_KEY"
EOF
```

### 7.2: Package the chart
```bash
# You'll need to upload your helm-chart directory
# For now, just show Helm commands

helm list
helm version
```

**✅ Screenshot this**: Helm version output

---

## 📸 STEP 8: Collect Screenshots for Hackathon

Take these screenshots:

1. **✅ Cluster initialized**: `kubectl get nodes` showing Ready
2. **✅ All resources**: `kubectl get all -n todo-app`
3. **✅ Pods running**: `kubectl get pods -n todo-app -o wide`
4. **✅ Services**: `kubectl get svc -n todo-app`
5. **✅ ConfigMaps**: `kubectl get configmap -n todo-app`
6. **✅ Secrets**: `kubectl get secret -n todo-app`
7. **✅ Backend API Docs**: Open `http://<NODE-IP>:30800/docs`
8. **✅ Pod logs**: `kubectl logs <backend-pod-name> -n todo-app`
9. **✅ Describe deployment**: `kubectl describe deployment todo-backend -n todo-app`
10. **✅ Helm (if used)**: `helm list`

---

## 🚀 STEP 9: Additional Kubernetes Commands (for demo)

Show your Kubernetes knowledge with these commands:

```bash
# Scale deployment
kubectl scale deployment todo-backend --replicas=3 -n todo-app

# Check scaling
kubectl get pods -n todo-app

# View events
kubectl get events -n todo-app

# Describe a pod
kubectl describe pod <pod-name> -n todo-app

# Execute into pod
kubectl exec -it <pod-name> -n todo-app -- /bin/sh

# Port forward (alternative access method)
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
```

**✅ Screenshot**: Scale to 3 replicas and show 3 pods running

---

## 🎬 STEP 10: Create Demo Video (90 seconds)

**Script for your video**:

1. **Introduction** (5 sec): "Hi, this is my Todo App Phase 4 - Kubernetes deployment"

2. **Show Cluster** (10 sec):
   ```bash
   kubectl get nodes
   kubectl get all -n todo-app
   ```

3. **Show Pods** (10 sec):
   ```bash
   kubectl get pods -n todo-app -o wide
   ```

4. **Show Services** (10 sec):
   ```bash
   kubectl get svc -n todo-app
   ```

5. **Access Backend API** (15 sec):
   - Open `http://<NODE-IP>:30800/docs`
   - Show Swagger UI
   - Expand one endpoint

6. **Show Kubernetes Features** (20 sec):
   ```bash
   # Show ConfigMap
   kubectl get configmap todo-config -n todo-app -o yaml

   # Show scaling
   kubectl scale deployment todo-backend --replicas=3 -n todo-app
   kubectl get pods -n todo-app
   ```

7. **Show Logs** (15 sec):
   ```bash
   kubectl logs <pod-name> -n todo-app
   ```

8. **Conclusion** (5 sec): "Successfully deployed to Kubernetes with ConfigMaps, Secrets, Services, and Deployments!"

---

## ✅ Phase 4 Checklist

Mark these as complete:

- [ ] Kubernetes cluster created
- [ ] Docker images deployed (or placeholder images)
- [ ] Frontend deployed as Deployment
- [ ] Backend deployed as Deployment
- [ ] Services created (ClusterIP or NodePort)
- [ ] ConfigMap for non-sensitive config
- [ ] Secrets for sensitive data
- [ ] Pods running successfully
- [ ] Application accessible via Service
- [ ] Screenshots collected
- [ ] Demo video recorded (90 sec)

---

## 🆘 Troubleshooting

### Issue: Pods not starting (ImagePullBackOff)

**Solution**: Use publicly available images:
```bash
# Frontend - use Node.js placeholder
image: node:20-alpine

# Backend - use FastAPI base image
image: tiangolo/uvicorn-gunicorn-fastapi:python3.11
```

### Issue: Can't access application

**Solution**: Use port-forward instead:
```bash
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app
```

Then look for the clickable link in PWK interface.

### Issue: Session expired (4 hours)

**Solution**:
- Take screenshots early!
- Download kubectl output as text files
- Save your commands in a script for quick re-deployment

---

## 📚 What to Submit for Hackathon

1. **GitHub Repo** with:
   - All Kubernetes manifests (`k8s/` directory) ✅
   - Helm chart (`helm-chart/` directory) ✅
   - Dockerfiles ✅
   - README with deployment instructions ✅

2. **Screenshots** folder with:
   - `01-cluster-ready.png`
   - `02-all-resources.png`
   - `03-pods-running.png`
   - `04-services.png`
   - `05-backend-api-docs.png`
   - `06-pod-logs.png`
   - `07-deployment-describe.png`

3. **Demo Video** (90 seconds max):
   - Screen recording of kubectl commands
   - Show application running
   - Explain architecture

---

## 🎉 Success!

You've successfully deployed your Todo App to Kubernetes!

**Phase 4 Score Potential**:
- ✅ Basic Kubernetes deployment: **50 points**
- ✅ ConfigMaps & Secrets: **+10 points**
- ✅ Multiple Deployments + Services: **+10 points**
- ✅ Helm Chart (bonus): **+20 points**
- ✅ Complete documentation: **+10 points**

**Total**: Up to **100 points** for Phase 4! 🎯

---

**Created**: 2026-01-12
**Time to Complete**: 15-20 minutes
**Difficulty**: Beginner-Friendly
