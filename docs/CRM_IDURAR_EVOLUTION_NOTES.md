# Evolução comercial do CRM

O IDURAR foi consultado somente como referência conceitual pública. Nenhum código, dependência ou arquivo externo foi incorporado ao Ouroboros.

## Alterações planejadas

- `CustomerRecord`: cadastro comercial consolidado, com origem legada explícita e contatos internos de ID estável.
- `ProductRecord`: catálogo local com SKU, unidade, moeda, preço em centavos e imposto em pontos-base.
- `QuoteRecord` e `QuoteItem`: propostas numeradas, versionadas, com validade, estados e totais imutáveis em centavos.
- Funções puras para migração, numeração, cálculo e transição de estado.

`AccountRecord` e `ContactRecord` serão mantidos durante a janela de rollback. A migração é aditiva e idempotente: acrescenta `customers`, `products` e `quotes` em `crmExtras.crmDomain`, sem remover as chaves legadas do `workspace.json`. Não há breaking change planejado no formato existente.
