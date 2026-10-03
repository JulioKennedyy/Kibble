#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop all Kibble processes on ports 8000 and 5173.
.USAGE
    .\stop.ps1
#>

function Kill-Port([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "Stopping PID $($conn.OwningProcess) on port $Port..." -ForegroundColor Yellow
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped." -ForegroundColor Green
    } else {
        Write-Host "Port ${Port}: nothing running." -ForegroundColor DarkGray
    }
}

Kill-Port 8000
Kill-Port 5173

# Also stop any background Kibble PS jobs
Get-Job | Where-Object { $_.Name -match "kibble|uvicorn|vite" } |
    ForEach-Object { Stop-Job $_; Remove-Job $_ }

Write-Host "✅ Kibble stopped." -ForegroundColor Green
