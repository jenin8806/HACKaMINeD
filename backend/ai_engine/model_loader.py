"""
model_loader.py — Load ML artifacts once at startup and share globally.

Artifacts loaded:
  - retention_model.pkl  (RandomForestRegressor via joblib)
  - feature_scaler.pkl   (StandardScaler via joblib)
  - tokenizer.json       (HuggingFace tokenizers.Tokenizer)
"""
import os
import warnings
import joblib
from tokenizers import Tokenizer

# Suppress version mismatch warnings from sklearn pickle
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

_MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

retention_model = None
feature_scaler = None
tokenizer = None


def load_models():
    """Load all ML artifacts into module-level globals. Call once at startup."""
    global retention_model, feature_scaler, tokenizer

    model_path = os.path.join(_MODELS_DIR, "retention_model.pkl")
    scaler_path = os.path.join(_MODELS_DIR, "feature_scaler.pkl")
    tokenizer_path = os.path.join(_MODELS_DIR, "tokenizer.json")

    try:
        retention_model = joblib.load(model_path)
        print(f"[model_loader] retention_model loaded ({type(retention_model).__name__})")
    except Exception as e:
        print(f"[model_loader] WARNING: Could not load retention_model: {e}")
        retention_model = None

    try:
        feature_scaler = joblib.load(scaler_path)
        print(f"[model_loader] feature_scaler loaded ({type(feature_scaler).__name__})")
    except Exception as e:
        print(f"[model_loader] WARNING: Could not load feature_scaler: {e}")
        feature_scaler = None

    try:
        tokenizer = Tokenizer.from_file(tokenizer_path)
        print("[model_loader] tokenizer loaded")
    except Exception as e:
        print(f"[model_loader] WARNING: Could not load tokenizer: {e}")
        tokenizer = None
