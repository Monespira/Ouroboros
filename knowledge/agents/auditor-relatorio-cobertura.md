# Relatório de auditoria de cobertura documental

## Boa cobertura

- Guardião da Marca: Manual da Marca, Guia do Kit, Perfil e apresentação nativa definem identidade, voz, posicionamento e aplicação com boa consistência.

- Comercial e CRM: Guia Comercial, Calculadora v2, Kit de Atendimento, Formulário e Blueprint CRM cobrem oferta, preços, pipeline, proposta e aprovações.

- Projetos: Manual Mestre SDD/GSD, AGENTS corrigido, regras do Codex, documentos-base e checklists cobrem escopo, artefatos, QA e handoff.

- Orquestrador-geral e Auditor de IA: PROMPT MESTRE define hierarquia de autoridade, aprovações, rastreabilidade, RAG e limites de ação.

## Cobertura parcial

- Chefe de Conhecimento: arquitetura de tabelas e pipeline RAG está descrita, mas não há convenção oficial de namespace/tags, nomes de coleções, política de chunking, ACL implementada ou evidência de testes de recuperação.

- Financeiro: pricing e cenários estão detalhados, porém custos reais, caixa, recebíveis, tributos e fechamentos ainda não foram preenchidos/validados.

- Operações: existem processos, SLAs de manutenção e modelos de indicadores, mas não há histórico operacional real.

## Lacunas críticas

- Segurança/LGPD: falta política aprovada, matriz de acesso, inventário de dados, bases legais, retenção, ROPA, plano formal de incidentes, RPO/RTO, evidência de backup/restauração e hardening validado.

- Jurídico: a única minuta está marcada “REVISAR”; não existe contrato aprovado, política de privacidade, termos, DPA ou orientação jurídica final.

- Marketing: falta playbook de campanhas, calendário editorial vigente, orçamento de mídia, histórico de CAC/ROAS, critérios de experimentação e política de publicação.

- Dados empresariais: CNPJ, e-mail, WhatsApp, site, endereço e responsáveis permanecem como campos `[PREENCHER]` em modelos do kit.

- Arquitetura de agentes: o PROMPT MESTRE descreve uma rede granular maior; esta entrega consolida 10 agentes conforme a solicitação atual. A decisão de tornar os 10 agentes a arquitetura canônica deve ser registrada formalmente.

## Conflitos e documentos que exigem revisão humana

1. Business Plan.xlsm versus Guia Comercial/Calculadora: preços, valor/hora e custos fixos divergentes. Tratar Business Plan como cenário até reconciliação.

2. Guia Comercial usa R$ 400/mês como custo fixo planejado; Controle de Custos Corrigido registra apenas R$ 5,04/mês de domínio e demais itens zerados. Completar custos antes de usar o controle como “real”.

3. AGENTS.md antigo permite Bevan como fallback; AGENTS.md corrigido determina Space Grotesk e Lovelo apenas na arte licenciada. Excluir versão antiga da base vigente.

4. Pasta “Arquivo — preços anteriores” contém quatro versões históricas; não usar em propostas novas.

5. Apresentação v4, biblioteca de slides e materiais de impressão são referências rasterizadas; não tratar como fonte textual primária nem totalmente editável.

6. Minuta de Contrato — REVISAR não pode ser usada sem advogado e contador.

7. Plano Estratégico e Business Plan contêm metas e projeções futuras; não registrar como resultados realizados.

8. Fontes de custo/preço externas foram consultadas em 17/07/2026 e os próprios documentos exigem confirmação antes de contratar ou enviar proposta.

## Documentos protegidos ou sem permissão

Nenhum arquivo listado retornou erro explícito de leitura. O status de visibilidade do conector não substitui uma auditoria de permissões; revisar compartilhamentos e menor privilégio antes da ingestão automática.

## Recomendação de entrada no RAG

- Vigente: PROMPT MESTRE, Manual da Marca, Guia Comercial, Calculadora v2, Comece Aqui, Manual Mestre, AGENTS corrigido, Blueprint CRM, Kit/Formulário de Atendimento, Plano Estratégico com tag de planejamento e Kit de Gestão como modelo.

- Condicional: Business Plan e Controle de Custos com tags `cenario`/`incompleto`; minuta com acesso restrito e `nao-validado`.

- Excluir da base vigente: AGENTS antigo, pasta de preços anteriores e XLSM de custos marcado “[ARQUIVO]”.

- Referência visual: slides rasterizados e materiais de impressão em índice separado, sem prioridade de recuperação textual.
