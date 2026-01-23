# 📸 Screenshot Commands for Demo Video

Copy-paste these commands in order and take screenshots after each one.

Save all screenshots to: `screenshots/phase4/`

---

## Before Deployment

### Screenshot 01: Project Structure
```powershell
# Windows PowerShell
dir k8s
```
**Save as:** `01-k8s-manifests.png`

### Screenshot 02: Docker Images Before Build
```powershell
docker images | findstr todo
```
**Save as:** `02-images-before.png`

---

## During Build (Optional Fast-Forward)

### Screenshot 03: Building Images
```powershell
# This is a long process, show the command running
docker build -t todo-frontend:v1.0.0 ./frontend
```
**Save as:** `03-building-images.png`

---

## After Build

### Screenshot 04: Docker Images After Build
```powershell
docker images | findstr todo
```
**Save as:** `04-images-after.png`

---

## Kubernetes Cluster Verification

### Screenshot 05: Kubernetes Cluster Info
```powershell
kubectl cluster-info
```
**Save as:** `05-cluster-info.png`

### Screenshot 06: Kubernetes Nodes
```powershell
kubectl get nodes
```
**Save as:** `06-nodes.png`

---

## Deployment

### Screenshot 07: Deploying to Kubernetes
```powershell
# Show one of these commands executing
kubectl apply -f k8s\deployment-frontend.yaml
```
**Save as:** `07-deploying.png`

---

## After Deployment - Resources

### Screenshot 08: All Resources
```powershell
kubectl get all -n todo-app
```
**Save as:** `08-all-resources.png`

### Screenshot 09: Pods Details
```powershell
kubectl get pods -n todo-app -o wide
```
**Save as:** `09-pods-details.png`

### Screenshot 10: Services
```powershell
kubectl get svc -n todo-app
```
**Save as:** `10-services.png`

### Screenshot 11: Deployments
```powershell
kubectl get deployments -n todo-app
```
**Save as:** `11-deployments.png`

### Screenshot 12: ConfigMap & Secrets
```powershell
kubectl get configmap,secret -n todo-app
```
**Save as:** `12-config-secrets.png`

### Screenshot 13: HPA (Horizontal Pod Autoscaler)
```powershell
kubectl get hpa -n todo-app
```
**Save as:** `13-hpa.png`

---

## Pod Logs

### Screenshot 14: Backend Pod Logs
```powershell
# First get pod name
kubectl get pods -n todo-app | findstr backend

# Then view logs (replace <pod-name>)
kubectl logs <todo-backend-pod-name> -n todo-app
```
**Save as:** `14-backend-logs.png`

### Screenshot 15: Frontend Pod Logs
```powershell
kubectl logs <todo-frontend-pod-name> -n todo-app
```
**Save as:** `15-frontend-logs.png`

---

## Application Access

### Screenshot 16: Backend Swagger UI
**Open in browser:** http://localhost:30800/docs

**Save as:** `16-backend-swagger.png`

### Screenshot 17: Backend Health Check
**In Swagger UI:**
1. Expand `GET /health`
2. Click "Try it out"
3. Click "Execute"
4. Show the response: `{"status": "healthy"}`

**Save as:** `17-health-check.png`

### Screenshot 18: Frontend Landing Page
**Open in browser:** http://localhost:30300

**Save as:** `18-frontend-landing.png`

### Screenshot 19: Frontend Login Page
**Navigate to:** http://localhost:30300/login

**Save as:** `19-login-page.png`

### Screenshot 20: Frontend Dashboard
**After logging in:** http://localhost:30300/dashboard

**Save as:** `20-dashboard.png`

---

## Scaling Demo

### Screenshot 21: Before Scaling
```powershell
kubectl get pods -n todo-app
```
**Save as:** `21-before-scaling.png`

### Screenshot 22: Scale Up Backend
```powershell
kubectl scale deployment todo-backend --replicas=5 -n todo-app
```
**Save as:** `22-scaling-command.png`

### Screenshot 23: After Scaling (Pods Increasing)
```powershell
kubectl get pods -n todo-app
```
Wait a few seconds, you should see more pods being created.

**Save as:** `23-scaling-in-progress.png`

### Screenshot 24: After Scaling (All Running)
```powershell
kubectl get pods -n todo-app
```
Wait until all 5 backend pods are Running.

**Save as:** `24-after-scaling.png`

### Screenshot 25: Deployment with 5 Replicas
```powershell
kubectl get deployments -n todo-app
```
Should show `READY 5/5` for backend.

**Save as:** `25-deployment-scaled.png`

---

## Pod Details

### Screenshot 26: Describe Pod
```powershell
kubectl describe pod <any-pod-name> -n todo-app
```
**Save as:** `26-pod-describe.png`

### Screenshot 27: Pod Resource Usage (if metrics-server is installed)
```powershell
kubectl top pods -n todo-app
```
**Save as:** `27-pod-resources.png`

---

## Events

### Screenshot 28: Recent Events
```powershell
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```
**Save as:** `28-events.png`

---

## Reusable Intelligence (+200 Bonus)

### Screenshot 29: Skills Directory
```powershell
dir .claude\skills
```
**Save as:** `29-skills.png`

### Screenshot 30: Agents Directory
```powershell
dir .claude\agents
```
**Save as:** `30-agents.png`

### Screenshot 31: Blueprints Directory
```powershell
dir .claude\blueprints
```
**Save as:** `31-blueprints.png`

### Screenshot 32: Helm Chart
```powershell
dir helm-chart
```
**Save as:** `32-helm-chart.png`

---

## Cleanup (After Video)

### Screenshot 33: Delete Namespace
```powershell
kubectl delete namespace todo-app
```
**Save as:** `33-cleanup.png` (optional)

---

## Summary

**Total Screenshots:** 32 (minimum 20 recommended for submission)

**Essential Screenshots (Top 15):**
1. ✅ `08-all-resources.png` - Shows everything deployed
2. ✅ `09-pods-details.png` - Shows pods running
3. ✅ `10-services.png` - Shows services
4. ✅ `12-config-secrets.png` - Shows configuration
5. ✅ `13-hpa.png` - Shows autoscaling configured
6. ✅ `16-backend-swagger.png` - Shows API working
7. ✅ `18-frontend-landing.png` - Shows frontend working
8. ✅ `20-dashboard.png` - Shows full app working
9. ✅ `24-after-scaling.png` - Shows scaling working
10. ✅ `25-deployment-scaled.png` - Shows 5 replicas
11. ✅ `04-images-after.png` - Shows Docker images
12. ✅ `06-nodes.png` - Shows K8s cluster
13. ✅ `14-backend-logs.png` - Shows pod logs
14. ✅ `29-skills.png` - Shows skills for bonus
15. ✅ `30-agents.png` - Shows agents for bonus

---

## Tips for Great Screenshots

1. **Increase terminal font size** - Make text readable (16-18pt minimum)
2. **Use fullscreen** - Hide taskbar and other windows
3. **Clean output** - Run `cls` (clear screen) before commands
4. **Wait for completion** - Let commands finish before capturing
5. **Highlight important parts** - Use Windows Snipping Tool to annotate
6. **Consistent naming** - Follow the naming convention above
7. **High resolution** - Use at least 1080p screen resolution
8. **Dark mode** (optional) - Looks professional in demos

---

## Quick Copy-Paste Block (All Essential Commands)

```powershell
# Run these in sequence, screenshot after each
kubectl get all -n todo-app
kubectl get pods -n todo-app -o wide
kubectl get svc -n todo-app
kubectl get configmap,secret -n todo-app
kubectl get hpa -n todo-app
kubectl logs (kubectl get pods -n todo-app | findstr backend | %{$_.Split()[0]}) -n todo-app | head -30
docker images | findstr todo
dir .claude\skills
dir .claude\agents
kubectl scale deployment todo-backend --replicas=5 -n todo-app
Start-Sleep -Seconds 10
kubectl get pods -n todo-app
kubectl get deployments -n todo-app
```

Then open browsers:
- http://localhost:30800/docs
- http://localhost:30300

---

**Ready to capture!** 📸
