# Mapa de roteamento do Orquestrador-geral

| Tipo de solicitação | Agente destino | Critério de decisão | Risco | Exige aprovação humana? |
|---|---|---|---|---|
| Localizar, resumir ou versionar documento | Chefe de Conhecimento | Não altera conteúdo vigente | Baixo | Não |
| Promover versão como vigente | Chefe de Conhecimento + Auditor de IA | Muda fonte oficial, regra, preço ou política | Alto | Sim |
| Conflito entre documentos | Auditor de IA + Chefe de Conhecimento | Fontes incompatíveis ou mesma autoridade | Alto | Sim |
| Roteamento ou decomposição de tarefa | Orquestrador-geral | Planejamento interno sem ação externa | Baixo | Não |
| Revisão de logo, cor, tipografia ou tom | Guardião da Marca | Aplicação de regra existente | Médio | Não para rascunho; sim para publicação/alteração |
| Alterar identidade ou posicionamento | Guardião da Marca | Muda sistema de marca | Alto | Sim |
| Qualificar lead ou organizar briefing | Comercial e CRM | Dados suficientes, sem promessa | Baixo | Não |
| Redigir follow-up ou proposta preliminar | Comercial e CRM | Apenas rascunho baseado em fontes vigentes | Médio | Sim antes do envio |
| Enviar mensagem, proposta ou cobrança | Comercial e CRM | Ação externa | Alto | Sim |
| Definir desconto, preço ou parcelamento | Financeiro + Comercial e CRM | Impacta margem/receita | Alto | Sim |
| Calcular margem ou cenário | Financeiro | Premissas explícitas, sem movimentação | Médio | Não |
| Pagar, comprar, contratar ou movimentar dinheiro | Financeiro | Ação financeira irreversível | Alto | Sim |
| Criar pauta ou campanha | Marketing + Guardião da Marca | Rascunho interno | Médio | Não |
| Publicar conteúdo ou comprar mídia | Marketing | Ação externa/reputacional/financeira | Alto | Sim |
| Planejar projeto aprovado | Projetos | Escopo e critérios de aceite existentes | Baixo | Não |
| Alterar escopo, prazo ou entregável | Projetos + Comercial + Financeiro | Impacto material | Alto | Sim |
| Executar QA ou checklist | Projetos + Segurança | Verificação interna | Médio | Não |
| Deploy em produção | Projetos + Segurança | Publicação e risco operacional | Alto | Sim |
| Priorizar fila interna | Operações | Regras e capacidade aprovadas | Baixo | Não |
| Replanejar compromisso com cliente | Operações + Projetos | Altera prazo/expectativa externa | Alto | Sim |
| Classificar manutenção | Operações + Projetos | Garantia, franquia, excedente ou novo projeto | Médio | Sim se houver cobrança/urgência |
| Criar ou alterar permissão | Segurança | Controle de acesso | Alto | Sim |
| Avaliar dado pessoal/sensível | Segurança + Auditor de IA | Privacidade, LGPD ou vazamento | Alto | Sim |
| Incidente de segurança | Segurança + Auditor de IA + Orquestrador | Confidencialidade, integridade ou disponibilidade afetada | Alto | Sim |
| Pedido jurídico/contratual | Orquestrador + Auditor de IA + Segurança | Não existe agente jurídico validado; minuta está em revisão | Alto | Sim; encaminhar profissional |
| Ativar modelo/API cloud | Segurança + Financeiro + Auditor | Envia dados e cria custo | Alto | Sim |
| Excluir dado, documento ou memória | Segurança + Chefe de Conhecimento | Ação destrutiva/retentiva | Alto | Sim |
| Resposta factual sem fonte suficiente | Auditor de IA | Confiança insuficiente ou lacuna | Médio | Sim se material; caso contrário declarar lacuna |
