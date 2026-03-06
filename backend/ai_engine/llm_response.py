import requests
import json

API_URL = "https://gpt-4-api-free.vercel.app/api/chat"
API_KEY = "gpt4-iT3LPjJfwdcm9uCus90pfRD1MF4G7R6SnXe5p5bAXKs"

SYSTEM_PROMPT = """
You are VBOX Narrative Intelligence Engine.

Your job is NOT to summarize stories.

Your job is to design high-retention vertical episodic storytelling optimized for binge watching.

Each episode is exactly 90 seconds and follows a strict tension curve.

Your responsibilities:

1. Decide the optimal number of episodes (4–8) based on story complexity.
2. Design each episode with a rising tension arc.
3. Ensure every episode ends with a strong cliffhanger.
4. Ensure each episode increases the urgency of the story.
5. Avoid resolving major mysteries before episode endings.

Narrative design rules:

Every episode must follow this pacing pattern:

HOOK → BUILD → TWIST → ESCALATION → CLIFFHANGER SPIKE

Tension guidelines:

• Tension should increase across the episode.
• The cliffhanger must be the highest tension moment.
• Episodes must end with unanswered questions.
• Avoid explanation-heavy segments.

Cliffhangers should create curiosity using:
- secrets
- revelations
- threats
- betrayals
- countdowns
- new information

Strong cliffhangers often contain mystery signals such as:
"who", "why", "truth", "secret", "hidden", "unknown".

Return ONLY valid JSON.
Do not include explanations or markdown.
"""

USER_PROMPT_TEMPLATE = """
Decompose this story into a vertical episodic series.

STORY:
{story}

Return JSON in this format:

{{
  "episodes": [
    {{
      "episode_number": 1,
      "title": "",
      "segments": {{
        "hook_0_15s": "",
        "conflict_15_45s": "",
        "midpoint_twist_45_60s": "",
        "escalation_60_75s": "",
        "cliffhanger_75_90s": ""
      }},
      "cliffhanger_type": "",
      "emotion_arc": {{
        "start": "",
        "mid": "",
        "end": ""
      }},
      "improvements": {{
        "what": "The single most impactful change to make to this episode (one sentence)",
        "why": "Exactly why this change will increase audience retention (one sentence)",
        "script_fix": "Rewrite the weakest segment of this episode with the improvement applied (2-3 sentences)"
      }}
    }}
  ]
}}
"""

# ─── Apply-changes prompt ─────────────────────────────────────────────────────

APPLY_SYSTEM_PROMPT = """
You are VBOX Script Revision Engine.

You receive episodes with their current segment scripts and improvement suggestions.

Your job:
1. Apply every improvement suggestion listed under "improvements" to the relevant segment.
2. Rewrite each full episode's segments so they are stronger, more tension-filled, and higher-retention.
3. Keep the same 5-segment structure per episode.
4. Keep titles and episode numbers unchanged.

Return ONLY valid JSON. No explanations. No markdown.
"""

APPLY_PROMPT_TEMPLATE = """
Apply all improvements to the following episodes and return fully revised scripts.

Current episodes (JSON):
{episodes_json}

Return JSON in this exact format — same episode_number and title, revised segments:

{{
  "episodes": [
    {{
      "episode_number": 1,
      "title": "",
      "segments": {{
        "hook_0_15s": "",
        "conflict_15_45s": "",
        "midpoint_twist_45_60s": "",
        "escalation_60_75s": "",
        "cliffhanger_75_90s": ""
      }},
      "cliffhanger_type": "",
      "emotion_arc": {{
        "start": "",
        "mid": "",
        "end": ""
      }},
      "improvements": {{
        "what": "Applied: brief summary of what was changed",
        "why": "Retention improvement: why the rewrite is stronger",
        "script_fix": ""
      }}
    }}
  ]
}}
"""

# ─── General chat prompt ──────────────────────────────────────────────────────

CHAT_SYSTEM_PROMPT = """
You are VBOX Narrative AI Assistant.

You help creators improve their vertical episodic scripts for maximum audience retention.

When given episode analysis context, answer questions clearly and specifically.
Keep responses concise (3-5 sentences max unless detail is needed).
Be direct — no filler phrases.
"""


def call_llm(story: str) -> dict | None:
    """Call LLM API with the user's story and return parsed JSON."""

    user_prompt = USER_PROMPT_TEMPLATE.format(story=story)

    payload = {
        "system_prompt": SYSTEM_PROMPT,
        "message": user_prompt,
    }

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        response.raise_for_status()

        data = response.json()

        # If API wraps response
        if "response" in data:
            text = data["response"]
        else:
            text = json.dumps(data)

        return validate_json(text)

    except requests.exceptions.RequestException as e:
        print("API request failed:", e)
        return None


def validate_json(text: str) -> dict:
    """Ensure output is valid JSON."""

    try:
        parsed = json.loads(text)
        return parsed
    except json.JSONDecodeError:
        print("Invalid JSON returned by model")
        return {"raw_output": text}


def call_llm_apply_changes(episodes: list) -> dict | None:
    """Apply improvement suggestions to episodes and return revised scripts."""

    compact = []
    for ep in episodes:
        compact.append({
            "episode_number": ep.get("episode_number", ep.get("episodeNumber", 1)),
            "title": ep.get("title", ""),
            "segments": ep.get("segments", {}),
            "cliffhanger_type": ep.get("cliffhanger_type", ep.get("cliffhangerType", "")),
            "emotion_arc": ep.get("emotion_arc", ep.get("emotionArc", {})),
            "improvements": ep.get("improvements", {}),
        })

    episodes_json = json.dumps(compact, indent=2)
    user_prompt = APPLY_PROMPT_TEMPLATE.format(episodes_json=episodes_json)

    payload = {"system_prompt": APPLY_SYSTEM_PROMPT, "message": user_prompt}
    headers = {"Content-Type": "application/json", "X-API-Key": API_KEY}

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=180)
        response.raise_for_status()
        data = response.json()
        text = data.get("response", json.dumps(data))
        return validate_json(text)
    except requests.exceptions.RequestException as e:
        print("Apply-changes API request failed:", e)
        return None


def call_llm_chat(user_message: str, episodes_context: list) -> str | None:
    """Answer a follow-up question about the analyzed episodes."""

    if episodes_context:
        slim = []
        for ep in episodes_context:
            slim.append({
                "episode_number": ep.get("episode_number", ep.get("episodeNumber", 1)),
                "title": ep.get("title", ""),
                "cliffhanger_type": ep.get("cliffhanger_type", ep.get("cliffhangerType", "")),
                "improvements": ep.get("improvements", {}),
                "segments": ep.get("segments", {}),
            })
        context_str = json.dumps(slim, indent=2)
    else:
        context_str = "No episode context available."

    user_prompt = f"Episode Analysis Context:\n{context_str}\n\nUser Question:\n{user_message}"
    payload = {"system_prompt": CHAT_SYSTEM_PROMPT, "message": user_prompt}
    headers = {"Content-Type": "application/json", "X-API-Key": API_KEY}

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        return data.get("response", str(data))
    except requests.exceptions.RequestException as e:
        print("Chat API request failed:", e)
        return None
