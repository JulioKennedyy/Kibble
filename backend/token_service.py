from functools import lru_cache

import tiktoken


MODEL_PRICING = {
    "gemini-2.5-flash": {"name": "Gemini 2.5 Flash", "input_price": 0.30, "output_price": 2.50, "context_window": 1_048_576, "quota_tokens": 1_000_000},
    "gemini-2.5-pro": {"name": "Gemini 2.5 Pro", "input_price": 1.25, "output_price": 10.00, "context_window": 1_048_576, "quota_tokens": 1_000_000},
    "gpt-5": {"name": "GPT-5", "input_price": 1.25, "output_price": 10.00, "context_window": 400_000, "quota_tokens": 400_000},
    "gpt-4o": {"name": "GPT-4o", "input_price": 5.00, "output_price": 15.00, "context_window": 128_000, "quota_tokens": 128_000},
    "gpt-4o-mini": {"name": "GPT-4o Mini", "input_price": 0.15, "output_price": 0.60, "context_window": 128_000, "quota_tokens": 128_000},
    "claude-sonnet-4-5": {"name": "Claude Sonnet 4.5", "input_price": 3.00, "output_price": 15.00, "context_window": 200_000, "quota_tokens": 200_000},
}


@lru_cache(maxsize=1)
def _encoding() -> tiktoken.Encoding:
    return tiktoken.get_encoding("o200k_base")


def estimate_tokens(
    prompt: str,
    model_id: str,
    system_prompt: str = "",
    expected_output_tokens: int = 512,
) -> dict[str, int | float | str]:
    model = MODEL_PRICING.get(model_id)
    if model is None:
        raise ValueError(f"Unsupported model: {model_id}")

    input_tokens = len(_encoding().encode(system_prompt + "\n" + prompt))
    total_tokens = input_tokens + expected_output_tokens
    cost = (
        input_tokens * model["input_price"]
        + expected_output_tokens * model["output_price"]
    ) / 1_000_000
    context_percent = min(total_tokens / model["context_window"] * 100, 100)
    return {
        "input_tokens": input_tokens,
        "output_tokens": expected_output_tokens,
        "total_tokens": total_tokens,
        "cost": cost,
        "model_name": model["name"],
        "context_window": model["context_window"],
        "context_percent": context_percent,
    }
