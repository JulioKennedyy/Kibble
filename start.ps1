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
if (-not (Test-Path $VenvActivate)) {
    Write-Host "Creating Python venv..." -ForegroundColor Cyan
    python -m venv (Join-Path $Root ".venv")
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& (Join-Path $Root ".venv\Scripts\pip.exe") install -q -r (Join-Path $Root "backend\requirements.txt")

Write-Host "Starting FastAPI backend on :8000..." -ForegroundColor Cyan
$BackendJob = Start-Job -ScriptBlock {
    param($root)
    & "$root\.venv\Scripts\uvicorn.exe" main:app --app-dir "$root\backend" --host 127.0.0.1 --port 8000
} -ArgumentList $Root

# Wait a moment for the backend to bind
Start-Sleep -Seconds 2

# ── Start frontend ────────────────────────────────────────────────
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location (Join-Path $Root "frontend")
npm install --silent

Write-Host "Starting Vite frontend on :5173..." -ForegroundColor Cyan
$FrontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev
} -ArgumentList (Join-Path $Root "frontend")

Pop-Location

Write-Host ""
Write-Host "✅ Kibble is running:" -ForegroundColor Green
Write-Host "   Frontend → http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend  → http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers, or run .\stop.ps1" -ForegroundColor DarkGray
Write-Host ""

# Keep script alive and stream logs
try {
    while ($true) {
        Receive-Job $BackendJob  | ForEach-Object { Write-Host "[backend]  $_" -ForegroundColor DarkGray }
        Receive-Job $FrontendJob | ForEach-Object { Write-Host "[frontend] $_" -ForegroundColor DarkGray }
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Stop-Job  $BackendJob, $FrontendJob  -ErrorAction SilentlyContinue
    Remove-Job $BackendJob, $FrontendJob -ErrorAction SilentlyContinue
    Kill-Port 8000
    Kill-Port 5173
    Write-Host "Done." -ForegroundColor Green
}
