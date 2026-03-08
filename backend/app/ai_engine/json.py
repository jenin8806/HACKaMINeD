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

USER_PROMPT = """
Decompose this story into a vertical episodic series.

STORY:
After the death of He Who Remains, the stability of time begins collapsing. Loki suddenly starts time-slipping, uncontrollably jumping between the past and future of the TVA. The once-ordered agency that pruned timelines is now in chaos as the multiverse rapidly expands.

With the help of Mobius M. Mobius, Loki searches for answers. They meet Ouroboros (OB), the eccentric engineer responsible for the TVA’s technology. OB discovers that Loki’s time-slipping is linked to instability in the Temporal Loom, the machine that weaves and stabilizes branching timelines. The Loom is reaching catastrophic overload because infinite new timelines are forming after the TVA stopped pruning them.

Meanwhile, former TVA hunter Sylvie is hiding in a branched timeline, trying to live a normal life after centuries of running. Loki seeks her help, but Sylvie refuses to restore the TVA’s old system. She believes every timeline represents real lives that deserve to exist. This creates a deep conflict between Loki’s desire for order and Sylvie’s belief in freedom.

The TVA discovers a new variant of the man who once controlled time: Victor Timely, an inventor living in 1893 Chicago. Loki and Mobius bring him to the TVA, hoping his genius can help upgrade the Temporal Loom and prevent multiversal collapse. However, distrust grows within the group. Victor is a harmless scientist now, but he could evolve into a dangerous conqueror like other variants.

As the Loom overloads, Victor attempts to repair it by entering a chamber filled with lethal temporal radiation. The plan fails catastrophically. The radiation instantly disintegrates him, and the Loom collapses. The TVA and countless timelines begin to unravel.

Loki finds himself drifting through collapsing realities. As timelines disappear, he encounters alternate lives of his friends. Mobius is a quiet jet ski salesman, B-15 is a doctor, and others live ordinary lives without knowledge of the TVA. Watching these lives vanish makes Loki realize the stakes are not abstract timelines but real people.

During this crisis, Loki’s time-slipping evolves into a powerful new ability: he can control when he moves through time. Using this power, he repeatedly travels back to the moment before the Loom’s destruction, trying to change the outcome. After countless attempts across centuries of trial and error, he learns the truth.

The Temporal Loom was never meant to preserve every timeline. It was designed to destroy excess branches, ensuring only a single timeline survived. The system itself was a form of control created by He Who Remains to prevent a multiversal war between his variants.

Loki refuses to accept that solution.

Instead of allowing the Loom to destroy infinite lives, he destroys the machine entirely and gathers the dying timelines using his own growing power over time. He binds them together into a vast branching structure resembling Yggdrasil, the mythical world tree.

Loki takes his place at its center, holding the infinite timelines together.

In doing so, he fulfills the purpose he once chased selfishly: a throne.

But this throne is not about ruling.

It is about sacrifice.

Loki becomes the guardian of the multiverse, alone at the center of time, ensuring that every timeline and every life has the freedom to exist.

Return JSON in this format:

{
  "episodes": [
    {
      "episode_number": 1,
      "title": "",
      "segments": {
        "hook_0_15s": "",
        "conflict_15_45s": "",
        "midpoint_twist_45_60s": "",
        "escalation_60_75s": "",
        "cliffhanger_75_90s": ""
      },
      "cliffhanger_type": "",
      "emotion_arc": {
        "start": "",
        "mid": "",
        "end": ""
      },
      "improvement_suggestion": ""
    }
  ]
}
"""

def call_llm(system_prompt, user_prompt):
    """Call LLM API and return parsed JSON"""

    payload = {
        "system_prompt": system_prompt,
        "message": user_prompt
    }

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
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


def validate_json(text):
    """Ensure output is valid JSON"""

    try:
        parsed = json.loads(text)
        return parsed
    except json.JSONDecodeError:
        print("⚠ Invalid JSON returned by model")
        return {"raw_output": text}


def main():
    print("🚀 Generating episodic analysis...\n")

    result = call_llm(SYSTEM_PROMPT, USER_PROMPT)

    if result:
        print(json.dumps(result, indent=2))
    else:
        print("❌ Failed to generate response")


if __name__ == "__main__":
    main()