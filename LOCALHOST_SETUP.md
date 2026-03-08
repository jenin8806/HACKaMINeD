# Running MINDed on Localhost

This guide will help you run the full MINDed application (frontend + backend) on your local machine.

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Firebase Account** with a project set up

---

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create and activate virtual environment
```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Firebase

#### Option A: Service Account JSON (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`hackamined-42869`)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `backend/firebase-service-account.json`

#### Option B: Environment Variable
Set the path to your service account JSON:
```bash
# In .env file:
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\firebase-service-account.json
```

### 5. Configure Environment Variables

The `backend/.env` file should contain:
```env
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
LLM_API_URL=your_llm_api_url_here
LLM_API_KEY=your_llm_api_key_here

FIREBASE_API_KEY=AIzaSyBl3JuliPK5kd_RLRAG4_36ttpIyYF0nv4
FIREBASE_AUTH_DOMAIN=hackamined-42869.firebaseapp.com
FIREBASE_PROJECT_ID=hackamined-42869
FIREBASE_STORAGE_BUCKET=hackamined-42869.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1085250492130
FIREBASE_APP_ID=1:1085250492130:web:0d71d110994bffd539f0bb
FIREBASE_MEASUREMENT_ID=G-JY0P8HW3MB
```

### 6. Enable Firebase Authentication

In Firebase Console → **Authentication** → **Sign-in method**, enable:
- ✅ Email/Password
- ✅ Google

### 7. Run the backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Frontend Setup

### 1. Navigate to frontend directory
Open a **new terminal** and:
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables

The `frontend/.env` file should contain:
```env
# Backend base URL (used for auth, analyze, chat)
VITE_API_BASE_URL=http://localhost:8000
# Or use full auth path: VITE_API_URL=http://localhost:8000/api/auth
```

This is already configured for local development.

### 4. Run the frontend
```bash
npm run dev
```

Frontend will be available at:
- App: http://localhost:5173

---

## Testing the Application

1. Open http://localhost:5173 in your browser
2. Click **Sign Up** or **Login**
3. Create an account using:
   - Email/Password, or
   - Google Sign-In

---

## Troubleshooting

### Backend Issues

**"Firebase Admin credentials not found"**
- Verify `firebase-service-account.json` exists in `backend/` directory
- Or check `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

**"ModuleNotFoundError"**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**CORS errors**
- Backend allows `localhost:5173`, `the-v-box.vercel.app`, and origins in `CORS_ORIGINS`
- Set `FRONTEND_URL` and `CORS_ORIGINS` in backend `.env` for production

### Frontend Issues

**"Property 'env' does not exist on type 'ImportMeta'"**
- This is fixed by the `tsconfig.json` files
- Restart VS Code or TypeScript server if error persists

**"Cannot connect to API"**
- Verify backend is running on http://localhost:8000
- Check `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000` or `VITE_API_URL=http://localhost:8000/api/auth`
- Restart frontend dev server after changing `.env`

**Build errors**
- Clear cache: `rm -rf node_modules .vite dist`
- Reinstall: `npm install`

---

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Production Notes

- **Frontend (Vercel)**: Set `VITE_API_BASE_URL=https://hackmined.onrender.com` in project env vars
- **Backend (Render)**: Set `FRONTEND_URL=https://the-v-box.vercel.app` and `CORS_ORIGINS=https://the-v-box.vercel.app` for CORS
- Never commit `.env` files or `firebase-service-account.json` to git
