# MINDed Backend (Python + Firebase)

- **Framework:** FastAPI
- **Database:** Firebase Firestore (NoSQL)
- **Auth:** Firebase Auth — Google + Email/Password only (no GitHub). Backend verifies ID tokens and stores profiles in Firestore.

## Setup

1. Create a virtualenv and install deps:

   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```

2. **Firebase service account (required for /api/auth):**
   - In [Firebase Console](https://console.firebase.google.com) → Project Settings → Service accounts → Generate new private key.
   - Save the JSON file as `backend/firebase-service-account.json`, **or**
   - Set env: `GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\firebase-service-account.json`

3. **Firestore:** No schema needed. The app uses a collection `users` with document ID = Firebase Auth UID. Each document has: `username`, `email`, `profile_pic`, `plan`.

4. **Firebase Auth:** In Firebase Console → Authentication → Sign-in method, enable:
   - **Email/Password**
   - **Google**

   (Do not enable GitHub if you only want Gmail and email/password.)

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Endpoints

- `GET /api/auth/me` — Returns current user profile (Bearer token required). Profile comes from Firestore.
- `POST /api/auth/signup` — Create/update user profile in Firestore (Bearer token + body: `{ "username", "email" }`).
- `GET /health` — Health check.
