"""
Initialize Firebase Admin SDK for auth verification and Firestore.

Priority:
1. FIREBASE_SERVICE_ACCOUNT (JSON string in env — ideal for Render/hosting)
2. GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)
3. backend/firebase-service-account.json (local fallback)
"""
import os
import json

_firebase_initialized = False


def init_firebase() -> bool:
    """Initialize Firebase Admin. Returns True if successful."""
    global _firebase_initialized
    if _firebase_initialized:
        return True

    import firebase_admin
    from firebase_admin import credentials

    cred = None

    # 1) JSON in env (best for Render: FIREBASE_SERVICE_ACCOUNT=<full JSON>)
    svc_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if svc_json:
        try:
            cred_info = json.loads(svc_json)
            cred = credentials.Certificate(cred_info)
        except json.JSONDecodeError as e:
            print(f"[firebase_init] Invalid FIREBASE_SERVICE_ACCOUNT JSON ({e}) — falling back to file-based credentials.")

    # 2) File path from GOOGLE_APPLICATION_CREDENTIALS or local fallback
    if cred is None:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not cred_path:
            cred_path = os.path.join(base, "firebase-service-account.json")
        elif not os.path.isabs(cred_path) and not os.path.isfile(cred_path):
            # Relative path: resolve from backend/ (cwd when running uvicorn)
            cred_path = os.path.join(base, os.path.basename(cred_path))

        if not os.path.isfile(cred_path):
            # Run without Firebase: /api/auth/* will return 503 or require no token
            print("[firebase_init] No valid service account file found — running without Firebase Admin.")
            return False

        try:
            cred = credentials.Certificate(cred_path)
        except ValueError as e:
            print(f"[firebase_init] Invalid service account file ({e}) — running without Firebase Admin.")
            return False

    try:
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        return True
    except ValueError as e:
        print(f"[firebase_init] Failed to initialize Firebase Admin ({e}) — running without Firebase Admin.")
        return False
