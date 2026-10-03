"""
Backend test suite — covers:
  - happy path (valid model, normal prompt)
  - model with system prompt
  - invalid model (400)
  - empty prompt
  - expected output tokens = 0
  - /api/health
  - /api/models catalogue structure
  - response field completeness
  - input_cost + output_cost == cost
"""

import pytest
from fastapi.testclient import TestClient

import sys, os
# Add backend/ to path so its relative imports (from models import ...) work
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from main import app

client = TestClient(app)

VALID_MODELS = [
    "gpt-5",
    "gpt-4o",
    "gpt-4o-mini",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "claude-sonnet-4-5",
]


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Model catalogue
# ---------------------------------------------------------------------------

def test_models_returns_list():
    r = client.get("/api/models")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == len(VALID_MODELS)


def test_models_have_required_fields():
    r = client.get("/api/models")
    for m in r.json():
        assert "id" in m
        assert "name" in m
        assert "provider" in m
        assert "input_price_per_1m" in m
        assert "output_price_per_1m" in m
        assert "context_window" in m
        assert "tokenizer" in m
        assert "tokenizer_note" in m
        assert "last_updated" in m


def test_models_all_expected_ids_present():
    r = client.get("/api/models")
    ids = {m["id"] for m in r.json()}
    assert ids == set(VALID_MODELS)


# ---------------------------------------------------------------------------
# Happy path estimate
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("model_id", VALID_MODELS)
def test_estimate_happy_path(model_id):
    r = client.post("/api/estimate", json={
        "prompt": "Hello, world!",
        "model_id": model_id,
        "system_prompt": "",
        "expected_output_tokens": 100,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["input_tokens"] >= 0
    assert data["output_tokens"] == 100
    assert data["total_tokens"] == data["input_tokens"] + data["output_tokens"]
    assert data["cost"] >= 0


def test_estimate_cost_split_adds_up():
    r = client.post("/api/estimate", json={
        "prompt": "Count my tokens.",
        "model_id": "gpt-4o",
        "system_prompt": "You are a helpful assistant.",
        "expected_output_tokens": 200,
    })
    assert r.status_code == 200
    d = r.json()
    assert abs(d["input_cost"] + d["output_cost"] - d["cost"]) < 1e-9


def test_estimate_with_system_prompt():
    r = client.post("/api/estimate", json={
        "prompt": "Translate to Spanish: hello",
        "model_id": "gemini-2.5-flash",
        "system_prompt": "You are a translator.",
        "expected_output_tokens": 50,
    })
    assert r.status_code == 200
    d = r.json()
    # system prompt adds tokens — input_tokens must be > 0
    assert d["input_tokens"] > 0


def test_estimate_empty_prompt():
    r = client.post("/api/estimate", json={
        "prompt": "",
        "model_id": "gpt-4o-mini",
        "system_prompt": "",
        "expected_output_tokens": 0,
    })
    assert r.status_code == 200
    d = r.json()
    assert d["total_tokens"] >= 0
    # Newline separator between system_prompt and prompt is still encoded,
    # so cost may be a tiny positive number rather than exactly 0.0
    assert d["cost"] >= 0.0
    assert d["output_tokens"] == 0
    assert d["output_cost"] == 0.0


def test_estimate_returns_tokenizer_fields():
    r = client.post("/api/estimate", json={
        "prompt": "Test",
        "model_id": "claude-sonnet-4-5",
        "system_prompt": "",
        "expected_output_tokens": 10,
    })
    assert r.status_code == 200
    d = r.json()
    assert "tokenizer" in d
    assert "tokenizer_note" in d
    assert "approx" in d["tokenizer"]  # Claude uses approx


def test_estimate_openai_tokenizer_not_approx():
    r = client.post("/api/estimate", json={
        "prompt": "Test",
        "model_id": "gpt-5",
        "system_prompt": "",
        "expected_output_tokens": 10,
    })
    assert r.status_code == 200
    d = r.json()
    assert "approx" not in d["tokenizer"]


# ---------------------------------------------------------------------------
# Error cases
# ---------------------------------------------------------------------------

def test_estimate_invalid_model():
    r = client.post("/api/estimate", json={
        "prompt": "Hello",
        "model_id": "non-existent-model-xyz",
        "system_prompt": "",
        "expected_output_tokens": 100,
    })
    assert r.status_code == 400
    assert "Unsupported model" in r.json()["detail"]


def test_estimate_context_percent_capped_at_100():
    r = client.post("/api/estimate", json={
        "prompt": "x" * 1000,
        "model_id": "gpt-4o-mini",
        "system_prompt": "",
        "expected_output_tokens": 1_000_000,  # huge → exceeds context
    })
    assert r.status_code == 200
    assert r.json()["context_percent"] <= 100.0
