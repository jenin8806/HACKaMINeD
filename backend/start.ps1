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

# ─── Checkpoint: Pre-start diagnostics ─────────────────────────────────────
Write-Host ""
Write-Host "📋 Checkpoint – what's configured:" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray

# 1. .env file
if (Test-Path ".\.env") {
    Write-Host "  ✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "  ✗ .env file missing – copy from .env.example" -ForegroundColor Red
}

# 2. Firebase service account file
$firebaseFile = Get-ChildItem -Path "." -Filter "*adminsdk*.json" -ErrorAction SilentlyContinue | Select-Object -First 1
if (Test-Path ".\firebase-service-account.json") {
    Write-Host "  ✓ firebase-service-account.json found" -ForegroundColor Green
} elseif ($firebaseFile) {
    Write-Host "  ✓ Firebase file found: $($firebaseFile.Name)" -ForegroundColor Green
} else {
    Write-Host "  ✗ No Firebase Admin SDK JSON file (*adminsdk*.json)" -ForegroundColor Red
}

# 3. Firebase in .env
$firebaseInEnv = $false
if (Test-Path ".\.env") {
    $firebaseInEnv = (Select-String -Path ".\.env" -Pattern "GOOGLE_APPLICATION_CREDENTIALS=.+" -Quiet) -or
                     (Select-String -Path ".\.env" -Pattern "FIREBASE_SERVICE_ACCOUNT=.+" -Quiet)
}
if ($firebaseInEnv) {
    Write-Host "  ✓ Firebase credentials configured in .env" -ForegroundColor Green
} else {
    Write-Host "  ✗ GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT not in .env" -ForegroundColor Red
}

# 4. LLM API (optional)
$hasLlm = $false
if (Test-Path ".\.env") {
    $hasLlm = Select-String -Path ".\.env" -Pattern "LLM_API_URL=.+" -Quiet
}
if ($hasLlm) {
    Write-Host "  ✓ LLM_API_URL configured" -ForegroundColor Green
} else {
    Write-Host "  ○ LLM_API_URL not set (optional – needed for /api/analyze, /api/chat)" -ForegroundColor Yellow
}

# 5. Firebase client keys (for reference – used by frontend)
$hasFirebaseKeys = $false
if (Test-Path ".\.env") {
    $hasFirebaseKeys = Select-String -Path ".\.env" -Pattern "FIREBASE_PROJECT_ID=.+" -Quiet
}
if ($hasFirebaseKeys) {
    Write-Host "  ✓ FIREBASE_PROJECT_ID in .env" -ForegroundColor Green
} else {
    Write-Host "  ○ FIREBASE_* keys not in .env (frontend uses its own config)" -ForegroundColor Gray
}

Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Start the backend
Write-Host "" 
Write-Host "✅ Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API docs available at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
