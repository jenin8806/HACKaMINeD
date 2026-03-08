<div align="center">

<br/>

<img src="https://capsule-render.vercel.app/api?type=rect&color=010305&height=120&text=THEVBOX&fontAlign=50&fontAlignY=60&fontSize=72&fontColor=ffffff&desc=AI%20Episodic%20Intelligence&descAlign=50&descAlignY=82&descFontColor=C7F711&descFontSize=18&stroke=C7F711&strokeWidth=1" width="900" alt="TheVbox" />

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=28&pause=1000&color=C7F711&center=true&vCenter=true&width=600&lines=Turn+Stories+Into+Episodes;Score+Every+Cliffhanger;Engineer+Retention" alt="Typing SVG" />

<p align="center">
  <strong style="color:#C7F711">TheVbox</strong>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ◈  SCRIPT INTELLIGENCE   ◈  CLIFFHANGER SCORING
  ◈  EMOTION CURVE ANALYSIS ◈  ITERATIVE RE-SCORING
  ◈  AUTO SEGMENTATION      ◈  AI OPTIMIZATION ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</div>

---

## 🚀 Quick Start (Windows)

**Easiest way to run on localhost:**

1. Make sure you have Python 3.9+ and Node.js 18+ installed
2. Double-click `start.ps1` in the root directory

That's it! Two windows will open:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

**Or run manually:**
```powershell
# Terminal 1 - Backend
cd backend
.\start.ps1

# Terminal 2 - Frontend  
cd frontend
.\start.ps1
```

📖 **Detailed setup guide:** See [LOCALHOST_SETUP.md](LOCALHOST_SETUP.md)

---

## ◈ What is TheVbox?

**TheVbox** is a next-generation AI storytelling platform built for creators, directors, and writers who want to engineer binge-worthy content — not just write it.

Upload your raw script. TheVbox breaks it into precision-designed episodes, scores every cliffhanger, maps your emotion curve, and gives you actionable AI suggestions. Apply them, and every metric regenerates instantly — so you can iterate until your story is unstoppable.

> *"We don't summarize stories. We engineer retention."*

---

## ◈ Core Features

<table>
<tr>
<td width="50%">

### 🧠 Script Intelligence
Deep AI analysis of narrative structure, character arcs, and story beats — understanding your story the way a seasoned showrunner would.

</td>
<td width="50%">

### ✂️ Auto-Episodic Segmentation
Automatically identify perfect break points, pacing rhythms, and episodic structure from any raw script or manuscript.

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Cliffhanger Scoring
Data-driven scores (0–100) for every episode ending, quantifying engagement potential and viewer retention probability.

</td>
<td width="50%">

### 💛 Emotion Curve Analysis
Visualize your story's emotional journey across episodes. Spot flat arcs, over-dense trauma clusters, and missing cathartic beats instantly.

</td>
</tr>
<tr>
<td width="50%">

### 💡 AI Optimization Engine
Scene-level recommendations: sharpen the cold open, move a reveal earlier, add micro-tension beats — each ranked by predicted audience-impact score.

</td>
<td width="50%">

### 🔄 Iterative Re-Scoring
Apply AI-suggested edits and instantly regenerate all metrics. Compare before-and-after snapshots and refine until your scores match your vision.

</td>
</tr>
</table>

---

## ◈ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 18 · TypeScript · Vite · TailwindCSS                 │
│  Framer Motion · Radix UI · Recharts · React Router         │
│  Firebase Auth (client SDK)                                 │
├─────────────────────────────────────────────────────────────┤
│                         BACKEND                             │
│  Python · FastAPI · Uvicorn                                 │
│  Firebase Admin SDK · Google Cloud Firestore                │
│  scikit-learn · Hugging Face Tokenizers · OpenAI SDK        │
├─────────────────────────────────────────────────────────────┤
│                       INFRA / AUTH                          │
│  Firebase Authentication (Email/Password + Google OAuth)    │
│  Firestore NoSQL — users collection (UID as document ID)    │
│  Firebase Hosting (optional)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ◈ Project Structure

```
HACKaMINeD/
├── 📁 backend/
│   ├── main.py                    # FastAPI app — all routes
│   ├── requirements.txt
│   ├── firebase-service-account.json  # ⚠️ gitignored — required
│   ├── app/
│   │   ├── auth.py                # Firebase token verification
│   │   ├── db.py                  # Firestore CRUD helpers
│   │   └── firebase_init.py       # Admin SDK initialization
│   ├── ai_engine/
│   │   ├── llm_response.py        # LLM prompt templates + API calls
│   │   ├── analytics_engine.py    # Retention & emotion scoring
│   │   ├── nlp_processor.py       # NLP utilities
│   │   └── model_loader.py        # ML model loading
│   └── models/
│       └── tokenizer.json         # Local tokenizer config
│
└── 📁 frontend/
    ├── index.html
    ├── vite.config.ts
    └── src/
        └── app/
            ├── App.tsx
            ├── firebase.ts
            ├── components/
            │   ├── Dashboard.tsx      # Main AI workspace
            │   ├── ProjectDetail.tsx  # Per-project analytics
            │   ├── LandingPage.tsx
            │   ├── Hero.tsx
            │   ├── Features.tsx
            │   ├── HowItWorks.tsx
            │   ├── Pricing.tsx
            │   └── ...
            ├── contexts/
            │   └── UserContext.tsx
            └── services/
                └── projectsService.ts
```

---

## ◈ Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| Python | ≥ 3.11 |
| Firebase project | (with Auth + Firestore enabled) |

---

### 1 — Clone

```bash
git clone https://github.com/your-username/thevbox.git
cd thevbox/HACKaMINeD
```

---

### 2 — Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

**Create a `.env` file in `backend/`:**

```env
LLM_API_URL=https://your-llm-endpoint/api/chat
LLM_API_KEY=your_llm_api_key
```

**Add your Firebase service account:**
- Firebase Console → Project Settings → Service Accounts → Generate new private key
- Save as `backend/firebase-service-account.json`

**Run the backend:**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> API: `http://localhost:8000`
> Docs: `http://localhost:8000/docs`

---

### 3 — Frontend Setup

```bash
cd frontend
npm install
```

**Create a `.env` file in `frontend/`:**

```env
VITE_API_URL=http://localhost:8000/api/auth
```

> **Note:** Firebase config is already set in `src/app/firebase.ts`. For production, update that file or use environment variables.

**Run the frontend:**

```bash
npm run dev
```

> App: `http://localhost:5173`

---

### 4 — Quick Start Scripts (Windows)

We've included PowerShell scripts for easy startup:

```powershell
# Start both backend and frontend
.\start.ps1

# Or individually:
cd backend
.\start.ps1

cd frontend
.\start.ps1
```

---

## ◈ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Fetch current user profile from Firestore |
| `POST` | `/api/auth/signup` | Create / update user profile in Firestore |
| `PATCH` | `/api/auth/profile` | Update username, email, or profile pic |
| `POST` | `/api/analyze` | Analyze a story → episodic breakdown + analytics |
| `POST` | `/api/chat` | Chat with AI or **apply changes to re-score** |
| `GET` | `/health` | Health check |

> All routes (except `/health`) require a Firebase ID token as `Authorization: Bearer <token>`.

---

## ◈ How It Works

```
  [ Upload Script ]
        │
        ▼
  [ AI Segments the Story ]          ← LLM decomposes into 4–8 episodes
        │
        ▼
  [ Cliffhanger Score Generated ]    ← tension, stakes, unresolved hooks
        │
        ▼
  [ Emotion Curve Analysis ]         ← per-scene sentiment + affect mapping
        │
        ▼
  [ AI Optimization Suggestions ]    ← ranked scene-level rewrites
        │
        ▼
  [ Iterative Re-Scoring ]           ← apply changes → regenerate all metrics
        │
        ▼
  [ Revised Canvas Created ]         ← original preserved, new version saved
```

---

## ◈ Firebase Setup Checklist

- [ ] Firebase project created
- [ ] **Authentication** → Email/Password enabled
- [ ] **Authentication** → Google Sign-In enabled
- [ ] **Firestore** → Database created (production or test mode)
- [ ] **Service account JSON** downloaded → saved to `backend/firebase-service-account.json`
- [ ] Frontend `.env` populated with Firebase config

---

## ◈ Pricing (INR)

| Plan | Price | Highlights |
|------|-------|------------|
| **Starter** | Free | 3 analyses/month · Episode segmentation · Basic cliffhanger scores |
| **Creator** | ₹499/mo | Unlimited analyses · Full analytics · Emotion curves · AI suggestions |
| **Studio** | ₹1,299/mo | Everything in Creator · 5-seat team · API access · Dedicated support |

---

## ◈ Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## ◈ License

This project is private and proprietary. All rights reserved.

---

<div align="center">

<br/>

```
Built with  ◈  by the TheVbox team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Stories deserve better structure.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

<img src="https://img.shields.io/badge/Status-Active%20Development-C7F711?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-0.0.1-314A52?style=for-the-badge" />

</div>
