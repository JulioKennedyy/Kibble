<p align="center">
  <img src="frontend/public/kibble/idle-v2.png" alt="Mascote Kibble" width="220" />
</p>

<h1 align="center">🟣 Kibble</h1>

<p align="center">
  <strong>Estimador de tokens, custos e janela de contexto para prompts de IA — 100% privado, em tempo real e sem chamadas a provedores.</strong>
</p>

<p align="center">
  <a href="https://github.com/JulioKennedyy/Kibble/actions/workflows/ci.yml">
    <img src="https://github.com/JulioKennedyy/Kibble/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
  </a>
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?style=flat&logo=python&logoColor=white" alt="Python 3.12+" />
  <img src="https://img.shields.io/badge/FastAPI-0.142%2B-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Privacidade-Zero%20API%20Calls-success?style=flat&logo=shield" alt="Zero API Calls" />
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg?style=flat" alt="Licença MIT" />
  </a>
</p>

<p align="center">
  <a href="#-o-que-%C3%A9-o-kibble">O que é?</a> •
  <a href="#-funcionalidades-principais">Funcionalidades</a> •
  <a href="#-modelos-suportados--tabela-de-pre%C3%A7os">Modelos e Preços</a> •
  <a href="#%EF%B8%8F-arquitetura--como-funciona">Arquitetura</a> •
  <a href="#-como-rodar-localmente">Como Rodar</a> •
  <a href="#%EF%B8%8F-deploy-em-produ%C3%A7%C3%A3o">Deploy</a> •
  <a href="#-a-mascote-kibble">A Mascote</a>
</p>

---

## 💡 O que é o Kibble?

Ao construir prompts, assistentes ou orquestrações de IA, é muito comum se deparar com dúvidas críticas:
- *Quantos tokens esse prompt longo consome?*
- *Quanto essa chamada vai me custar na fatura da OpenAI, Google ou Anthropic?*
- *Esse histórico de mensagens vai estourar o limite de contexto do modelo?*

Testar enviando chamadas diretamente para a API dos provedores custa dinheiro, adiciona latência e expõe seus rascunhos a servidores de terceiros.

O **Kibble** resolve isso instantaneamente no seu navegador: ele analisa a anatomia completa do prompt (*instrução do sistema, histórico de chat e texto do usuário*), calcula a contagem de tokens com precisão, projeta custos para os modelos mais modernos do mercado e monitora o uso da janela de contexto.

> [!IMPORTANT]
> **Privacidade Radical por Design:**
> O Kibble **NÃO faz chamadas externas para OpenAI, Google ou Anthropic**.
> - ❌ Sem chaves de API (`API_KEY`) necessárias.
> - ❌ Sem banco de dados, contas ou telemetria.
> - ❌ Nenhum texto digitado é salvo ou compartilhado.

---

## ✨ Funcionalidades Principais

- ⚡ **Cálculo Instantâneo com Debounce Inteligente:** Atualização em tempo real conforme você digita, sem travamentos na interface.
- 💰 **Estimativa de Custos Multi-Provedor:** Compare instantaneamente custos de entrada (*input*) e de resposta prevista (*output*) em dezenas de modelos de ponta.
- 🧩 **Detalhamento Anatômico do Prompt:**
  - **Instrução do Sistema (System Prompt):** Meça o impacto das suas diretrizes de persona.
  - **Histórico da Conversa (Chat History):** Entenda como conversas passadas acumulam custos a cada nova mensagem.
  - **Prompt Principal:** Seu texto de entrada com contador de caracteres em tempo real.
  - **Tokens de Resposta Previstos:** Simule o custo da resposta gerada pela IA.
- 🪟 **Medidor de Contexto & Orçamento (Budget):** Barra visual indicando a porcentagem consumida da janela máxima do modelo e alerta quando você atinge seu teto de tokens planejado.
- ⚖️ **Comparador com Uso Real (`usage`):** Cole o objeto de uso real retornado pela API do provedor (`prompt_tokens`, `completion_tokens`) e compare a precisão com a estimativa do Kibble.
- 🟣 **Mascote Kibble Dinâmica & Interativa:** O Kibble é uma criatura formada por partículas lilases que reage ativamente ao que você faz:
  - *Comendo tokens* com entusiasmo enquanto você digita.
  - *Pensando* enquanto calcula requisições.
  - *Assustado/Alerta* se você deletar texto ou exceder a janela de contexto.
  - *Satisfeito* após um banquete de tokens bem equilibrado.
  - *Dormindo* pacificamente quando você faz pausas.
- 🛡️ **Segurança e Robustez Nativas:** Proteção com rate-limiting por IP, limitação do corpo da requisição HTTP (2.1 MB) e do tamanho do texto (500.000 caracteres), além de cabeçalhos de segurança (CSP, HSTS, X-Content-Type-Options).

---

## 🤖 Modelos Suportados & Tabela de Preços

O catálogo do Kibble reúne os modelos mais recentes das três principais plataformas de IA (*valores em USD por 1.000.000 de tokens*):

### OpenAI
| Modelo | Entrada (1M) | Saída (1M) | Janela de Contexto | Tokenizador |
|---|---:|---:|---:|---|
| **GPT-6 Astra** | $10.00 | $50.00 | 1.050.000 | `o200k_base` (Nativo) |
| **GPT-5.6 Sol** | $4.00 | $20.00 | 1.050.000 | `o200k_base` (Nativo) |
| **GPT-5.6 Luna** | $0.20 | $1.20 | 1.050.000 | `o200k_base` (Nativo) |
| **GPT-5** | $1.25 | $10.00 | 400.000 | `o200k_base` (Nativo) |
| **GPT-4o** | $2.50 | $10.00 | 128.000 | `o200k_base` (Nativo) |
| **GPT-4o Mini** | $0.15 | $0.60 | 128.000 | `o200k_base` (Nativo) |

### Google
| Modelo | Entrada (1M) | Saída (1M) | Janela de Contexto | Tokenizador |
|---|---:|---:|---:|---|
| **Gemini 3.8 Flash** | $0.75 | $3.75 | 1.048.576 | `o200k_base` (Aprox.) |
| **Gemini 3.1 Pro** | $2.00 | $12.00 | 1.048.576 | `o200k_base` (Aprox.) |
| **Gemini 2.5 Flash** | $0.30 | $2.50 | 1.048.576 | `o200k_base` (Aprox.) |
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 | 1.048.576 | `o200k_base` (Aprox.) |
| **Gemini 2.5 Pro** | $1.25 | $10.00 | 1.048.576 | `o200k_base` (Aprox.) |

### Anthropic
| Modelo | Entrada (1M) | Saída (1M) | Janela de Contexto | Tokenizador |
|---|---:|---:|---:|---|
| **Claude Fable 5.1** | $10.00 | $50.00 | 1.000.000 | `o200k_base` (Aprox.) |
| **Claude Opus 5.5** | $4.00 | $20.00 | 1.000.000 | `o200k_base` (Aprox.) |
| **Claude Sonnet 5.5** | $2.00 | $10.00 | 1.000.000 | `o200k_base` (Aprox.) |
| **Claude Haiku 4.5** | $1.00 | $5.00 | 200.000 | `o200k_base` (Aprox.) |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | 200.000 | `o200k_base` (Aprox.) |

> [!NOTE]
> Preços oficiais revisados em outubro de 2026. Valores indicativos, sem considerar eventuais descontos de prompt caching ou chamadas adicionais de tool/function calling.

---

## 🏗️ Arquitetura & Como Funciona

```text
┌────────────────────────────────────────┐
│     Navegador (React 18 + Vite 6)      │
│  Interface responsiva + Mascote SVG    │
└──────────────────┬─────────────────────┘
                   │
                   │ POST /api/estimate (JSON local)
                   ▼
┌────────────────────────────────────────┐
│      API (FastAPI + Pydantic v2)       │
│  Rate Limit • Body Limit • Sec Headers │
└──────────────────┬─────────────────────┘
                   │
                   ├── tiktoken (o200k_base)
                   └── Catálogo versionado de modelos e preços
```

### Transparência sobre o Tokenizador
- **OpenAI (GPT):** A contagem é **exata**, pois utiliza a biblioteca oficial `tiktoken` com a codificação `o200k_base`.
- **Google Gemini & Anthropic Claude:** Google utiliza *SentencePiece* e Anthropic utiliza *BPE proprietário*. O Kibble emprega `o200k_base` como uma aproximação de alta qualidade (com margem típica de erro entre ±5% e ±15%).
- **Framing Tokens:** Provedores de API inserem pequenos tokens internos de controle (`<|im_start|>`, tags de role de sistema e mensagens) que adicionam ~3 a 10 tokens por mensagem em chamadas reais.

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Python 3.11+** (recomendado Python 3.12)
- **Node.js 18+** (recomendado Node.js 20 ou 22)
- **Git**

### Opção A: Inicialização Rápida em 1 Clique (Windows PowerShell)

No diretório do projeto, execute:

```powershell
.\start.ps1
```

O script automaticamente:
1. Libera as portas `8000` e `5173` se estiverem ocupadas.
2. Cria o ambiente virtual `.venv` e instala as dependências do backend se necessário.
3. Inicia a API FastAPI em `http://127.0.0.1:8000`.
4. Inicia o frontend Vite em `http://localhost:5173`.
5. Abre o Kibble automaticamente no seu navegador padrão.

Para parar todos os serviços a qualquer momento:

```powershell
.\stop.ps1
```

---

### Opção B: Inicialização Manual (Windows, Linux e macOS)

#### 1. Backend (FastAPI)
```bash
# Crie e ative o ambiente virtual
python -m venv .venv

# No Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# No Linux / macOS:
# source .venv/bin/activate

# Instale as dependências
pip install -r backend/requirements-dev.txt

# Inicie o servidor da API
uvicorn main:app --app-dir backend --reload --port 8000
```

#### 2. Frontend (React + Vite)
Em um novo terminal:
```bash
cd frontend

# Instale os pacotes npm
npm ci

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em **`http://localhost:5173`**.

---

## ⚙️ Variáveis de Ambiente

O Kibble roda perfeitamente sem nenhuma configuração manual em desenvolvimento local. Caso deseje customizar portas, limites ou segurança, copie [.env.example](.env.example) para `.env`:

| Variável | Padrão | Descrição |
|---|:---:|---|
| `VITE_API_URL` | `http://localhost:8000` | URL pública da API FastAPI utilizada pelo frontend |
| `VITE_API_TIMEOUT_MS` | `75000` | Tempo limite da requisição (permite aguardar cold starts em hosts gratuitos) |
| `KIBBLE_CORS_ORIGINS` | `http://localhost:5173` | Origens autorizadas no CORS (separadas por vírgula) |
| `KIBBLE_RATE_LIMIT_PER_MINUTE` | `120` | Limite de requisições de estimativa por IP/minuto |
| `KIBBLE_MAX_TOTAL_INPUT_CHARS` | `500000` | Limite somado de caracteres dos 3 campos de texto |
| `KIBBLE_MAX_REQUEST_BODY_BYTES` | `2100000` | Tamanho máximo permitido para o payload HTTP da API |

---

## 🧪 Testes & Validação de Qualidade

O projeto conta com uma suíte de testes automatizados completa:

```bash
# 1. Testes unitários da API FastAPI (36 testes)
pytest tests/test_backend.py -q

# 2. Validação matemática rigorosa de preços e limites (66 asserções)
python tests/validate_logic.py

# 3. Testes de componentes do Frontend React (Vitest + Testing Library)
cd frontend
npm test

# 4. Verificação de build de produção
npm run build
```

O **GitHub Actions** executa essa mesma suíte em cada push e pull request através do workflow de Integração Contínua ([CI](.github/workflows/ci.yml)).

---

## ☁️ Deploy em Produção

O Kibble foi projetado para deploy com **custo zero** no [Render](https://render.com/) através do arquivo [render.yaml](render.yaml):

1. Conecte seu repositório no [Render Dashboard](https://dashboard.render.com/).
2. Crie um novo **Blueprint** e aponte para o repositório.
3. O Render configurará automaticamente:
   - Uma API Web Service gratuita em FastAPI (`kibble-jk-api`).
   - Um Static Site gratuito para o frontend React (`kibble-jk-web`).
   - As variáveis cruzadas de `VITE_API_URL` e `KIBBLE_CORS_ORIGINS`.
   - Health checks em `/api/health` e cabeçalhos de segurança HTTP.

Para instruções completas e dicas sobre cold starts do plano gratuito, consulte o guia [DEPLOY.md](DEPLOY.md).

---

## 🟣 A Mascote Kibble

<p align="center">
  <img src="frontend/public/kibble/idle-v2.png" alt="Kibble Mascote" width="140" />
</p>

O **Kibble** não é apenas um logotipo — ele é um companheiro de produtividade:
- **Origem:** Uma criatura digital nascida da condensação de pequenos tokens lilases.
- **Dieta:** Alimenta-se avidamente de tokens de linguagem e dados textuais.
- **Personalidade:** Fofa, moderna e expressiva. Quando você digita muito, ele come depressa; quando o prompt fica enorme, ele fica cheio e satisfeito; se você esvazia o texto ou estoura a cota, ele se assusta; e quando você se afasta, ele tira uma soneca restauradora.
- **Interação:** Você pode clicar e interagir com ele no canto inferior da tela a qualquer momento!

---

## 📁 Estrutura do Projeto

```text
Kibble/
├── .github/workflows/    # Pipeline de CI (GitHub Actions)
├── backend/              # API FastAPI, tokenização e segurança
│   ├── main.py           # Endpoints (/api/estimate, /api/models, /api/health)
│   ├── token_service.py  # tiktoken, regras de cálculo e catálogo de modelos
│   ├── middleware.py     # Rate limiting e cabeçalhos de segurança
│   └── models.py         # Schemas e validações Pydantic
├── frontend/             # Single Page Application (React 18 + Vite 6)
│   ├── src/
│   │   ├── components/   # Mascote, abas de modelos, painéis e stats
│   │   ├── api.js        # Cliente HTTP com suporte a cold start
│   │   └── App.jsx       # Layout principal e orquestração de estados
│   └── public/           # SVGs e imagens da mascote Kibble
├── tests/                # Suíte de testes do backend e validação matemática
├── render.yaml           # Blueprint de Infraestrutura como Código (Render)
├── DEPLOY.md             # Manual completo de publicação em nuvem
├── start.ps1             # Inicializador em 1 clique (Windows)
├── stop.ps1              # Finalizador de processos (Windows)
└── LICENSE               # Licença MIT de código aberto
```

---

## 🛠️ Manutenção do Catálogo de Preços

Os preços de modelos de IA evoluem frequentemente. Para atualizar ou adicionar modelos:

1. Edite `MODEL_CATALOGUE` em [backend/token_service.py](backend/token_service.py).
2. Atualize o campo `last_updated: date(AAAA, MM, DD)`.
3. Adicione testes em [tests/validate_logic.py](tests/validate_logic.py) e [tests/test_backend.py](tests/test_backend.py).
4. Execute `pytest` e `python tests/validate_logic.py` antes de realizar o commit.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais informações.

Desenvolvido com carinho e precisão por **[Júlio Kennedy](https://github.com/JulioKennedyy)**.
