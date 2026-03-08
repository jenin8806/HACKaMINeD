# MINDed Frontend Startup Script for Windows

Write-Host "🚀 Starting MINDed Frontend..." -ForegroundColor Cyan

# Check if node_modules exists
if (!(Test-Path ".\node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check for .env file
if (!(Test-Path ".\.env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".\.env.example" ".\.env"
}

# Display configuration
Write-Host ""
Write-Host "✅ Starting Vite dev server..." -ForegroundColor Green
Write-Host "🌐 Frontend will be available at http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔗 Make sure backend is running at http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
