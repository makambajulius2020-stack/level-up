@echo off
echo ========================================
echo Smart School Backend Startup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo Python found: 
python --version

echo.
echo Starting Smart School Backend...
echo This will start all backend services from one point
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Run the unified backend manager
python run.py

echo.
echo Backend has stopped.
pause
