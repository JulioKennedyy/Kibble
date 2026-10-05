from pydantic import BaseModel, Field, model_validator

from config import MAX_TOTAL_INPUT_CHARS


class EstimateRequest(BaseModel):
    prompt: str = Field(default="", max_length=MAX_TOTAL_INPUT_CHARS)
    system_prompt: str = Field(default="", max_length=MAX_TOTAL_INPUT_CHARS)
    conversation_history: str = Field(default="", max_length=MAX_TOTAL_INPUT_CHARS)
    expected_output_tokens: int = Field(default=512, ge=0, le=1_000_000)
    model_id: str

    @model_validator(mode="after")
    def validate_total_input_size(self) -> "EstimateRequest":
        total = len(self.prompt) + len(self.system_prompt) + len(self.conversation_history)
        if total > MAX_TOTAL_INPUT_CHARS:
            raise ValueError(
                f"O total dos textos não pode passar de {MAX_TOTAL_INPUT_CHARS:,} caracteres."
            )
        return self


class EstimateResponse(BaseModel):
    input_tokens: int
    system_tokens: int = 0
    prompt_tokens: int = 0
    context_tokens: int = 0
    output_tokens: int
    total_tokens: int
    # split costs
    input_cost: float
    output_cost: float
    cost: float
    # model metadata
    model_name: str
    provider: str
    context_window: int
    context_percent: float
    tokenizer: str
    tokenizer_note: str
    input_price_per_1m: float
    output_price_per_1m: float
    last_updated: str


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    input_price_per_1m: float
    output_price_per_1m: float
    context_window: int
    tokenizer: str
    tokenizer_note: str
    last_updated: str
