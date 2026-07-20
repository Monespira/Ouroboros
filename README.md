# SCRUB

Aplicacao full stack unificada para gerenciamento de ideias, projetos, tarefas, reunioes e colaboracao com fluxo Scrum.

## Estrutura

```text
app/          interface Next.js
components/   componentes React
pages/api/    entrada serverless da API Express
server/dist/  backend Express existente
prisma/       schema unico do banco PostgreSQL
public/       arquivos estaticos
```

Frontend e backend usam o mesmo projeto, o mesmo `package.json` e o mesmo deploy. As rotas da API continuam disponiveis em `/api/*`.

## Desenvolvimento

```powershell
npm install
npm run dev
```

Acesse `http://localhost:3000`. Verifique a API em `http://localhost:3000/api/health`.

## Acesso pela Radmin VPN

O servidor escuta todas as interfaces. No computador host, abra o `Iniciar Ouroboros.exe` e mantenha a janela aberta. Os participantes conectados à mesma rede Radmin acessam:

```text
http://IP_RADMIN_DO_HOST:5174
```

O estado do workspace é centralizado em `data/workspace.json` no host e sincronizado entre navegadores. Essa pasta não deve ser compartilhada nem versionada. Execute uma vez `Configurar Firewall SCRUB.cmd` e aceite a solicitação de administrador; a regra criada aceita TCP 5174 somente da faixa da Radmin (`26.0.0.0/8`).

## Validacao

```powershell
npm run typecheck
npm run build
```

## Deploy na Vercel

1. Importe a raiz deste repositorio na Vercel.
2. Mantenha `Framework Preset` como `Next.js`.
3. Nao configure `Root Directory`.
4. Cadastre as variaveis listadas abaixo no projeto.
5. Execute o deploy.

O `vercel.json` da raiz contem a configuracao necessaria.

## Variaveis obrigatorias

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco?sslmode=require
SCRUB_SESSION_SECRET=use-uma-chave-aleatoria-longa
SCRUB_ZIMBRA_PASSWORD=senha-exclusiva-do-zimbra
SCRUB_CALLISTO_PASSWORD=senha-exclusiva-do-callisto
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
AI_WEB_ALLOWED_HOSTS=www.gov.br,gov.br,ibge.gov.br,www.ibge.gov.br,developer.mozilla.org,nextjs.org,nodejs.org
```

## IAs locais

Instale o Ollama no computador host, baixe o modelo deliberadamente pelo administrador e inicie o serviço:

```powershell
ollama pull qwen2.5:7b
ollama serve
```

A aplicação nunca baixa modelos ou arquivos. A consulta web opcional aceita somente HTTPS nos domínios de `AI_WEB_ALLOWED_HOSTS`, bloqueia destinos privados, redirecionamentos, anexos, conteúdo binário e respostas acima de 256 KB. Altere a lista de domínios apenas após revisão administrativa.

Nunca versionar o arquivo `.env`.

Sem as variaveis de senha, o ambiente local usa temporariamente `Zimbra` e `Callisto` como suas respectivas senhas. Em producao, configure senhas fortes na Vercel.
