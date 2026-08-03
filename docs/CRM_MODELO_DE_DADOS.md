# CRM v2 — dicionário inicial

Todas as entidades possuem `id`, `workspaceId`, `createdAt`, `updatedAt` e `deletedAt`. `deletedAt` implementa exclusão lógica.

| Entidade | Finalidade | Relações principais |
|---|---|---|
| Lead | Prospect ainda não convertido | campanha, atividades, tarefas e referências após conversão |
| Account | Organização mestre | contatos, oportunidades e atividades |
| Contact | Pessoa vinculada à empresa | empresa e papéis em oportunidades |
| Opportunity | Negociação específica | empresa, contatos, itens e propostas |
| Activity | Interação concluída ou nota | relação polimórfica por objeto/registro |
| Task | Próxima ação pendente | relação polimórfica e responsável |
| AuditLog | Antes/depois de mutações críticas | ator, origem e correlação |

Os códigos de status e papel são estáveis. Labels, etapas e probabilidades serão configurações versionadas do workspace.
