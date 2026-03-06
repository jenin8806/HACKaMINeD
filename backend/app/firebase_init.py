"""
Initialize Firebase Admin SDK for auth verification and Firestore.
Uses GOOGLE_APPLICATION_CREDENTIALS or backend/firebase-service-account.json.
"""
import os

_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return

    import firebase_admin
    from firebase_admin import credentials

    # Prefer env var; fallback to service account file in backend folder
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path:
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cred_path = os.path.join(base, "firebase-service-account.json")

    if not os.path.isfile(cred_path):
        # Run without Firebase: /api/auth/* will return 503 or require no token
        return

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    _firebase_initialized = True
