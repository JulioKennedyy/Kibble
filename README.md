# Kibble

> Local token & cost estimator for LLM prompts — dark teal UI, no API calls to providers.

Kibble counts system prompt tokens + prompt tokens + expected output tokens, then applies per-provider pricing to give you an estimate **before** you run the request.

---

## ⚠️ Estimation caveats

| Item | Notes |
|---|---|
| **Tokenizer** | Uses `tiktoken o200k_base` (native for OpenAI GPT). For Gemini and Claude it is an **approximation** (±5–15 %). |
| **Budget local** | Your planning target — **not** the provider account quota. |
| **Final billing** | Depends on the provider tokenizer, cached tokens, tools, images, and actual generated output. |

---

## Supported models

| Model | Provider | Context window | Tokenizer |
|---|---|---|---|
| GPT-5 | OpenAI | 400 000 | tiktoken (exact) |
| GPT-4o | OpenAI | 128 000 | tiktoken (exact) |
| GPT-4o Mini | OpenAI | 128 000 | tiktoken (exact) |
| Gemini 2.5 Flash | Google | 1 048 576 | tiktoken (approx.) |
| Gemini 2.5 Pro | Google | 1 048 576 | tiktoken (approx.) |
| Claude Sonnet 4.5 | Anthropic | 200 000 | tiktoken (approx.) |

---

## Quick start

### One-command start (recommended)

```powershell
cd C:\Users\Júlio Kennedy\Documents\Kibble
.\start.ps1
```

`start.ps1` will:
1. Kill any process already on ports 8000 or 5173 (no duplicates).
2. Install/activate the Python venv and pip dependencies.
3. Install npm dependencies.
4. Start FastAPI on `:8000` and Vite on `:5173`.

### Stop everything

```powershell
.\stop.ps1
```

---

## Manual start

### Backend

```powershell
cd backend
# First time only:
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Every time:
uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install        # first time only
npm run dev        # Vite on :5173 with strictPort (no drift)
```

---

## Environment variables

Copy `.env.example` to `.env` (or `frontend/.env.local`).

```powershell
Copy-Item .env.example .env
```

> **Important:** Kibble does **not** call any provider API. No API keys are required or stored.

---

## How to validate against real provider usage

1. Send the same prompt to the provider's official API.
2. Record `usage.input_tokens`/`prompt_tokens` and `usage.output_tokens`/`completion_tokens` from the response.
3. Open the **Compare panel** in Kibble and paste the real values — it shows the diff per metric.
4. Repeat with system prompt, conversation history, tools, and long responses — they all change the billed context.
5. For production, replace the static price table (`backend/token_service.py`) with live pricing from the provider and store per-key usage readings.

---

## Running tests

### Backend (pytest)

```powershell
cd C:\Users\Júlio Kennedy\Documents\Kibble
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
pytest tests\ -v
```

### Frontend (Vitest)

```powershell
cd frontend
npm install
npm test
```

---

## Project structure

```
Kibble/
├── backend/
│   ├── main.py            # FastAPI app (health, models, estimate)
│   ├── models.py          # Pydantic schemas
│   ├── token_service.py   # Model catalogue + tiktoken estimation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── KibbleMascot.jsx   # SVG dot-matrix mascot (idle/loading/error)
│   │   │   ├── ModelTabs.jsx
│   │   │   ├── StatsDisplay.jsx
│   │   │   └── ComparePanel.jsx   # Paste real usage & compare
│   │   └── test/
│   │       ├── setup.js
│   │       └── App.test.jsx
│   ├── vite.config.js     # strictPort: true
│   └── package.json
├── tests/
│   └── test_backend.py
├── .env.example
├── start.ps1              # Start both servers (kills duplicates first)
└── stop.ps1               # Kill servers on :8000 and :5173
```
