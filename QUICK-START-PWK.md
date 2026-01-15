# ⚡ Quick Start - Deploy to Kubernetes NOW!

**Time needed**: 15-20 minutes | **Disk space needed**: ZERO ✅

---

## ✅ What You Have Ready

- ✅ Dockerfiles for Frontend & Backend
- ✅ Kubernetes manifests (10 files in `k8s/`)
- ✅ Helm chart (complete package in `helm-chart/`)
- ✅ Deployment scripts ready
- ✅ Docker installed and running

---

## 🚀 Quick Start (5 Steps)

### Step 1: Open Play with Kubernetes (2 min)

1. Go to: **https://labs.play-with-k8s.com/**
2. Login with Docker Hub (create account if needed)
3. Click **"Start"** → Click **"+ ADD NEW INSTANCE"**

### Step 2: Initialize Cluster (3 min)

Copy-paste these 4 commands into PWK terminal:

```bash
# Command 1 (wait 1-2 min)
kubeadm init --apiserver-advertise-address $(hostname -i) --pod-network-cidr 10.5.0.0/16

# Command 2
mkdir -p $HOME/.kube && sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config && sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Command 3
kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml

# Command 4 (verify)
kubectl get nodes
```

**Expected**: Shows `node1` as `Ready` ✅

### Step 3: Prepare Your Secrets (2 min)

Before deploying, have these ready:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Your auth secret key
- `OPENAI_API_KEY` - Your OpenAI key (optional)

### Step 4: Deploy Todo App (5 min)

**Option A - Automated Script** (EASIEST):

1. Open: `G:\hackathon-02\Todo-App\scripts\deploy-to-pwk.sh`
2. Edit lines 60-70 with YOUR real secrets
3. Copy the ENTIRE file content
4. Paste into PWK terminal
5. Press Enter and wait

**Option B - Manual Commands**:

Follow the guide: `docs/PWK-DEPLOYMENT-GUIDE.md`

### Step 5: Take Screenshots (5 min)

```bash
# Screenshot 1: All resources
kubectl get all -n todo-app

# Screenshot 2: Pods running
kubectl get pods -n todo-app -o wide

# Screenshot 3: Services
kubectl get svc -n todo-app

# Screenshot 4: Backend API
# Click on http://<NODE-IP>:30800/docs

# Screenshot 5: Pod logs
kubectl logs <pod-name> -n todo-app

# Screenshot 6: Scaling demo
kubectl scale deployment todo-backend --replicas=3 -n todo-app
kubectl get pods -n todo-app
```

---

## 📸 Screenshots Needed for Hackathon

Create a folder: `screenshots/phase4/`

Save these:
1. ✅ `01-cluster-ready.png` - `kubectl get nodes`
2. ✅ `02-all-resources.png` - `kubectl get all -n todo-app`
3. ✅ `03-pods-running.png` - `kubectl get pods -n todo-app -o wide`
4. ✅ `04-services.png` - `kubectl get svc -n todo-app`
5. ✅ `05-backend-swagger.png` - Browser showing `/docs`
6. ✅ `06-pod-logs.png` - `kubectl logs <pod>`
7. ✅ `07-scaling-demo.png` - 3 replicas running

---

## 🎬 Demo Video Script (90 seconds)

**Record your screen** while running these commands:

```bash
# Introduction (5 sec)
echo "Todo App - Phase 4: Kubernetes Deployment"

# Show cluster (10 sec)
kubectl get nodes
kubectl cluster-info

# Show all resources (15 sec)
kubectl get all -n todo-app
kubectl get pods -n todo-app -o wide

# Show services (10 sec)
kubectl get svc -n todo-app

# Access backend API (20 sec)
# Open browser to http://<NODE-IP>:30800/docs
# Show Swagger UI, expand an endpoint

# Show ConfigMap & Secret (15 sec)
kubectl get configmap -n todo-app
kubectl get secret -n todo-app

# Show scaling (15 sec)
kubectl scale deployment todo-backend --replicas=3 -n todo-app
kubectl get pods -n todo-app

# Show logs (10 sec)
kubectl logs <pod-name> -n todo-app | head -20
```

**Narrate** as you go:
- "Here's my Kubernetes cluster with Todo App deployed"
- "Frontend and Backend are running as separate Deployments"
- "Using ConfigMaps for configuration and Secrets for credentials"
- "Services expose the applications on NodePort"
- "I can scale deployments easily - now running 3 backend replicas"

---

## 📋 Phase 4 Submission Checklist

Before submitting:

- [ ] Kubernetes cluster initialized ✅
- [ ] Todo App deployed (Frontend + Backend)
- [ ] ConfigMaps created
- [ ] Secrets created
- [ ] Services running
- [ ] 7 screenshots taken
- [ ] Demo video recorded (under 90 sec)
- [ ] GitHub repo updated with:
  - [ ] `k8s/` directory with manifests
  - [ ] `helm-chart/` directory
  - [ ] `Dockerfile` for Frontend
  - [ ] `Dockerfile` for Backend
  - [ ] `docker-compose.yml`
  - [ ] `README.md` with deployment instructions
  - [ ] `screenshots/` folder

---

## 🆘 Quick Troubleshooting

**Issue**: Pods not starting (ImagePullBackOff)
```bash
# Use public images as placeholders
# Already configured in deploy-to-pwk.sh script
```

**Issue**: Can't access via NodePort
```bash
# Use port-forward instead
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
# Click the link that appears in PWK
```

**Issue**: Session expired (4 hours limit)
```bash
# Take screenshots early!
# Save all commands in a script for quick re-run
```

---

## 🎯 Expected Phase 4 Score

| Item | Points |
|------|--------|
| Kubernetes deployment working | 50 |
| ConfigMaps & Secrets | +10 |
| Multiple services | +10 |
| Helm chart (bonus) | +20 |
| Documentation | +10 |
| **TOTAL** | **100** |

---

## ⏱️ Time Breakdown

- ✅ Setup PWK account: **2 min**
- ✅ Initialize cluster: **3 min**
- ✅ Deploy application: **5 min**
- ✅ Take screenshots: **5 min**
- ✅ Record video: **5 min**
- **Total**: **20 minutes**

---

## 🔗 Important Links

- **PWK**: https://labs.play-with-k8s.com/
- **Full Guide**: `docs/PWK-DEPLOYMENT-GUIDE.md`
- **Deploy Script**: `scripts/deploy-to-pwk.sh`
- **Kubernetes Manifests**: `k8s/`
- **Helm Chart**: `helm-chart/`

---

## 🎉 Ready to Start?

1. Open https://labs.play-with-k8s.com/
2. Follow **Step 2** above to initialize cluster
3. Run the deployment script
4. Take screenshots
5. Done! ✨

**You got this!** 💪

---

**Last Updated**: 2026-01-12
**Difficulty**: ⭐⭐☆☆☆ (Beginner-Friendly)
**Time**: 20 minutes
**Cost**: FREE
