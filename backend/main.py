"""
MINDed / HACKaMINeD backend — Python FastAPI + Firebase (Firestore NoSQL).
Auth: Google + Email/Password via Firebase Auth; backend verifies ID tokens and stores profiles in Firestore.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Firebase Admin is initialized in auth module
from app.auth import get_current_uid, verify_firebase_token
from app.db import get_user_profile, update_user_profile, upsert_user_profile


class SignupBody(BaseModel):
    username: str
    email: str


class ProfileUpdateBody(BaseModel):
    username: str | None = None
    email: str | None = None
    profile_pic: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init Firebase Admin if credentials available
    from app.firebase_init import init_firebase
    init_firebase()
    yield
    # Shutdown: nothing to do
    pass


app = FastAPI(
    title="MINDed API",
    description="Backend for MINDed — Firebase Auth (Google + Email/Password) + Firestore",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/auth/me")
async def auth_me(uid: str = Depends(get_current_uid)):
    """Return current user profile from Firestore (or minimal from token)."""
    profile = get_user_profile(uid)
    if profile:
        return {
            "username": profile.get("username", ""),
            "email": profile.get("email", ""),
            "profile_pic": profile.get("profile_pic", ""),
            "plan": profile.get("plan", "Free Plan"),
        }
    # No Firestore doc yet (e.g. Google sign-in first time) — return minimal
    return {
        "username": "",
        "email": "",
        "profile_pic": "",
        "plan": "Free Plan",
    }


@app.post("/api/auth/signup")
async def auth_signup(body: SignupBody, uid: str = Depends(get_current_uid)):
    """Create or update user profile in Firestore (NoSQL). Called after Firebase Auth signup."""
    upsert_user_profile(
        uid=uid,
        username=body.username,
        email=body.email,
        profile_pic="",
        plan="Free Plan",
    )
    return {"ok": True}


@app.patch("/api/auth/profile")
async def auth_profile_update(body: ProfileUpdateBody, uid: str = Depends(get_current_uid)):
    """Update user profile in Firestore (username, email, profile_pic)."""
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if not updates:
        return {"ok": True}
    update_user_profile(uid, updates)
    return {"ok": True}


@app.get("/health")
async def health():
    return {"status": "ok"}
