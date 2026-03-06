"""
analytics_engine.py — Predict retention score for a single episode using
the pre-trained RandomForestRegressor + StandardScaler.

Variation across episodes is driven by two episode-aware factors on top of
the ML base prediction:
  1. Tension escalation  — later episodes carry higher tension (0.65 → 1.0 ramp)
  2. Cliffhanger signal  — count of mystery keywords in the cliffhanger text
     gives an additive quality bonus (0 → +0.18)
"""
import re
import ai_engine.model_loader as _ml
from ai_engine.nlp_processor import create_features

_MYSTERY_SIGNALS = [
    "who", "why", "truth", "secret", "hidden", "unknown", "what", "when",
    "how", "never", "always", "betrayal", "threat", "reveal", "discover",
    "never", "lied", "escape", "trap", "dead", "alive", "only",
]


def _cliffhanger_signal_strength(text: str) -> float:
    """Fraction of mystery signals present in the cliffhanger, capped at 1.0."""
    if not text:
        return 0.0
    text_lower = text.lower()
    hits = sum(1 for s in _MYSTERY_SIGNALS if re.search(rf"\b{s}\b", text_lower))
    return min(1.0, hits / 5.0)


def analyze_episode(episode: dict, episode_number: int = 1, total_episodes: int = 1) -> dict:
    """
    Predict the retention score for an episode.

    Args:
        episode:          Episode dict from the LLM response.
        episode_number:   1-based index of this episode.
        total_episodes:   Total number of episodes in the series.

    Returns:
        {"retention_score": float}  — value in [0, 1]
    """
    try:
        features = create_features(episode)

        if _ml.feature_scaler is not None:
            scaled = _ml.feature_scaler.transform([features])
        else:
            scaled = [features]

        if _ml.retention_model is not None:
            prediction = _ml.retention_model.predict(scaled)
            raw = float(prediction[0])
            # Normalise raw output to [0, 1]
            base_score = max(0.0, min(1.0, raw / 100.0)) if raw > 1.0 else max(0.0, min(1.0, raw))
        else:
            base_score = 0.0

        # ── Episode-position tension ramp (0.65 at ep1 → 1.0 at final ep) ──
        # Gives each episode a naturally escalating score — earlier episodes
        # have a lower baseline; the finale reaches maximum tension.
        if total_episodes > 1:
            position = (episode_number - 1) / (total_episodes - 1)  # 0.0 → 1.0
        else:
            position = 1.0
        tension_multiplier = 0.65 + position * 0.35

        # ── Cliffhanger signal bonus (0 → +0.18) ──
        cliffhanger_text = episode.get("segments", {}).get("cliffhanger_75_90s", "")
        signal_bonus = _cliffhanger_signal_strength(cliffhanger_text) * 0.18

        score = base_score * tension_multiplier + signal_bonus
        score = max(0.0, min(1.0, score))

        return {"retention_score": round(score, 4)}

    except Exception as e:
        print(f"[analytics_engine] ERROR during analysis: {e}")
        return {"retention_score": 0.0}
