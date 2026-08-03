# Ouroboros

Aplicação local da Monespira para projetos, tarefas, reuniões, CRM, colaboração e agentes de IA privados.

## Arquitetura local

```text
app/          interface Next.js e rotas locais da API
components/   componentes React
lib/          autenticação e base de conhecimento das IAs
public/       identidade visual do Ouroboros
data/         workspace, SQLite, Chroma e datasets locais (não versionados)
```

Não existe deploy em nuvem, API serverless ou banco PostgreSQL. O host executa o Next.js, persiste o workspace em `data/workspace.json` e consulta o Ollama em `127.0.0.1:11434`.

## Configuração

```powershell
Copy-Item .env.example .env
npm install
```

Defina senhas fortes e uma chave de sessão longa no `.env`:

```env
SCRUB_SESSION_SECRET=troque-por-uma-chave-aleatoria-longa
SCRUB_ZIMBRA_PASSWORD=troque-a-senha-do-zimbra
SCRUB_CALLISTO_PASSWORD=troque-a-senha-do-callisto
SCRUB_PARTICIPANT_PASSWORD=troque-a-senha-dos-participantes
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_EMBED_MODEL=nomic-embed-text
CHROMA_URL=http://127.0.0.1:8001
AI_WEB_ALLOWED_HOSTS=www.gov.br,gov.br,ibge.gov.br,www.ibge.gov.br,developer.mozilla.org,nextjs.org,nodejs.org
```

Nunca versione o `.env` nem `data/workspace.json`.

## Execução

Use `Iniciar Ouroboros.exe` para iniciar Next.js, Chroma e o watcher documental. Fechar a janela encerra os processos iniciados pelo launcher.

Alternativamente:

```powershell
npm run dev -- --port 5174
```

Acesso no host: `http://localhost:5174`.

## Radmin VPN

Participantes conectados à mesma rede Radmin acessam:

```text
http://IP_RADMIN_DO_HOST:5174
```

Execute uma vez `Configurar Firewall Ouroboros.cmd` como administrador. A regra libera TCP `5174` somente para a faixa Radmin `26.0.0.0/8`.

## IA local

O Ollama deve estar ativo no computador host e o modelo configurado precisa estar instalado:

```powershell
ollama list
ollama pull qwen2.5:7b
```

### Memória persistente

Conversas, mensagens, contagem estimada de tokens, resumos e feedback ficam em `data/ai-memory.sqlite`. A interface lista, recupera e apaga conversas do usuário. Ao ultrapassar `AI_SUMMARY_TOKEN_THRESHOLD`, o Ollama cria um resumo persistente e as respostas seguintes recebem o resumo mais as últimas mensagens.

### RAG evolutivo

O Chroma permanece em `127.0.0.1:8001`; embeddings são gerados localmente com `nomic-embed-text`. Documentos `.md`, `.txt` ou `.json` colocados em `knowledge/inbox` são indexados pelo watcher. Também existe `POST /api/ai/knowledge` para usuários administradores. Chunks são deduplicados, versionados e nunca sobrescritos; contradições devem indicar `supersedesId`. Cada resposta registra os IDs recuperados para auditoria.

Feedback negativo acompanhado de comentário cria uma correção vetorial marcada como pendente de revisão. Feedback positivo entra no conjunto elegível para fine-tuning somente quando o usuário marcou o opt-in da conversa.

### Perfis dos agentes

Os dez perfis operacionais ficam em `knowledge/agents/agente-*.md`. Eles são carregados diretamente pela rota de IA e definem papel, escopo de decisão, conhecimento essencial, fontes, escalonamento e integração técnica. Os documentos de roteamento, inventário, cobertura e mapeamento complementam Orquestrador, Chefe de Conhecimento e Auditor.

Para reconverter os DOCX mantidos pela Monespira e reindexar os perfis:

```powershell
python scripts/docx-to-markdown.py "PASTA_DOS_DOCX" knowledge/agents
npm run knowledge:agents
```

Os DOCX originais não são alterados.

Para materializar os dez perfis como modelos Ollama locais persistentes:

```powershell
npm run agents:create-local
```

Cada modelo `monespira-*:latest` incorpora seu perfil operacional e reutiliza os mesmos pesos do `qwen2.5:7b`. A aplicação escolhe o modelo do especialista roteado. Depois da criação, inferência e memória funcionam sem internet; não há fallback para nuvem.

O `knowledge/documents/monespira-guia-comercial-operacional-v3-2026-07-21.md` foi convertido do PDF oficial de 21/07/2026 e é injetado obrigatoriamente nos agentes de orquestração, conhecimento, auditoria, comercial, financeiro, projetos e operações. Ele substitui o guia v2 em oferta, preços, custos, capacidade e indicadores. Para reindexá-lo no RAG local:

```powershell
npm run knowledge:business
```

### Fine-tuning supervisionado

Prepare o lote com:

```powershell
npm run fine-tune:prepare
```

O job anonimiza e-mails, telefones, CPF e padrões de segredo, gera JSONL em `data/fine-tuning`, registra a execução como `awaiting_human_approval` e exige no mínimo 200 exemplos por padrão. Ele nunca envia dados nem dispara treinamento. Um responsável deve revisar manualmente fonte, licença, privacidade, qualidade e equilíbrio do dataset antes de autorizar qualquer treinador LoRA/API separado. O hardware atual é adequado para inferência, mas não foi validado para fine-tuning local do modelo de 7B.

Após a revisão humana, valide o checkpoint (ainda sem disparar treinamento):

```powershell
npm run fine-tune:approve -- ID_DA_EXECUCAO NOME_DO_APROVADOR
```

## Validação

```powershell
npm run typecheck
npm run build
```
