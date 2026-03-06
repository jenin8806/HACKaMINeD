"""
nlp_processor.py — Extract text and build feature vectors from episode data.

Feature vector (10 values, matching retention_model.pkl training schema):
  0  token_count          — total tokens from tokenizer
  1  text_length          — total character length of combined text
  2  sentence_count       — approximate sentence count (split on '.!?')
  3  cliffhanger_length   — char length of cliffhanger_75_90s segment
  4  hook_length          — char length of hook_0_15s segment
  5  conflict_length      — char length of conflict_15_45s segment
  6  twist_length         — char length of midpoint_twist_45_60s segment
  7  escalation_length    — char length of escalation_60_75s segment
  8  avg_segment_length   — mean char length across all 5 segments
  9  unique_token_ratio   — unique tokens / total tokens (lexical diversity)
"""
import re
import ai_engine.model_loader as _ml


def extract_text(episode: dict) -> str:
    """Combine all segment texts from an episode into one string."""
    segments = episode.get("segments", {})
    parts = [
        segments.get("hook_0_15s", ""),
        segments.get("conflict_15_45s", ""),
        segments.get("midpoint_twist_45_60s", ""),
        segments.get("escalation_60_75s", ""),
        segments.get("cliffhanger_75_90s", ""),
    ]
    return " ".join(p for p in parts if p)


def create_features(episode: dict) -> list[float]:
    """
    Build a 10-element feature vector for the retention model.
    Returns safe zero-filled defaults if tokenization fails.
    """
    segments = episode.get("segments", {})
    hook_text = segments.get("hook_0_15s", "")
    conflict_text = segments.get("conflict_15_45s", "")
    twist_text = segments.get("midpoint_twist_45_60s", "")
    escalation_text = segments.get("escalation_60_75s", "")
    cliffhanger_text = segments.get("cliffhanger_75_90s", "")

    full_text = extract_text(episode)

    # Segment lengths
    hook_length = len(hook_text)
    conflict_length = len(conflict_text)
    twist_length = len(twist_text)
    escalation_length = len(escalation_text)
    cliffhanger_length = len(cliffhanger_text)

    segment_lengths = [hook_length, conflict_length, twist_length, escalation_length, cliffhanger_length]
    avg_segment_length = sum(segment_lengths) / len(segment_lengths) if segment_lengths else 0.0

    text_length = len(full_text)
    sentence_count = max(1, len(re.split(r"[.!?]+", full_text)))

    # Tokenization
    token_count = 0
    unique_token_ratio = 0.0
    try:
        if _ml.tokenizer is not None and full_text.strip():
            encoding = _ml.tokenizer.encode(full_text)
            ids = encoding.ids
            token_count = len(ids)
            unique_token_ratio = len(set(ids)) / token_count if token_count > 0 else 0.0
        else:
            # Fallback: whitespace token count
            tokens = full_text.split()
            token_count = len(tokens)
            unique_token_ratio = len(set(tokens)) / token_count if token_count > 0 else 0.0
    except Exception:
        tokens = full_text.split()
        token_count = len(tokens)
        unique_token_ratio = len(set(tokens)) / token_count if token_count > 0 else 0.0

    return [
        float(token_count),        # 0
        float(text_length),        # 1
        float(sentence_count),     # 2
        float(cliffhanger_length), # 3
        float(hook_length),        # 4
        float(conflict_length),    # 5
        float(twist_length),       # 6
        float(escalation_length),  # 7
        float(avg_segment_length), # 8
        float(unique_token_ratio), # 9
    ]
