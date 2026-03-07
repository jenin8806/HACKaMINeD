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
from ai_engine.llm_response import call_llm, call_llm_apply_changes, call_llm_chat
from ai_engine.model_loader import load_models
from ai_engine.analytics_engine import analyze_episode
from typing import Any


class SignupBody(BaseModel):
    username: str
    email: str


class AnalyzeBody(BaseModel):
    story: str


class ChatBody(BaseModel):
    message: str
    canvas_episodes: list[Any] | None = None
    apply_changes: bool = False


class ProfileUpdateBody(BaseModel):
    username: str | None = None
    email: str | None = None
    profile_pic: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init Firebase Admin if credentials available
    from app.firebase_init import init_firebase
    init_firebase()
    load_models()
    yield
    # Shutdown: nothing to do
    pass


app = FastAPI(
    title="MINDed API",
    description="Backend for MINDed — Firebase Auth (Google + Email/Password) + Firestore",
    lifespan=lifespan,
)

# Production-ready CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    # Development origins (always included)
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Remove duplicates and filter empty strings
ALLOWED_ORIGINS = list(set([origin for origin in ALLOWED_ORIGINS if origin]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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


@app.post("/api/analyze")
async def analyze_story(body: AnalyzeBody, uid: str = Depends(get_current_uid)):
    """Send user story to LLM and return episodic breakdown with retention analytics."""
    if not body.story.strip():
        raise HTTPException(status_code=400, detail="Story text is required.")

    result = call_llm(body.story)
    if result is None:
        raise HTTPException(status_code=502, detail="LLM service unavailable.")

    # Attach NLP + ML analytics to each episode
    episodes = result.get("episodes", [])
    total = len(episodes)
    for episode in episodes:
        ep_num = episode.get("episode_number", 1)
        episode["analytics"] = analyze_episode(episode, ep_num, total)

    return result


@app.post("/api/chat")
async def chat_message(body: ChatBody, uid: str = Depends(get_current_uid)):
    """Handle follow-up chat: apply improvement changes or answer a question."""
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    if body.apply_changes:
        if not body.canvas_episodes:
            raise HTTPException(status_code=400, detail="canvas_episodes required for apply_changes.")
        result = call_llm_apply_changes(body.canvas_episodes)
        if result is None:
            raise HTTPException(status_code=502, detail="LLM service unavailable.")
        episodes = result.get("episodes", [])
        total = len(episodes)
        for episode in episodes:
            ep_num = episode.get("episode_number", 1)
            episode["analytics"] = analyze_episode(episode, ep_num, total)
        return {"type": "revision", "episodes": episodes}

    reply = call_llm_chat(body.message, body.canvas_episodes or [])
    if reply is None:
        raise HTTPException(status_code=502, detail="LLM service unavailable.")
    return {"type": "message", "content": reply}


@app.get("/health")
async def health():
    return {"status": "ok"}
