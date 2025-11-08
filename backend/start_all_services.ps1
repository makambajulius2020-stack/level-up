# Smart School Backend Startup Script (PowerShell)
# This script starts all backend services from one point

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Smart School Backend Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Smart School Backend..." -ForegroundColor Yellow
Write-Host "This will start all backend services from one point" -ForegroundColor Yellow
Write-Host ""

# Change to backend directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if run.py exists
if (-not (Test-Path "run.py")) {
    Write-Host "ERROR: run.py not found in current directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the unified backend manager
try {
    Write-Host "Executing: python run.py" -ForegroundColor Cyan
    python run.py
} catch {
    Write-Host "ERROR: Failed to start backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Backend has stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
