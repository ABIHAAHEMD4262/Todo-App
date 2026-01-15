@echo off
REM ============================================
REM Install Minikube on G: Drive (Save C: Space)
REM ============================================
REM Run this as Administrator!

echo ============================================
echo   Installing Minikube on G: Drive
echo ============================================
echo.

REM Step 1: Create Minikube directory on G:
echo [1/6] Creating Minikube directory on G: drive...
if not exist "G:\minikube" mkdir "G:\minikube"
echo Done! Created G:\minikube

REM Step 2: Set MINIKUBE_HOME environment variable (User level)
echo.
echo [2/6] Setting MINIKUBE_HOME environment variable...
setx MINIKUBE_HOME "G:\minikube"
set MINIKUBE_HOME=G:\minikube
echo Done! MINIKUBE_HOME set to G:\minikube

REM Step 3: Download Minikube
echo.
echo [3/6] Downloading Minikube...
if not exist "G:\minikube\minikube.exe" (
    curl -Lo G:\minikube\minikube.exe https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe
    echo Done! Downloaded to G:\minikube\minikube.exe
) else (
    echo Minikube already downloaded!
)

REM Step 4: Add to PATH
echo.
echo [4/6] Adding G:\minikube to PATH...
setx PATH "%PATH%;G:\minikube"
set PATH=%PATH%;G:\minikube
echo Done! Added to PATH

REM Step 5: Verify installation
echo.
echo [5/6] Verifying installation...
G:\minikube\minikube.exe version
echo.

REM Step 6: Show disk space
echo [6/6] Current disk space:
wmic logicaldisk get name,freespace,size
echo.

echo ============================================
echo   Installation Complete!
echo ============================================
echo.
echo Minikube installed to: G:\minikube\minikube.exe
echo Minikube data will be stored in: G:\minikube\.minikube
echo.
echo IMPORTANT: Close this terminal and open a NEW terminal
echo for the PATH changes to take effect!
echo.
echo Next steps:
echo   1. Open NEW terminal (Admin)
echo   2. Run: minikube start --driver=docker
echo   3. Wait 3-5 minutes for cluster to start
echo.
pause
