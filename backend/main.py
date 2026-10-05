from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import (
    MAX_REQUEST_BODY_BYTES,
    RATE_LIMIT_PER_MINUTE,
    allowed_origins,
)
from middleware import RateLimitMiddleware, RequestBodyLimitMiddleware, SecurityHeadersMiddleware
from models import EstimateRequest, EstimateResponse, ModelInfo
from token_service import estimate_tokens, list_models

app = FastAPI(title="Kibble API", version="2.0.0", description="Token & cost estimator for LLM prompts.")

app.add_middleware(RequestBodyLimitMiddleware, max_bytes=MAX_REQUEST_BODY_BYTES)
app.add_middleware(RateLimitMiddleware, requests_per_minute=RATE_LIMIT_PER_MINUTE)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": app.version}


@app.get("/api/models", response_model=list[ModelInfo])
def models() -> list[ModelInfo]:
    """Return all supported models with pricing and tokenizer metadata."""
    return [ModelInfo(**m) for m in list_models()]


@app.post("/api/estimate", response_model=EstimateResponse)
def estimate(request: EstimateRequest) -> EstimateResponse:
    try:
        result = estimate_tokens(
            request.prompt,
            request.model_id,
            request.system_prompt,
            request.conversation_history,
            request.expected_output_tokens,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return EstimateResponse(**result)
