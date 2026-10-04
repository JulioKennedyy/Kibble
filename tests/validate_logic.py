# -*- coding: utf-8 -*-
"""
Kibble - Script de validacao completa da logica de estimativa.

Esse script verifica:
  1. A logica matematica (custo = tokens x preco / 1M)
  2. O tokenizador (tiktoken o200k_base) conta tokens corretamente
  3. O breakdown (system + prompt + history = input total)
  4. O context_percent esta correto
  5. Os precos batem com os precos reais dos provedores
  6. Mostra a margem de erro do tokenizador para cada provedor

Rode com:
  .venv\\Scripts\\python.exe tests\\validate_logic.py
"""

import sys, os, io

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

import tiktoken
from token_service import estimate_tokens, MODEL_CATALOGUE, _encoding

# =====================================================================
# PRECOS REAIS DOS PROVEDORES (verificados em outubro 2026)
# =====================================================================

VERIFIED_PRICES = {
    # OpenAI - https://openai.com/api/pricing
    "gpt-4o": {
        "input": 2.50,    # ERA $5.00 no Kibble -> DESATUALIZADO
        "output": 10.00,  # ERA $15.00 no Kibble -> DESATUALIZADO
        "context_window": 128_000,
    },
    "gpt-4o-mini": {
        "input": 0.15,    # Correto
        "output": 0.60,   # Correto
        "context_window": 128_000,
    },
    "gpt-5": {
        "input": 1.25,    # Correto (preco de lancamento)
        "output": 10.00,  # Correto
        "context_window": 400_000,
    },
    # Google - https://ai.google.dev/pricing
    "gemini-2.5-flash": {
        "input": 0.30,    # Correto
        "output": 2.50,   # Correto
        "context_window": 1_048_576,
    },
    "gemini-2.5-flash-lite": {
        "input": 0.10,    # Correto
        "output": 0.40,   # Correto
        "context_window": 1_048_576,
    },
    "gemini-2.5-pro": {
        "input": 1.25,    # Correto
        "output": 10.00,  # Correto
        "context_window": 1_048_576,
    },
    # Anthropic - https://anthropic.com/pricing
    "claude-sonnet-4-5": {
        "input": 3.00,    # Correto
        "output": 15.00,  # Correto
        "context_window": 200_000,
    },
}

# =====================================================================
# TESTES
# =====================================================================

passed = 0
failed = 0
warnings_list = []

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  [OK] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name} -- {detail}")
        failed += 1

def warn(msg):
    global warnings_list
    print(f"  [WARN] {msg}")
    warnings_list.append(msg)


# ---- 1. VERIFICACAO DE PRECOS ----
print("")
print("=" * 60)
print("1. VERIFICACAO DE PRECOS vs. PROVEDORES REAIS")
print("=" * 60)

for model_id, verified in VERIFIED_PRICES.items():
    kibble = MODEL_CATALOGUE.get(model_id)
    if not kibble:
        print(f"\n  [FAIL] {model_id}: nao encontrado no catalogo!")
        failed += 1
        continue

    print(f"\n  >> {kibble['name']} ({kibble['provider']})")

    input_ok = kibble["input_price"] == verified["input"]
    output_ok = kibble["output_price"] == verified["output"]
    ctx_ok = kibble["context_window"] == verified["context_window"]

    if input_ok:
        check(f"Preco entrada: ${kibble['input_price']}/1M tokens", True)
    else:
        check(
            f"Preco entrada",
            False,
            f"Kibble=${kibble['input_price']} vs Real=${verified['input']}"
        )

    if output_ok:
        check(f"Preco saida: ${kibble['output_price']}/1M tokens", True)
    else:
        check(
            f"Preco saida",
            False,
            f"Kibble=${kibble['output_price']} vs Real=${verified['output']}"
        )

    check(f"Janela de contexto: {kibble['context_window']:,}", ctx_ok,
          f"Kibble={kibble['context_window']:,} vs Real={verified['context_window']:,}")

# gemini-3.1-pro-preview
print(f"\n  >> Gemini 3.1 Pro Preview")
warn("Preco nao verificavel -- modelo preview, sem preco publico confirmado.")


# ---- 2. LOGICA MATEMATICA DO CALCULO ----
print("")
print("=" * 60)
print("2. LOGICA MATEMATICA DO CALCULO DE CUSTO")
print("=" * 60)

test_cases = [
    {
        "name": "Prompt simples sem contexto",
        "prompt": "Hello, how are you?",
        "model": "gpt-4o-mini",
        "system": "",
        "history": "",
        "output_tokens": 100,
    },
    {
        "name": "Com system prompt",
        "prompt": "Translate to English: Good morning",
        "model": "gemini-2.5-flash",
        "system": "You are a professional translator.",
        "history": "",
        "output_tokens": 50,
    },
    {
        "name": "Com historico de conversa",
        "prompt": "Continue",
        "model": "claude-sonnet-4-5",
        "system": "You are an assistant.",
        "history": "User: Hello\nAssistant: Hi! How can I help?\nUser: Explain Python.\nAssistant: Python is a high-level programming language...",
        "output_tokens": 512,
    },
    {
        "name": "Prompt vazio",
        "prompt": "",
        "model": "gpt-5",
        "system": "",
        "history": "",
        "output_tokens": 0,
    },
    {
        "name": "Prompt longo (~1000 tokens)",
        "prompt": "Lorem ipsum dolor sit amet. " * 200,
        "model": "gemini-2.5-pro",
        "system": "Be concise.",
        "history": "",
        "output_tokens": 256,
    },
]

enc = _encoding()

for tc in test_cases:
    print(f"\n  >> {tc['name']}")

    result = estimate_tokens(
        tc["prompt"], tc["model"], tc["system"], tc["history"], tc["output_tokens"]
    )

    model = MODEL_CATALOGUE[tc["model"]]

    # Verificar contagem manual de tokens
    manual_system = len(enc.encode(tc["system"])) if tc["system"] else 0
    manual_prompt = len(enc.encode(tc["prompt"])) if tc["prompt"] else 0
    manual_history = len(enc.encode(tc["history"])) if tc["history"] else 0
    manual_input = manual_system + manual_prompt + manual_history

    check(
        f"Breakdown: {result['system_tokens']}+{result['prompt_tokens']}+{result['context_tokens']}={result['input_tokens']}",
        result["system_tokens"] + result["prompt_tokens"] + result["context_tokens"] == result["input_tokens"],
        f"Soma nao bate"
    )

    check(
        f"Contagem manual = resultado: {manual_input} tokens",
        result["input_tokens"] == manual_input,
        f"Manual={manual_input}, Resultado={result['input_tokens']}"
    )

    check(
        f"Total = input + output: {result['input_tokens']}+{result['output_tokens']}={result['total_tokens']}",
        result["total_tokens"] == result["input_tokens"] + result["output_tokens"],
    )

    # Verificar calculo de custo
    expected_input_cost = result["input_tokens"] * model["input_price"] / 1_000_000
    expected_output_cost = tc["output_tokens"] * model["output_price"] / 1_000_000
    expected_total = expected_input_cost + expected_output_cost

    check(
        f"Custo entrada: ${result['input_cost']:.8f}",
        abs(result["input_cost"] - expected_input_cost) < 1e-10,
        f"Esperado=${expected_input_cost:.8f}"
    )

    check(
        f"Custo saida: ${result['output_cost']:.8f}",
        abs(result["output_cost"] - expected_output_cost) < 1e-10,
        f"Esperado=${expected_output_cost:.8f}"
    )

    check(
        f"Custo total = entrada + saida: ${result['cost']:.8f}",
        abs(result["cost"] - expected_total) < 1e-10,
        f"input_cost + output_cost != cost"
    )

    # Verificar context_percent
    expected_pct = min(result["total_tokens"] / model["context_window"] * 100, 100)
    check(
        f"Uso da janela: {result['context_percent']:.4f}%",
        abs(result["context_percent"] - expected_pct) < 1e-6,
        f"Esperado={expected_pct:.4f}%"
    )


# ---- 3. PRECISAO DO TOKENIZADOR ----
print("")
print("=" * 60)
print("3. PRECISAO DO TOKENIZADOR (tiktoken o200k_base)")
print("=" * 60)

# Textos com contagem conhecida
reference_texts = [
    ("Hello, world!", 4),
    ("", 0),
    ("a", 1),
    ("The quick brown fox jumps over the lazy dog.", 10),
]

print(f"\n  Tokenizador: o200k_base (nativo para OpenAI GPT)")
for text, expected in reference_texts:
    actual = len(enc.encode(text))
    display = repr(text) if len(text) < 40 else repr(text[:37] + "...")
    check(
        f"{display} -> {actual} tokens",
        actual == expected,
        f"Esperado={expected}, Obtido={actual}"
    )

# Mostrar diferenca provavel para outros provedores
print(f"\n  Margem de erro por provedor:")
print(f"  - OpenAI (GPT):     EXATO (mesmo tokenizador)")
print(f"  - Google (Gemini):   +/- 5-15% (usa SentencePiece)")
print(f"  - Anthropic (Claude): +/- 5-10% (usa BPE proprietario)")


# ---- 4. LIMITACOES E AVISOS ----
print("")
print("=" * 60)
print("4. LIMITACOES CONHECIDAS (o que o Kibble NAO faz)")
print("=" * 60)

limitations = [
    "Gemini/Claude: contagem de tokens e APROXIMADA (+/-5-15%).\n"
    "     -> Google usa SentencePiece, Anthropic usa BPE proprietario.\n"
    "     -> O Kibble usa tiktoken (OpenAI) como aproximacao.",

    "Tokens especiais: o Kibble NAO conta tokens de controle que\n"
    "     a API adiciona automaticamente (ex: <|im_start|>, role tags).\n"
    "     -> Na pratica, a API cobra ~3-10 tokens a mais por mensagem.",

    "Cache: provedores dao desconto em tokens cacheados.\n"
    "     -> O Kibble calcula o preco CHEIO (sem cache).",

    "Imagens/tools: se o prompt incluir imagens ou chamadas de\n"
    "     ferramentas, os tokens reais serao MUITO maiores.",

    "Saida: o campo 'tokens de resposta' e um PALPITE seu.\n"
    "     -> O modelo pode gerar mais ou menos tokens.",
]

for lim in limitations:
    warn(lim)


# =====================================================================
# RESULTADO FINAL
# =====================================================================
print("")
print("=" * 60)
print("RESULTADO FINAL")
print("=" * 60)
print(f"\n  [OK]   Passaram: {passed}")
print(f"  [FAIL] Falharam: {failed}")
print(f"  [WARN] Avisos:   {len(warnings_list)}")

if failed > 0:
    print(f"\n  PROBLEMAS ENCONTRADOS -- verifique os [FAIL] acima.")
    sys.exit(1)
else:
    print(f"\n  Toda a logica matematica esta correta!")
    if warnings_list:
        print(f"  Mas existem {len(warnings_list)} limitacoes conhecidas (veja acima).")
    sys.exit(0)
