# MINDed - Complete Startup Script for Windows
# This script starts both backend and frontend in separate windows

Write-Host "🚀 Starting MINDed Application..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend in new PowerShell window
Write-Host "📡 Launching Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\backend\start.ps1" -WorkingDirectory "$scriptPath\backend"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend in new PowerShell window
Write-Host "🌐 Launching Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\frontend\start.ps1" -WorkingDirectory "$scriptPath\frontend"

Write-Host ""
Write-Host "✅ MINDed is starting up!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Two PowerShell windows have been opened." -ForegroundColor Gray
Write-Host "Close those windows to stop the servers." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
