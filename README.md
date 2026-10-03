# Kibble

Estimador de tokens e custos de prompts para modelos de IA.

O valor exibido é uma estimativa: ele soma os tokens do system prompt, do
prompt e do limite esperado de saída. A cobrança real pode incluir tokens
cacheados, ferramentas, imagens, chamadas adicionais e o tokenizador específico
do provedor. A tabela de preços em `backend/token_service.py` deve ser revisada
quando o provedor alterar seus preços.

## Como validar contra o gasto real

1. Envie o mesmo prompt ao provedor escolhido usando a API oficial.
2. Registre `usage.input_tokens`/`prompt_tokens` e
   `usage.output_tokens`/`completion_tokens` na resposta do provedor.
3. Compare os dois números separadamente com o Kibble; não compare apenas o
   custo arredondado.
4. Repita o teste com system prompt, histórico de conversa, ferramentas e
   respostas longas, pois esses itens mudam o contexto faturado.
5. Para produção, substitua a tabela fixa por preços e usage retornados pelo
   provedor e armazene as leituras por chave/projeto.

## Executar a API

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

## Executar o frontend

```powershell
cd frontend
npm install
npm run dev
```

A interface fica disponível em `http://localhost:5173` e a API em
`http://localhost:8000`.
# Kibble
