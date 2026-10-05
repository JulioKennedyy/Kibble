#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start Kibble — FastAPI backend (port 8000) + Vite frontend (port 5173).
    Ensures no duplicate processes on those ports before starting.
.USAGE
    .\start.ps1
#>

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

function Kill-Port([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "⚠  Port $Port in use by PID $($conn.OwningProcess). Stopping..." -ForegroundColor Yellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Write-Host "   Port $Port freed." -ForegroundColor Green
    }
}

# ── Ensure ports are free ──────────────────────────────────────────
Kill-Port 8000
Kill-Port 5173

# ── Start backend ─────────────────────────────────────────────────
$VenvActivate = Join-Path $Root ".venv\Scripts\Activate.ps1"
$Requirements = Join-Path $Root "backend\requirements-dev.txt"
$RequirementsStamp = Join-Path $Root ".venv\.kibble-requirements.sha256"
if (-not (Test-Path $VenvActivate)) {
    Write-Host "Creating Python venv..." -ForegroundColor Cyan
    python -m venv (Join-Path $Root ".venv")
}

if (Test-Path $RequirementsStamp) {
    $InstalledRequirementsHash = (Get-Content $RequirementsStamp -Raw).Trim()
} else {
    $InstalledRequirementsHash = ""
}
$RequirementsHash = (Get-FileHash $Requirements -Algorithm SHA256).Hash

if ($InstalledRequirementsHash -ne $RequirementsHash) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    & (Join-Path $Root ".venv\Scripts\pip.exe") install -q -r $Requirements
    Set-Content -Path $RequirementsStamp -Value $RequirementsHash
}

Write-Host "Starting FastAPI backend on :8000..." -ForegroundColor Cyan
$LogDir = Join-Path $Root ".kibble-logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
Start-Process `
    -FilePath (Join-Path $Root ".venv\Scripts\uvicorn.exe") `
    -ArgumentList "main:app --app-dir `"$Root\backend`" --host 127.0.0.1 --port 8000" `
    -WorkingDirectory $Root `
    -RedirectStandardOutput (Join-Path $LogDir "backend.log") `
    -RedirectStandardError (Join-Path $LogDir "backend-error.log") `
    -WindowStyle Hidden | Out-Null

# Wait a moment for the backend to bind
Start-Sleep -Seconds 2

# ── Start frontend ────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $Root "frontend\node_modules\.bin\vite.cmd"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location (Join-Path $Root "frontend")
    npm.cmd install --silent
    Pop-Location
}

Write-Host "Starting Vite frontend on :5173..." -ForegroundColor Cyan
Start-Process `
    -FilePath (Join-Path $Root "frontend\node_modules\.bin\vite.cmd") `
    -ArgumentList "--host 127.0.0.1" `
    -WorkingDirectory (Join-Path $Root "frontend") `
    -RedirectStandardOutput (Join-Path $LogDir "frontend.log") `
    -RedirectStandardError (Join-Path $LogDir "frontend-error.log") `
    -WindowStyle Hidden | Out-Null

Write-Host ""
Write-Host "✅ Kibble is running:" -ForegroundColor Green
Write-Host "   Frontend → http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend  → http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run .\stop.ps1 to stop both servers." -ForegroundColor DarkGray
Write-Host "Logs: .\.kibble-logs\" -ForegroundColor DarkGray
