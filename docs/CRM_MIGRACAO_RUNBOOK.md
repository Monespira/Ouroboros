# CRM v2 — migração e rollback

## Comandos

```powershell
# Inspeção sem escrita (padrão)
npm run crm:migrate -- --workspace-id ouroboros-local

# Aplicação explícita, com backup e troca atômica
npm run crm:migrate -- --workspace-id ouroboros-local --apply
```

O identificador é obrigatório para evitar associação ao tenant errado. Sem `--apply`, o comando somente imprime o relatório.

## Dry-run

1. Fazer backup de `data/workspace.json` enquanto o servidor estiver parado.
2. Executar o migrador com `apply: false`.
3. Revisar contagens, duplicidades e `ambiguousProspectIds`.
4. Validar totais estimados/fechados e registros órfãos.

## Aplicação

1. Confirmar revisão atual do workspace.
2. Executar o mesmo lote com `apply: true` e um `workspaceId` válido.
3. Persistir `crmDomain` junto aos campos legados, sem removê-los.
4. Registrar checkpoint, versão do schema, ator e correlação.

## Rollback

Enquanto a feature flag v2 não for definitiva, desativar a leitura de `crmDomain` restaura o fluxo antigo. Não apagar campos legados. Para restauração física, parar o servidor, guardar o arquivo com falha para auditoria e restaurar o backup verificado.

## Limite conhecido

O arquivo JSON não garante transações multiusuário comparáveis a um banco. Migração para persistência relacional é pré-requisito para operação multi-tenant externa.
