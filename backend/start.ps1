# MINDed Backend Startup Script for Windows

Write-Host "🚀 Starting MINDed Backend..." -ForegroundColor Cyan

# Check if virtual environment exists
if (!(Test-Path ".\.venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Green
& .\.venv\Scripts\Activate.ps1

# Install/update dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Green
pip install -r requirements.txt --quiet

# Check for Firebase credentials
if (!(Test-Path ".\firebase-service-account.json") -and !(Test-Path env:GOOGLE_APPLICATION_CREDENTIALS)) {
    Write-Host "⚠️  Warning: Firebase credentials not found!" -ForegroundColor Yellow
    Write-Host "   Please add firebase-service-account.json or set GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Yellow
}

# Start the backend
Write-Host "" 
Write-Host "✅ Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API docs available at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
