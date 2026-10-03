from pydantic import BaseModel, Field


class EstimateRequest(BaseModel):
    prompt: str = Field(default="", max_length=1_000_000)
    system_prompt: str = Field(default="", max_length=100_000)
    expected_output_tokens: int = Field(default=512, ge=0, le=1_000_000)
    model_id: str


class EstimateResponse(BaseModel):
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: float
    model_name: str
    context_window: int
    context_percent: float
