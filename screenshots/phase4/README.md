# Phase 4 Screenshots

Save all Kubernetes deployment screenshots here.

## Required Screenshots (Minimum 15)

### Infrastructure
- [ ] `01-k8s-manifests.png` - Project structure showing k8s/ directory
- [ ] `04-images-after.png` - Docker images built
- [ ] `05-cluster-info.png` - Kubernetes cluster information
- [ ] `06-nodes.png` - Kubernetes nodes (docker-desktop)

### Deployment
- [ ] `08-all-resources.png` - All K8s resources in todo-app namespace ⭐ **ESSENTIAL**
- [ ] `09-pods-details.png` - Pod details showing running status ⭐ **ESSENTIAL**
- [ ] `10-services.png` - Services (NodePort configuration) ⭐ **ESSENTIAL**
- [ ] `12-config-secrets.png` - ConfigMaps and Secrets ⭐ **ESSENTIAL**
- [ ] `13-hpa.png` - Horizontal Pod Autoscaler configuration ⭐ **ESSENTIAL**

### Application
- [ ] `16-backend-swagger.png` - Backend Swagger UI at localhost:30800/docs ⭐ **ESSENTIAL**
- [ ] `18-frontend-landing.png` - Frontend landing page at localhost:30300 ⭐ **ESSENTIAL**
- [ ] `20-dashboard.png` - Frontend dashboard (logged in) ⭐ **ESSENTIAL**

### Scaling Demo
- [ ] `21-before-scaling.png` - Pods before scaling (2 replicas)
- [ ] `24-after-scaling.png` - Pods after scaling (5 replicas) ⭐ **ESSENTIAL**
- [ ] `25-deployment-scaled.png` - Deployment showing 5/5 ready ⭐ **ESSENTIAL**

### Logs
- [ ] `14-backend-logs.png` - Backend pod logs ⭐ **ESSENTIAL**

### Bonus Points (+200)
- [ ] `29-skills.png` - .claude/skills directory (5 skills) ⭐ **ESSENTIAL**
- [ ] `30-agents.png` - .claude/agents directory (2 agents) ⭐ **ESSENTIAL**
- [ ] `31-blueprints.png` - .claude/blueprints directory (1 blueprint)
- [ ] `32-helm-chart.png` - helm-chart directory

## How to Take Screenshots

### Windows
1. **Snipping Tool** (Recommended)
   - Press `Win + Shift + S`
   - Select area
   - Paste into Paint
   - Save as PNG

2. **Print Screen**
   - Press `PrtScn` (full screen)
   - Or `Alt + PrtScn` (active window)
   - Paste into Paint
   - Save as PNG

### Tips for Great Screenshots
- ✅ Use large terminal font (16-18pt)
- ✅ Hide taskbar and unnecessary windows
- ✅ Clear screen (`cls`) before commands
- ✅ Use consistent naming
- ✅ Capture at 1080p or higher resolution
- ✅ Make sure all text is readable

## Screenshot Commands

See the file: `SCREENSHOT-COMMANDS.md` for exact commands to run for each screenshot.

## For Demo Video

Use these screenshots as reference points while recording your 90-second demo video.

**Most Important Moments to Show:**
1. All resources running (`kubectl get all -n todo-app`)
2. Backend Swagger UI working
3. Frontend app working
4. Scaling demo (2 → 5 replicas)
5. Skills and Agents for +200 bonus

## Submission

Include this entire `screenshots/` directory in your GitHub repository.

**GitHub Path:** `screenshots/phase4/*.png`

---

**Target:** 15-20 screenshots minimum
**Essential:** 15 marked with ⭐
**Bonus:** 4 for +200 points
