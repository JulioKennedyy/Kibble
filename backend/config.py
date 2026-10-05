"""Environment-backed runtime settings for the Kibble API."""

from __future__ import annotations

import os


LOCAL_ORIGINS = ("http://localhost:5173", "http://127.0.0.1:5173")


def _positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        value = int(raw_value)
    except ValueError:
        return default
    return value if value > 0 else default


def _normalise_origin(origin: str) -> str:
    origin = origin.strip().rstrip("/")
    if not origin:
        return ""
    if "://" not in origin:
        scheme = "http" if origin.startswith(("localhost", "127.0.0.1")) else "https"
        origin = f"{scheme}://{origin}"
    return origin


def allowed_origins() -> list[str]:
    """Return the comma-separated production origins or local defaults."""
    raw_value = os.getenv("KIBBLE_CORS_ORIGINS", "")
    configured = [_normalise_origin(item) for item in raw_value.split(",")]
    configured = [item for item in configured if item]
    return list(dict.fromkeys([*LOCAL_ORIGINS, *configured]))


MAX_TOTAL_INPUT_CHARS = _positive_int("KIBBLE_MAX_TOTAL_INPUT_CHARS", 500_000)
MAX_REQUEST_BODY_BYTES = _positive_int("KIBBLE_MAX_REQUEST_BODY_BYTES", 2_100_000)
RATE_LIMIT_PER_MINUTE = _positive_int("KIBBLE_RATE_LIMIT_PER_MINUTE", 120)
