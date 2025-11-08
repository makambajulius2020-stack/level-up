# Fix Python env, recreate venv, install deps, ensure MySQL DB exists, create tables, seed data, and start Flask
# Usage (PowerShell):
#   Set-ExecutionPolicy -Scope Process Bypass
#   ./scripts/fix_and_setup.ps1

param(
  [string]$DbUrl = ""
)

Write-Host "=== Smart School: Fix and Setup (MySQL + Flask) ===" -ForegroundColor Cyan

# 1) Clear conflicting env vars for this session
Remove-Item Env:PYTHONHOME -ErrorAction SilentlyContinue
Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue

# 2) Move to backend dir
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendRoot = Split-Path -Parent $ScriptDir
Set-Location $BackendRoot

# 3) Ensure venv
if (Test-Path .\venv) {
  Write-Host "Removing existing venv..." -ForegroundColor Yellow
  try { Remove-Item venv -Recurse -Force } catch {}
}

Write-Host "Creating venv..." -ForegroundColor Yellow
py -3 -m venv venv 2>$null
if (-not (Test-Path .\venv\Scripts\python.exe)) {
  Write-Host "Falling back to 'python'..." -ForegroundColor Yellow
  python -m venv venv
}

Write-Host "Upgrading pip and installing requirements..." -ForegroundColor Yellow
./venv/Scripts/python -m pip install --upgrade pip
./venv/Scripts/pip install -r requirements.txt

# 4) Confirm DB URL
$EnvFile = Join-Path $BackendRoot ".env"
if (-not (Test-Path $EnvFile)) {
  Write-Host ".env not found at $EnvFile" -ForegroundColor Red
  exit 1
}

$envContent = Get-Content $EnvFile -Raw
if ($DbUrl -ne "") {
  Write-Host "Overriding DATABASE_URL via parameter" -ForegroundColor Yellow
  $envContent = ($envContent -split "`n") | ForEach-Object {
    if ($_ -match '^DATABASE_URL=') { "DATABASE_URL=$DbUrl" } else { $_ }
  } | Out-String
  Set-Content -Path $EnvFile -Value $envContent -Encoding UTF8
}

# 5) One-shot setup: ensure DB (if MySQL), create tables, seed data
Write-Host "Running setup_demo.py..." -ForegroundColor Yellow
./venv/Scripts/python setup_demo.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "setup_demo.py failed. Trying direct create_all and seed as fallback..." -ForegroundColor Yellow
  ./venv/Scripts/python -c "from app import create_app, db; app=create_app();\nfrom contextlib import suppress\nwith app.app_context(): db.create_all(); print('Tables created')"
  ./venv/Scripts/python -c "import seed_demo_data as s; s.main(); print('Seed complete')"
}

# 6) Start Flask (user can close and run manually later if preferred)
Write-Host "Starting Flask on http://127.0.0.1:5000 ..." -ForegroundColor Green
$env:FLASK_APP = "app:create_app"
$env:FLASK_RUN_PORT = "5000"
$env:FLASK_RUN_HOST = "127.0.0.1"
./venv/Scripts/flask run
