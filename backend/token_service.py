"""
Token estimation service.

IMPORTANT – tokenizer note
--------------------------
tiktoken (o200k_base) is the *native* tokenizer for OpenAI GPT models.
For Gemini and Claude models we re-use o200k_base as a practical
**approximation only**. The real count from the provider may differ by
±5-15 % depending on text structure, whitespace, and special tokens.
Always validate against the usage object returned by the provider API.
"""

from __future__ import annotations

from datetime import date
from functools import lru_cache
from typing import Any

import tiktoken


# ---------------------------------------------------------------------------
# Model catalogue
# All prices in USD per 1 000 000 tokens (as published by each provider).
# last_updated: date when the table was last reviewed.
# tokenizer: which tokenizer is actually used for counting here.
# tokenizer_note: human-readable caveat about approximation accuracy.
# ---------------------------------------------------------------------------
MODEL_CATALOGUE: dict[str, dict[str, Any]] = {
    # ── OpenAI ───────────────────────────────────────────────
    "gpt-6-astra": {
        "name": "GPT-6 Astra",
        "provider": "OpenAI",
        "input_price": 10.00,
        "output_price": 50.00,
        "context_window": 1_050_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2026, 10, 3),
    },
    "gpt-5.6-sol": {
        "name": "GPT-5.6 Sol",
        "provider": "OpenAI",
        "input_price": 4.00,
        "output_price": 20.00,
        "context_window": 1_050_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2026, 10, 5),
    },
    "gpt-5.6-luna": {
        "name": "GPT-5.6 Luna",
        "provider": "OpenAI",
        "input_price": 0.20,
        "output_price": 1.20,
        "context_window": 1_050_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2026, 10, 5),
    },
    "gpt-5": {
        "name": "GPT-5",
        "provider": "OpenAI",
        "input_price": 1.25,
        "output_price": 10.00,
        "context_window": 400_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2025, 5, 16),
    },
    "gpt-4o": {
        "name": "GPT-4o",
        "provider": "OpenAI",
        "input_price": 2.50,
        "output_price": 10.00,
        "context_window": 128_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2026, 10, 3),
    },
    "gpt-4o-mini": {
        "name": "GPT-4o Mini",
        "provider": "OpenAI",
        "input_price": 0.15,
        "output_price": 0.60,
        "context_window": 128_000,
        "tokenizer": "o200k_base",
        "tokenizer_note": "Native tokenizer for raw text; API framing tokens are not included.",
        "last_updated": date(2024, 7, 18),
    },
    # ── Google ───────────────────────────────────────────────
    "gemini-3.8-flash": {
        "name": "Gemini 3.8 Flash",
        "provider": "Google",
        "input_price": 0.75,
        "output_price": 3.75,
        "context_window": 1_048_576,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Gemini. "
            "Google uses SentencePiece; counts may differ by ±5–15 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "gemini-3.1-pro": {
        "name": "Gemini 3.1 Pro",
        "provider": "Google",
        "input_price": 2.00,
        "output_price": 12.00,
        "context_window": 1_048_576,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Gemini. "
            "Google uses SentencePiece; counts may differ by ±5–15 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "gemini-2.5-flash": {
        "name": "Gemini 2.5 Flash",
        "provider": "Google",
        "input_price": 0.30,
        "output_price": 2.50,
        "context_window": 1_048_576,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Gemini. "
            "Google uses SentencePiece; counts may differ by ±5–15 %."
        ),
        "last_updated": date(2025, 5, 20),
    },
    "gemini-2.5-flash-lite": {
        "name": "Gemini 2.5 Flash-Lite",
        "provider": "Google",
        "input_price": 0.10,
        "output_price": 0.40,
        "context_window": 1_048_576,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Gemini. "
            "Google uses SentencePiece; counts may differ by ±5–15 %."
        ),
        "last_updated": date(2025, 7, 22),
    },
    "gemini-2.5-pro": {
        "name": "Gemini 2.5 Pro",
        "provider": "Google",
        "input_price": 1.25,
        "output_price": 10.00,
        "context_window": 1_048_576,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Gemini. "
            "Google uses SentencePiece; counts may differ by ±5–15 %."
        ),
        "last_updated": date(2025, 5, 20),
    },
    # ── Anthropic ────────────────────────────────────────────
    "claude-fable-5-1": {
        "name": "Claude Fable 5.1",
        "provider": "Anthropic",
        "input_price": 10.00,
        "output_price": 50.00,
        "context_window": 1_000_000,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Claude. "
            "Anthropic uses a proprietary BPE tokenizer; counts may differ by ±5–10 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "claude-opus-5-5": {
        "name": "Claude Opus 5.5",
        "provider": "Anthropic",
        "input_price": 4.00,
        "output_price": 20.00,
        "context_window": 1_000_000,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Claude. "
            "Anthropic uses a proprietary BPE tokenizer; counts may differ by ±5–10 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "claude-sonnet-5-5": {
        "name": "Claude Sonnet 5.5",
        "provider": "Anthropic",
        "input_price": 2.00,
        "output_price": 10.00,
        "context_window": 1_000_000,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Claude. "
            "Anthropic uses a proprietary BPE tokenizer; counts may differ by ±5–10 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "claude-haiku-4-5": {
        "name": "Claude Haiku 4.5",
        "provider": "Anthropic",
        "input_price": 1.00,
        "output_price": 5.00,
        "context_window": 200_000,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Claude. "
            "Anthropic uses a proprietary BPE tokenizer; counts may differ by ±5–10 %."
        ),
        "last_updated": date(2026, 10, 3),
    },
    "claude-sonnet-4-5": {
        "name": "Claude Sonnet 4.5",
        "provider": "Anthropic",
        "input_price": 3.00,
        "output_price": 15.00,
        "context_window": 200_000,
        "tokenizer": "o200k_base (approx)",
        "tokenizer_note": (
            "tiktoken is an approximation for Claude. "
            "Anthropic uses a proprietary BPE tokenizer; counts may differ by ±5–10 %."
        ),
        "last_updated": date(2025, 7, 22),
    },
}


@lru_cache(maxsize=1)
def _encoding() -> tiktoken.Encoding:
    return tiktoken.get_encoding("o200k_base")


def list_models() -> list[dict[str, Any]]:
    """Return public model metadata (no pricing internals leaked)."""
    result = []
    for model_id, m in MODEL_CATALOGUE.items():
        result.append(
            {
                "id": model_id,
                "name": m["name"],
                "provider": m["provider"],
                "input_price_per_1m": m["input_price"],
                "output_price_per_1m": m["output_price"],
                "context_window": m["context_window"],
                "tokenizer": m["tokenizer"],
                "tokenizer_note": m["tokenizer_note"],
                "last_updated": m["last_updated"].isoformat(),
            }
        )
    return result


def estimate_tokens(
    prompt: str,
    model_id: str,
    system_prompt: str = "",
    conversation_history: str = "",
    expected_output_tokens: int = 512,
) -> dict[str, int | float | str]:
    model = MODEL_CATALOGUE.get(model_id)
    if model is None:
        raise ValueError(
            f"Unsupported model: '{model_id}'. "
            f"Valid ids: {list(MODEL_CATALOGUE)}"
        )

    enc = _encoding()

    # Count each part separately so the UI can show a breakdown
    system_tokens = len(enc.encode(system_prompt)) if system_prompt else 0
    prompt_tokens = len(enc.encode(prompt)) if prompt else 0
    context_tokens = len(enc.encode(conversation_history)) if conversation_history else 0

    # Total input = everything sent to the model
    input_tokens = system_tokens + prompt_tokens + context_tokens
    total_tokens = input_tokens + expected_output_tokens

    input_cost = input_tokens * model["input_price"] / 1_000_000
    output_cost = expected_output_tokens * model["output_price"] / 1_000_000
    total_cost = input_cost + output_cost

    context_percent = min(total_tokens / model["context_window"] * 100, 100)

    return {
        "input_tokens": input_tokens,
        "system_tokens": system_tokens,
        "prompt_tokens": prompt_tokens,
        "context_tokens": context_tokens,
        "output_tokens": expected_output_tokens,
        "total_tokens": total_tokens,
        "input_cost": input_cost,
        "output_cost": output_cost,
        "cost": total_cost,
        "model_name": model["name"],
        "provider": model["provider"],
        "context_window": model["context_window"],
        "context_percent": context_percent,
        "tokenizer": model["tokenizer"],
        "tokenizer_note": model["tokenizer_note"],
        "input_price_per_1m": model["input_price"],
        "output_price_per_1m": model["output_price"],
        "last_updated": model["last_updated"].isoformat(),
    }
