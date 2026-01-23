# Deploy Todo App to Docker Desktop Kubernetes

## Prerequisites
✅ Docker Desktop installed on Windows
✅ At least 8GB RAM (allocate 4GB to Docker Desktop)
✅ 20GB free disk space

---

## Step 1: Enable Kubernetes in Docker Desktop (5 minutes)

### 1.1 Open Docker Desktop
- Click on the Docker Desktop icon in your taskbar
- Wait for Docker to fully start (whale icon should be steady)

### 1.2 Enable Kubernetes
1. Click on the **Settings** icon (gear icon) in Docker Desktop
2. Navigate to **Kubernetes** in the left sidebar
3. Check the box: ☑️ **Enable Kubernetes**
4. Click **Apply & Restart**
5. Wait 2-3 minutes for Kubernetes to start
   - You'll see a green indicator when ready
   - Bottom left should show: 🟢 "Kubernetes is running"

### 1.3 Verify Kubernetes is Running
Open PowerShell or Command Prompt and run:
```powershell
kubectl version --short
kubectl cluster-info
kubectl get nodes
```

Expected output:
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   1d    v1.28.2
```

---

## Step 2: Build Docker Images (5 minutes)

### 2.1 Navigate to Project Directory
```powershell
cd G:\hackathon-02\Todo-App
```

### 2.2 Build Frontend Image
```powershell
docker build -t todo-frontend:v1.0.0 ./frontend
```

This will take 3-5 minutes. Wait for "Successfully tagged todo-frontend:v1.0.0"

### 2.3 Build Backend Image
```powershell
docker build -t todo-backend:v1.0.0 ./backend
```

This will take 2-3 minutes. Wait for "Successfully tagged todo-backend:v1.0.0"

### 2.4 Verify Images
```powershell
docker images | findstr todo
```

Expected output:
```
todo-frontend    v1.0.0    abc123...   2 minutes ago   150MB
todo-backend     v1.0.0    def456...   1 minute ago    120MB
```

---

## Step 3: Prepare Kubernetes Secrets (2 minutes)

### 3.1 Create Secrets File
Copy the template:
```powershell
copy k8s\secret.yaml.template k8s\secret.yaml
```

### 3.2 Edit Secrets File
Open `k8s\secret.yaml` in your editor and replace the placeholders:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
stringData:
  # Replace with your actual Neon PostgreSQL connection string
  DATABASE_URL: "postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

  # Replace with your Better Auth secret (generate with: openssl rand -base64 32)
  BETTER_AUTH_SECRET: "your-secret-key-here-at-least-32-characters-long"

  # Replace with your OpenAI API key (optional, for chatbot)
  OPENAI_API_KEY: "sk-your-openai-api-key-here"
```

**IMPORTANT:** Never commit `k8s\secret.yaml` to Git!

---

## Step 4: Deploy to Kubernetes (3 minutes)

### 4.1 Create Namespace
```powershell
kubectl apply -f k8s\namespace.yaml
```

### 4.2 Create ConfigMap
```powershell
kubectl apply -f k8s\configmap.yaml
```

### 4.3 Create Secrets
```powershell
kubectl apply -f k8s\secret.yaml
```

### 4.4 Deploy Frontend
```powershell
kubectl apply -f k8s\deployment-frontend.yaml
kubectl apply -f k8s\service-frontend.yaml
```

### 4.5 Deploy Backend
```powershell
kubectl apply -f k8s\deployment-backend.yaml
kubectl apply -f k8s\service-backend.yaml
```

### 4.6 Deploy Autoscalers (Optional)
```powershell
kubectl apply -f k8s\hpa-frontend.yaml
kubectl apply -f k8s\hpa-backend.yaml
```

---

## Step 5: Verify Deployment (2 minutes)

### 5.1 Check All Resources
```powershell
kubectl get all -n todo-app
```

Expected output:
```
NAME                                  READY   STATUS    RESTARTS   AGE
pod/todo-backend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
pod/todo-backend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
pod/todo-frontend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
pod/todo-frontend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m

NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/todo-backend       NodePort    10.96.xxx.xxx   <none>        8000:30800/TCP   2m
service/todo-frontend      NodePort    10.96.xxx.xxx   <none>        3000:30300/TCP   2m

NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/todo-backend    2/2     2            2           2m
deployment.apps/todo-frontend   2/2     2            2           2m
```

### 5.2 Check Pods Status
```powershell
kubectl get pods -n todo-app -o wide
```

All pods should show `STATUS: Running` and `READY: 1/1`

### 5.3 Check Pod Logs
```powershell
# Get pod name
kubectl get pods -n todo-app

# View backend logs
kubectl logs <todo-backend-pod-name> -n todo-app

# View frontend logs
kubectl logs <todo-frontend-pod-name> -n todo-app
```

---

## Step 6: Access the Application (1 minute)

### 6.1 Access Backend API
Open browser to:
```
http://localhost:30800/docs
```

You should see the **Swagger UI** with all API endpoints.

### 6.2 Access Frontend
Open browser to:
```
http://localhost:30300
```

You should see the **Todo App** landing page.

---

## Step 7: Test the Application

### 7.1 Test Backend API
In Swagger UI (http://localhost:30800/docs):
1. Expand **GET /health** endpoint
2. Click **Try it out**
3. Click **Execute**
4. Should return: `{"status": "healthy"}`

### 7.2 Test Frontend
1. Go to http://localhost:30300
2. Click **Sign Up** (if not logged in)
3. Create an account
4. Add a task
5. Mark task as complete
6. View Dashboard

---

## Step 8: Scale the Application (Demo)

### 8.1 Scale Backend
```powershell
# Scale to 5 replicas
kubectl scale deployment todo-backend --replicas=5 -n todo-app

# Watch scaling in action
kubectl get pods -n todo-app -w
```

Press `Ctrl+C` to stop watching.

### 8.2 Scale Frontend
```powershell
kubectl scale deployment todo-frontend --replicas=3 -n todo-app
kubectl get pods -n todo-app
```

### 8.3 Scale Back Down
```powershell
kubectl scale deployment todo-backend --replicas=2 -n todo-app
kubectl scale deployment todo-frontend --replicas=2 -n todo-app
```

---

## Step 9: View Kubernetes Dashboard (Optional)

### 9.1 Install Kubernetes Dashboard
```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
```

### 9.2 Create Admin User
Create file `dashboard-admin.yaml`:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

Apply:
```powershell
kubectl apply -f dashboard-admin.yaml
```

### 9.3 Get Access Token
```powershell
kubectl -n kubernetes-dashboard create token admin-user
```

Copy the token (it's very long).

### 9.4 Start Proxy
```powershell
kubectl proxy
```

### 9.5 Access Dashboard
Open browser to:
```
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

Paste the token and click **Sign In**.

Navigate to **Namespaces** → **todo-app** to see your application.

---

## Screenshots for Demo Video

### Take these screenshots:

```powershell
# 1. Cluster info
kubectl cluster-info
# Take screenshot: 01-cluster-info.png

# 2. Nodes
kubectl get nodes
# Take screenshot: 02-nodes.png

# 3. All resources
kubectl get all -n todo-app
# Take screenshot: 03-all-resources.png

# 4. Pods details
kubectl get pods -n todo-app -o wide
# Take screenshot: 04-pods-running.png

# 5. Services
kubectl get svc -n todo-app
# Take screenshot: 05-services.png

# 6. ConfigMaps and Secrets
kubectl get configmap,secret -n todo-app
# Take screenshot: 06-config-secrets.png

# 7. HPA (if enabled)
kubectl get hpa -n todo-app
# Take screenshot: 07-hpa.png

# 8. Backend Swagger UI
# Open http://localhost:30800/docs in browser
# Take screenshot: 08-backend-swagger.png

# 9. Frontend App
# Open http://localhost:30300 in browser
# Take screenshot: 09-frontend-app.png

# 10. Pod logs
kubectl logs <backend-pod-name> -n todo-app | head -30
# Take screenshot: 10-pod-logs.png

# 11. Scaling demo
kubectl scale deployment todo-backend --replicas=5 -n todo-app
kubectl get pods -n todo-app
# Take screenshot: 11-scaling-demo.png

# 12. Docker images
docker images | findstr todo
# Take screenshot: 12-docker-images.png
```

Save all screenshots to: `screenshots/phase4/`

---

## Troubleshooting

### Pods stuck in "Pending" state
```powershell
kubectl describe pod <pod-name> -n todo-app
```

Common causes:
- Not enough resources (increase Docker Desktop memory)
- Image pull errors (rebuild images)

### Pods stuck in "CrashLoopBackOff"
```powershell
kubectl logs <pod-name> -n todo-app
```

Common causes:
- Missing environment variables
- Wrong DATABASE_URL
- Backend can't connect to database

### Images not found (ImagePullBackOff)
The images are built locally, so imagePullPolicy should be "Never" or "IfNotPresent".

Check deployment files - they should have:
```yaml
imagePullPolicy: IfNotPresent
```

### Can't access application
Check services:
```powershell
kubectl get svc -n todo-app
```

Make sure NodePort services are created correctly.

---

## Cleanup (When Done)

### Delete Everything
```powershell
kubectl delete namespace todo-app
```

### Or Delete Individually
```powershell
kubectl delete -f k8s\deployment-backend.yaml
kubectl delete -f k8s\deployment-frontend.yaml
kubectl delete -f k8s\service-backend.yaml
kubectl delete -f k8s\service-frontend.yaml
kubectl delete -f k8s\hpa-backend.yaml
kubectl delete -f k8s\hpa-frontend.yaml
kubectl delete -f k8s\secret.yaml
kubectl delete -f k8s\configmap.yaml
kubectl delete -f k8s\namespace.yaml
```

### Delete Images
```powershell
docker rmi todo-frontend:v1.0.0
docker rmi todo-backend:v1.0.0
```

---

## Quick Commands Reference

```powershell
# View all resources
kubectl get all -n todo-app

# View pods
kubectl get pods -n todo-app

# View logs
kubectl logs <pod-name> -n todo-app

# Follow logs
kubectl logs -f <pod-name> -n todo-app

# Describe pod
kubectl describe pod <pod-name> -n todo-app

# Execute command in pod
kubectl exec -it <pod-name> -n todo-app -- /bin/sh

# Port forward
kubectl port-forward -n todo-app svc/todo-backend 8000:8000

# Scale deployment
kubectl scale deployment <name> --replicas=3 -n todo-app

# Restart deployment
kubectl rollout restart deployment <name> -n todo-app

# View deployment status
kubectl rollout status deployment <name> -n todo-app

# View all namespaces
kubectl get namespaces

# View events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

---

## Next Steps

1. ✅ Deploy to Docker Desktop Kubernetes (local)
2. ✅ Take all screenshots
3. ✅ Record demo video
4. 🎯 Deploy to cloud Kubernetes (GKE/EKS/AKS) for production
5. 🎯 Set up CI/CD pipeline
6. 🎯 Add monitoring (Prometheus + Grafana)
7. 🎯 Add logging (ELK stack)

---

**Deployment Method**: Docker Desktop Kubernetes
**Time Required**: 15-20 minutes
**Difficulty**: ⭐⭐☆☆☆ (Beginner-Friendly)
**Cost**: FREE

**Ready to deploy!** 🚀
