# ============================================
# Deploy Todo App to Docker Desktop Kubernetes
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Todo App - Kubernetes Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
Write-Host "[1/6] Checking Kubernetes availability..." -ForegroundColor Yellow
try {
    $kubectlVersion = kubectl version --client --short 2>&1
    Write-Host "✓ kubectl found: $kubectlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ kubectl not found!" -ForegroundColor Red
    Write-Host "Please enable Kubernetes in Docker Desktop Settings." -ForegroundColor Red
    exit 1
}

# Check if cluster is running
try {
    $nodes = kubectl get nodes 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Kubernetes cluster is running" -ForegroundColor Green
    } else {
        throw "Cluster not accessible"
    }
} catch {
    Write-Host "✗ Kubernetes cluster not accessible!" -ForegroundColor Red
    Write-Host "Please enable Kubernetes in Docker Desktop Settings." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build Docker images
Write-Host "[2/6] Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes on first build..." -ForegroundColor Gray
Write-Host ""

# Build frontend
Write-Host "Building frontend image..." -ForegroundColor Gray
docker build -t todo-frontend:v1.0.0 ./frontend
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend image build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build backend
Write-Host "Building backend image..." -ForegroundColor Gray
docker build -t todo-backend:v1.0.0 ./backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend image built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Backend image build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if secrets file exists
Write-Host "[3/6] Checking secrets file..." -ForegroundColor Yellow
if (-Not (Test-Path "k8s\secret.yaml")) {
    Write-Host "✗ Secret file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create k8s\secret.yaml from template:" -ForegroundColor Yellow
    Write-Host "  1. Copy k8s\secret.yaml.template to k8s\secret.yaml" -ForegroundColor Yellow
    Write-Host "  2. Edit k8s\secret.yaml with your actual credentials:" -ForegroundColor Yellow
    Write-Host "     - DATABASE_URL (Neon PostgreSQL)" -ForegroundColor Yellow
    Write-Host "     - BETTER_AUTH_SECRET" -ForegroundColor Yellow
    Write-Host "     - OPENAI_API_KEY (optional)" -ForegroundColor Yellow
    Write-Host ""

    # Offer to create template
    $createTemplate = Read-Host "Create secret.yaml from template now? (y/n)"
    if ($createTemplate -eq "y") {
        Copy-Item "k8s\secret.yaml.template" "k8s\secret.yaml"
        Write-Host "✓ Template created at k8s\secret.yaml" -ForegroundColor Green
        Write-Host "Please edit it with your credentials and run this script again." -ForegroundColor Yellow
        exit 0
    } else {
        exit 1
    }
}
Write-Host "✓ Secret file found" -ForegroundColor Green
Write-Host ""

# Deploy to Kubernetes
Write-Host "[4/6] Deploying to Kubernetes..." -ForegroundColor Yellow

# Create namespace
Write-Host "Creating namespace..." -ForegroundColor Gray
kubectl apply -f k8s\namespace.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Namespace created" -ForegroundColor Green
}

# Create ConfigMap
Write-Host "Creating ConfigMap..." -ForegroundColor Gray
kubectl apply -f k8s\configmap.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ConfigMap created" -ForegroundColor Green
}

# Create Secrets
Write-Host "Creating Secrets..." -ForegroundColor Gray
kubectl apply -f k8s\secret.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Secrets created" -ForegroundColor Green
}

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Gray
kubectl apply -f k8s\deployment-frontend.yaml
kubectl apply -f k8s\service-frontend.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend deployed" -ForegroundColor Green
}

# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Gray
kubectl apply -f k8s\deployment-backend.yaml
kubectl apply -f k8s\service-backend.yaml
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend deployed" -ForegroundColor Green
}

# Deploy HPA (optional)
Write-Host "Deploying autoscalers..." -ForegroundColor Gray
kubectl apply -f k8s\hpa-frontend.yaml 2>&1 | Out-Null
kubectl apply -f k8s\hpa-backend.yaml 2>&1 | Out-Null
Write-Host "✓ Autoscalers deployed (requires metrics-server)" -ForegroundColor Green

Write-Host ""

# Wait for pods to be ready
Write-Host "[5/6] Waiting for pods to be ready..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes..." -ForegroundColor Gray
Write-Host ""

$maxWait = 120  # 2 minutes
$waited = 0
$interval = 5

while ($waited -lt $maxWait) {
    $pods = kubectl get pods -n todo-app -o json | ConvertFrom-Json
    $totalPods = $pods.items.Count
    $readyPods = ($pods.items | Where-Object { $_.status.phase -eq "Running" }).Count

    Write-Host "Pods ready: $readyPods/$totalPods" -ForegroundColor Gray

    if ($readyPods -eq $totalPods -and $totalPods -gt 0) {
        Write-Host "✓ All pods are ready!" -ForegroundColor Green
        break
    }

    Start-Sleep -Seconds $interval
    $waited += $interval
}

if ($waited -ge $maxWait) {
    Write-Host "⚠ Pods took longer than expected. Check status manually." -ForegroundColor Yellow
}

Write-Host ""

# Show deployment status
Write-Host "[6/6] Deployment Status" -ForegroundColor Yellow
Write-Host ""

kubectl get all -n todo-app

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get service URLs
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:    http://localhost:30300" -ForegroundColor Green
Write-Host "  Backend API: http://localhost:30800/docs" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View all resources:" -ForegroundColor White
Write-Host "    kubectl get all -n todo-app" -ForegroundColor Gray
Write-Host ""
Write-Host "  View pods:" -ForegroundColor White
Write-Host "    kubectl get pods -n todo-app" -ForegroundColor Gray
Write-Host ""
Write-Host "  View logs:" -ForegroundColor White
Write-Host "    kubectl logs <pod-name> -n todo-app" -ForegroundColor Gray
Write-Host ""
Write-Host "  Scale deployment:" -ForegroundColor White
Write-Host "    kubectl scale deployment todo-backend --replicas=3 -n todo-app" -ForegroundColor Gray
Write-Host ""
Write-Host "  Delete deployment:" -ForegroundColor White
Write-Host "    kubectl delete namespace todo-app" -ForegroundColor Gray
Write-Host ""

Write-Host "🎬 Ready for demo video!" -ForegroundColor Yellow
Write-Host ""
