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
      "improvement_suggestion": ""
    }}
  ]
}}
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
