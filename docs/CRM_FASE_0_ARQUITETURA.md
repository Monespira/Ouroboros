# CRM Ouroboros — Fase 0

## Stack e arquitetura encontradas

- Next.js 15 App Router, React 19, TypeScript estrito e Tailwind CSS 4.
- Rotas HTTP em `app/api`; não há ORM, migrations de banco ou banco relacional ativo.
- Autenticação local por cookie `HttpOnly` assinado com HMAC em `lib/auth.ts`.
- Estado operacional compartilhado em `data/workspace.json`, exposto por `/api/workspace` com revisão otimista e gravação por arquivo temporário.
- CRM cliente em `components/crm/crm-workspace.tsx`, com modelos legados e extensões em `crmExtras`.
- Testes Node/TypeScript e E2E Playwright; lint é o próprio `tsc --noEmit`.

## Funcionalidades existentes

Prospecção, score 0–10, qualificação a partir de 7, funil, alertas de prazo, atividades, metas, dashboard, scripts, tarefas, campanhas, segmentos, automações simples, integrações configuráveis, contatos e timeline.

## Lacunas para o PRD

- Lead, empresa, contato e oportunidade ainda coexistem em formatos sobrepostos.
- Não existe tenant persistido nem autorização por objeto/campo/registro no backend.
- Auditoria cobre movimentações específicas, não toda mutação crítica.
- Não existem catálogo, itens, price book, proposta versionada ou aprovação.
- O JSON exige leitura/escrita integral e não oferece transações multiobjeto ou consultas paginadas.
- Não existem importação com prévia, fila de duplicidades, mesclagem ou jobs assíncronos.

## Riscos de migração

1. Registros de `crmExtras.prospects` podem representar lead ou negociação; a classificação precisa de relatório de ambiguidade.
2. Alterar o formato atual diretamente quebraria clientes em execução e rollback.
3. RBAC somente no frontend seria contornável; toda API futura deve autorizar no servidor.
4. Concorrência no arquivo JSON pode sobrescrever alterações entre revisões conflitantes.
5. Credenciais e campos financeiros exigem uma persistência segura antes de escala externa.

## Decisões

- Introduzir `crmDomain` versionado de forma aditiva; formatos antigos permanecem durante a janela de rollback.
- Toda entidade v2 carrega `workspaceId`, timestamps e soft delete.
- Papéis usam códigos estáveis; rótulos podem mudar sem quebrar autorização.
- Auditoria é append-only no domínio e mascara valores sensíveis.
- A migração inicial é dry-run por padrão, idempotente e produz relatório de ambiguidades.

## Arquivos da primeira fase

- `lib/crm/domain.ts`: entidades e estado v2.
- `lib/crm/rbac.ts`: papéis, permissões e escopo.
- `lib/crm/migration.ts`: backfill aditivo e reconciliação.
- `tests/crm-domain.test.ts`: tenant, RBAC, migração e auditoria.
- `docs/CRM_MODELO_DE_DADOS.md`: dicionário inicial.
- `docs/CRM_MIGRACAO_RUNBOOK.md`: dry-run, aplicação e rollback.

## ADR-001: persistência intermediária

O repositório não possui banco ativo. A Fase 1 cria o domínio e contratos independentes de persistência, mas mantém o adaptador JSON atual. Antes de ativar multi-tenant externo, deve-se escolher um banco transacional, criar migrations reversíveis e mover autorização/auditoria para consultas e transações do servidor.
