"""
Firestore NoSQL access for user profiles.
Collection: users — document ID = Firebase Auth uid.
"""
from typing import Any


def _get_firestore():
    try:
        from firebase_admin import firestore
        return firestore.client()
    except Exception:
        return None


def get_user_profile(uid: str) -> dict[str, Any] | None:
    """Get user profile from Firestore users/{uid}."""
    db = _get_firestore()
    if not db:
        return None
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return doc.to_dict()
    return None


def upsert_user_profile(
    uid: str,
    username: str,
    email: str,
    profile_pic: str = "",
    plan: str = "Free Plan",
) -> None:
    """Create or update user profile in Firestore (NoSQL)."""
    db = _get_firestore()
    if not db:
        return
    db.collection("users").document(uid).set(
        {
            "username": username,
            "email": email,
            "profile_pic": profile_pic,
            "plan": plan,
        },
        merge=True,
    )


def update_user_profile(uid: str, updates: dict[str, Any]) -> None:
    """Partial update of user profile in Firestore (merge)."""
    db = _get_firestore()
    if not db or not updates:
        return
    db.collection("users").document(uid).set(updates, merge=True)
