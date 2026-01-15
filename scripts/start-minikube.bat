@echo off
REM ============================================
REM Start Minikube Cluster (G: Drive)
REM ============================================
REM Run this as Administrator after installation!

echo ============================================
echo   Starting Minikube Cluster
echo ============================================
echo.

REM Set MINIKUBE_HOME (in case not set in this session)
set MINIKUBE_HOME=G:\minikube

REM Check if Docker is running
echo [1/5] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo Done! Docker is running.
echo.

REM Start Minikube
echo [2/5] Starting Minikube cluster...
echo This will take 3-5 minutes. Please wait...
echo.
minikube start --driver=docker --cpus=2 --memory=4096 --disk-size=20g
echo.

REM Enable required addons
echo [3/5] Enabling addons...
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
echo Done!
echo.

REM Show status
echo [4/5] Cluster status:
minikube status
echo.

REM Show nodes
echo [5/5] Cluster nodes:
kubectl get nodes
echo.

echo ============================================
echo   Minikube Cluster Ready!
echo ============================================
echo.
echo Useful commands:
echo   minikube status        - Check cluster status
echo   minikube dashboard     - Open Kubernetes dashboard
echo   minikube stop          - Stop cluster (saves state)
echo   minikube delete        - Delete cluster
echo   minikube ip            - Get cluster IP
echo.
echo To deploy Todo App:
echo   cd /d G:\hackathon-02\Todo-App
echo   kubectl apply -f k8s\
echo.
echo Or use Helm:
echo   helm install todo-app .\helm-chart\
echo.
pause
