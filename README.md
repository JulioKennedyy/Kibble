# Kibble

Estimador de tokens e custos para prompts de modelos de linguagem. O Kibble compara modelos, mostra o uso da janela de contexto e estima o custo antes de uma chamada real ao provedor.

O Kibble **não chama APIs da OpenAI, Google ou Anthropic**. No deploy atual, o texto é processado pela API do próprio Kibble e não é armazenado.

## Arquitetura

```text
Navegador (React + Vite)
          |
          | HTTPS/JSON
          v
API (FastAPI + Pydantic)
          |
          +-- tiktoken o200k_base
          +-- catálogo versionado de modelos e preços
```

- Sem banco de dados, contas ou chaves de provedores.
- Contagem nativa para modelos OpenAI que usam `o200k_base`.
- Contagem aproximada para Gemini e Claude (pode variar cerca de 5–15%).
- Custo indicativo: cache, imagens, ferramentas, contexto longo e a saída real podem alterar a cobrança.

## Rodar localmente

```powershell
cd "C:\Users\Júlio Kennedy\Documents\Kibble"
.\start.ps1
```

Abra `http://localhost:5173`. Para encerrar:

```powershell
.\stop.ps1
```

### Inicialização manual

```powershell
# backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements-dev.txt
uvicorn main:app --app-dir backend --reload --port 8000

# frontend, em outro terminal
cd frontend
npm ci
npm run dev
```

## Variáveis de ambiente

O desenvolvimento local funciona sem criar um `.env`. As variáveis disponíveis estão em [.env.example](.env.example).

| Variável | Padrão | Uso |
|---|---:|---|
| `VITE_API_URL` | `http://localhost:8000` | Endereço público da API |
| `VITE_API_TIMEOUT_MS` | `75000` | Tolera o cold start do plano gratuito |
| `KIBBLE_CORS_ORIGINS` | origens locais | Frontends autorizados, separados por vírgula |
| `KIBBLE_RATE_LIMIT_PER_MINUTE` | `120` | Limite de estimativas por IP/instância |
| `KIBBLE_MAX_TOTAL_INPUT_CHARS` | `500000` | Soma máxima dos três campos de texto |
| `KIBBLE_MAX_REQUEST_BODY_BYTES` | `2100000` | Limite do corpo HTTP |

## Testes

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_backend.py -q
.\.venv\Scripts\python.exe tests\validate_logic.py
cd frontend
npm.cmd test
npm.cmd run build
```

O GitHub Actions executa os mesmos testes em cada push e pull request.

## Publicação

O arquivo [render.yaml](render.yaml) cria automaticamente:

1. Uma API FastAPI gratuita.
2. Um site estático gratuito.
3. A ligação de URL e CORS entre os dois serviços.
4. Health check, cabeçalhos de segurança e deploy contínuo após o CI.

Siga o guia completo em [DEPLOY.md](DEPLOY.md).

## Estrutura

```text
Kibble/
├── backend/               # API, catálogo, limites e estimativa
├── frontend/              # interface React e mascote SVG
├── tests/                 # testes da API e validações matemáticas
├── .github/workflows/     # integração contínua
├── render.yaml            # infraestrutura do Render
├── DEPLOY.md              # tutorial de publicação
├── start.ps1
└── stop.ps1
```

## Manutenção do catálogo

Preços de IA mudam com frequência. Ao atualizar `backend/token_service.py`:

1. Confirme preço e contexto na documentação oficial do provedor.
2. Atualize `last_updated`.
3. Atualize `tests/validate_logic.py` quando houver um valor verificável.
4. Rode a suíte completa antes de publicar.
