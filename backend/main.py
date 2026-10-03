from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import EstimateRequest, EstimateResponse
from token_service import estimate_tokens

app = FastAPI(title="Kibble API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


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
