@echo off
REM Windows Disk Cleanup Script
REM Run as Administrator to clean up C: drive

echo ====================================
echo   Windows Disk Cleanup Helper
echo ====================================
echo.

echo Checking current disk space...
wmic logicaldisk get name,freespace,size
echo.

echo ====================================
echo Common space-saving actions:
echo ====================================
echo.
echo 1. Clean Windows Temp files
echo 2. Empty Recycle Bin
echo 3. Clean Windows Update cache
echo 4. Remove old system restore points
echo 5. Clean Docker cache
echo.

pause

echo.
echo [1/5] Cleaning Windows Temp files...
del /q /f /s %TEMP%\* 2>nul
rd /s /q %TEMP% 2>nul
mkdir %TEMP%
echo Done!

echo.
echo [2/5] Emptying Recycle Bin...
rd /s /q C:\$Recycle.Bin 2>nul
echo Done!

echo.
echo [3/5] Opening Disk Cleanup utility (select all checkboxes)...
cleanmgr /d C:

echo.
echo [4/5] Clean Docker cache (if Docker is installed)...
docker system prune -a -f 2>nul
echo Done!

echo.
echo [5/5] Opening Storage Settings...
echo Please review and remove:
echo - Large files
echo - Old downloads
echo - Unused apps
start ms-settings:storagesense

echo.
echo ====================================
echo Cleanup complete! Check new space:
echo ====================================
wmic logicaldisk get name,freespace,size

pause
