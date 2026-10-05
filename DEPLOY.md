# Publicar o Kibble gratuitamente no Render

O projeto já contém o `render.yaml` necessário. O Render lerá esse arquivo e criará o frontend e o backend juntos.

## Antes de começar

Você precisa de:

- uma conta gratuita no GitHub;
- uma conta gratuita no [Render](https://render.com/);
- este projeto enviado para um repositório do GitHub.

Não são necessárias chaves da OpenAI, Google ou Anthropic.

## 1. Criar o repositório no GitHub

No GitHub, clique em **New repository**, escolha um nome como `kibble` e não marque as opções para criar README ou `.gitignore`, pois o projeto já possui esses arquivos.

No terminal, dentro da pasta do projeto:

```powershell
git status
git add -A
git commit -m "Prepara o Kibble para produção"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/kibble.git
git push -u origin main
```

Se o projeto já tiver um `origin`, confira com `git remote -v` e apenas faça o `git push`.

Neste primeiro commit é normal aparecerem milhares de exclusões dentro de `frontend/node_modules` e `frontend/dist`: elas retiram arquivos gerados do repositório, mas não apagam suas cópias locais. Depois do commit, estes comandos não devem listar nenhum arquivo:

```powershell
git ls-files frontend/node_modules
git ls-files frontend/dist
```

## 2. Criar o Blueprint no Render

1. Entre em [dashboard.render.com](https://dashboard.render.com/).
2. Clique em **New** e depois em **Blueprint**.
3. Conecte sua conta do GitHub, se necessário.
4. Selecione o repositório `kibble`.
5. O Render detectará o arquivo `render.yaml`.
6. Confirme a criação dos serviços `kibble-jk-api` e `kibble-jk-web`.
7. Clique em **Apply** ou **Deploy Blueprint**.

O primeiro deploy demora alguns minutos porque instala Python, Node e o tokenizador.

Se algum dos nomes já estiver ocupado, altere os dois campos `name` no `render.yaml` e também as referências `fromService.name` correspondentes. Faça commit, envie novamente e repita a criação do Blueprint.

## 3. Confirmar o deploy

Quando os dois serviços estiverem verdes:

1. Abra `kibble-jk-api` e copie a URL pública.
2. Acesse `URL-DA-API/api/health`.
3. O navegador deve mostrar algo como:

```json
{"status":"ok","version":"2.0.0"}
```

4. Abra o serviço `kibble-jk-web` e clique na URL pública.
5. Digite um prompt e troque de modelo para confirmar que tokens e custos mudam.
6. Abra as ferramentas do navegador, guia **Console**, e confirme que não há erro de CORS.

As URLs são conectadas automaticamente pelo Blueprint:

- `VITE_API_URL` recebe a URL pública da API;
- `KIBBLE_CORS_ORIGINS` recebe a URL pública do frontend.

## 4. Entender o plano gratuito

O site estático permanece disponível. A API gratuita pode adormecer após um período sem tráfego; a primeira estimativa seguinte pode levar perto de um minuto. O Kibble aguarda até 75 segundos e mostra “Acordando servidor…” durante essa espera.

Não use serviços externos para manter a API artificialmente acordada. Para remover o cold start no futuro, você pode migrar a contagem para o navegador ou contratar uma instância que permaneça ativa.

## 5. Atualizações futuras

Depois do primeiro deploy, o fluxo normal é:

```powershell
git add -A
git commit -m "Descreva a alteração"
git push
```

O GitHub executará os testes. Quando eles passarem, o Render fará o novo deploy automaticamente.

## Solução de problemas

### `CORS` no console

Abra o serviço da API no Render, vá em **Environment** e confirme que `KIBBLE_CORS_ORIGINS` contém exatamente a URL HTTPS do frontend, sem caminho adicional.

### O site mostra que não conseguiu acessar o servidor

- Abra `/api/health` para acordar e verificar a API.
- Consulte a guia **Logs** do serviço da API.
- Confirme que `VITE_API_URL` no serviço web aponta para a URL HTTPS da API.
- Depois de alterar uma variável `VITE_*`, faça novo deploy do frontend; o Vite incorpora essas variáveis durante o build.

### Build Python falhou

Confirme que o Root Directory é `backend` e que o comando de build vem do `render.yaml`.

### Build do frontend falhou

Confirme que o Root Directory é `frontend`, o comando é `npm ci && npm run build` e o diretório publicado é `./dist`.
