from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import EstimateRequest, EstimateResponse, ModelInfo
from token_service import estimate_tokens, list_models

app = FastAPI(title="Kibble API", version="2.0.0", description="Token & cost estimator for LLM prompts.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "2.0.0"}


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
            request.expected_output_tokens,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return EstimateResponse(**result)
