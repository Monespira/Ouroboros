export type Specialist = "orchestrator" | "knowledge" | "auditor" | "brand" | "sales" | "marketing" | "finance" | "projects" | "operations" | "security";

type KnowledgeChunk = {
  id: string;
  source: string;
  pages: string;
  specialists: Specialist[];
  keywords: string[];
  content: string;
  warning?: string;
};

const chunks: KnowledgeChunk[] = [
  {
    id: "brand-essence",
    source: "Monespira - Manual da Marca, v2.0, 17/07/2026",
    pages: "2-3",
    specialists: ["brand", "marketing", "sales", "knowledge"],
    keywords: ["marca", "posicionamento", "missao", "proposito", "publico", "mensagem", "tom", "copy"],
    content: "A Monespira desenvolve sites e solucoes digitais para pequenos e medios negocios. Combina rigor tecnico, cuidado estetico e comunicacao acessivel. Promessa: transformar ideias e negocios reais em experiencias digitais claras, confiaveis e preparadas para crescer. Priorizar landing pages, sites institucionais e solucoes de venda/agendamento. SaaS, portais, dashboards e sistemas sao projetos sob medida, nunca pacote de site com preco fixo. Tom acolhedor com autoridade, direto, didatico, artesanal, cuidadoso e confiante; evitar frieza, burocracia, jargao, improviso, arrogancia e promessas absolutas.",
  },
  {
    id: "brand-visual",
    source: "Monespira - Manual da Marca, v2.0, 17/07/2026",
    pages: "3-6",
    specialists: ["brand", "marketing", "knowledge", "auditor"],
    keywords: ["logo", "visual", "cor", "paleta", "fonte", "tipografia", "design", "espiral", "obelisco", "identidade"],
    content: "Grafia oficial: Monespira; wordmark pode usar MONESPIRA. Se a construcao nao for matematicamente exata, dizer 'inspirado na espiral aurea', sem afirmar exatidao. Paleta: verde floresta #3B4A3E, dourado bronze #C79A4B, marrom profundo #1C1712, bege papel #F5EEE1, bege secundario #ECE2D2, branco quente #FFFAF1 e cinza amarronzado #70685F. Tipografia: Lovelo somente na logo/wordmark oficial; Space Grotesk em titulos de interface, botoes, menus e rotulos; Inter em corpo, tabelas, formularios e textos longos. Priorizar contraste e acessibilidade, dourado apenas como destaque, efeitos discretos e estetica editorial precisa. Nao deformar o simbolo nem copiar marcas ou layouts de terceiros.",
  },
  {
    id: "client-briefing",
    source: "Monespira - Formulario de Informacoes do Cliente, v1.0, 17/07/2026",
    pages: "2-5",
    specialists: ["orchestrator", "sales", "projects", "operations", "security", "knowledge"],
    keywords: ["cliente", "briefing", "qualificar", "diagnostico", "requisito", "escopo", "prazo", "orcamento", "conteudo"],
    content: "A qualificacao deve levantar empresa e aprovadores; objetivo, CTA, publico, objecoes, prazo e criterio de sucesso; oferta, diferenciais, precos e materiais autorizados; paginas, referencias e estilos a evitar; integracoes, usuarios, permissoes e dados coletados; dominio, titularidade, contas, custos recorrentes e handoff; privacidade, acessibilidade, orcamento e informacao confidencial; materiais e decisoes pendentes. O formulario autoriza uso apenas para briefing e proposta.",
    warning: "Nunca solicitar ou registrar senhas no formulario. Acessos devem ser tratados por canal seguro e dados do cliente devem ser minimizados.",
  },
  {
    id: "commercial-catalog",
    source: "Monespira - Guia Comercial e Operacional, v3.0, 21/07/2026",
    pages: "1-2",
    specialists: ["sales", "finance", "projects", "operations", "orchestrator", "knowledge"],
    keywords: ["servico", "pacote", "landing", "site", "loja", "agenda", "saas", "mvp", "preco", "valor", "escopo", "seo"],
    content: "A oferta vigente possui tres pacotes: Fundacao/Landing (10 horas-pessoa, 1 a 2 semanas, validacao R$ 990, normal R$ 1.190), Estrutura/Site institucional (21 horas-pessoa, 2 a 4 semanas, validacao R$ 1.690, normal R$ 1.990) e Operacao/Catalogo ou agendamento (35 horas-pessoa, 4 a 6 semanas, ate R$ 150 de custos diretos, validacao R$ 2.490, normal R$ 2.990). Precos de validacao valem para os cinco primeiros projetos, com escopo fechado, conteudo pronto e autorizacao de portfolio. Produtos digitais complexos e sistemas amplos nao fazem parte da oferta vigente. Integracao com API existente parte de R$ 450; backend leve parte de R$ 990; migracao parte de R$ 300.",
    warning: "A Calculadora de Precos e Cenarios v3 prevalece e pode indicar valor maior. Confirmar escopo, custos atuais e aprovacao humana antes da proposta.",
  },
  {
    id: "commercial-finance",
    source: "Monespira - Guia Comercial e Operacional, v3.0, 21/07/2026",
    pages: "1, 3-5",
    specialists: ["finance", "sales", "operations", "auditor", "orchestrator", "knowledge"],
    keywords: ["margem", "custo", "hora", "financeiro", "pagamento", "entrada", "urgencia", "cambio", "rentabilidade", "manutencao"],
    content: "Premissas vigentes: remuneracao interna de validacao R$ 35 por hora-pessoa; servico avulso R$ 100/h; urgencia R$ 150/h ou adicional de 30% conforme o caso; reserva fiscal/pagamentos 10% da receita; reserva de risco 5% dos custos do projeto; resultado da empresa 0% nos precos de validacao e 10% no preco normal. Custo operacional mensal: R$ 0 antes do primeiro cliente, R$ 476 na base, R$ 806 na operacao expandida sem contabilidade e R$ 1.056 com contabilidade estimada. Pagamento ate R$ 5.000: 50%/50%; acima: 50%/30%/20%. Planos: Base gerenciada R$ 149 (R$ 119 com contas do cliente), Cuidado R$ 249 (R$ 199) e Crescimento/Operacao R$ 449 (R$ 349). Dominio e infraestrutura de backend sao separados.",
    warning: "Plano de Negocios e Plano Estrategico sao cenarios, nao realizados. A Calculadora v3 prevalece; exigir revisao contabil e aprovacao humana antes de compromisso financeiro.",
  },
  {
    id: "operational-process",
    source: "Monespira - Guia Comercial e Operacional, v3.0, 21/07/2026",
    pages: "1-5",
    specialists: ["operations", "projects", "sales", "orchestrator", "knowledge"],
    keywords: ["processo", "fluxo", "projeto", "kickoff", "homologacao", "publicacao", "entrega", "indicador", "manutencao", "garantia"],
    content: "Fluxo: qualificacao, briefing, estimativa pela Calculadora v3, proposta e contrato, entrada, kickoff, design e conteudo, desenvolvimento, homologacao, publicacao, quitacao e entrega de codigo/acessos. Sem manutencao, ha garantia de 30 dias apenas para defeitos contra o escopo; contas ficam com o cliente e demandas futuras custam R$ 100/h (urgencia R$ 150/h). Capacidade maxima inicial: tres projetos simultaneos. Metas: tres projetos pagos no T1, dois casos no T1, quatro manutencoes ate T2, dez no fim do ciclo e 100% de QA. Precos devem ser revistos apos os cinco primeiros projetos e trimestralmente.",
  },
  {
    id: "security-operations",
    source: "Monespira - Guia Comercial e Operacional + Formulario do Cliente, 17/07/2026",
    pages: "Guia 6-7; Formulario 2, 4-5",
    specialists: ["security", "operations", "auditor", "orchestrator", "knowledge"],
    keywords: ["senha", "acesso", "seguranca", "privacidade", "dado", "permissao", "conta", "handoff", "lgpd", "risco"],
    content: "Usar contas individuais, autenticacao em dois fatores e menor privilegio. Nao compartilhar senhas nem coloca-las em briefing, repositorio ou prompt. Sempre que possivel, dominio, banco, gateway e loja ficam em nome do cliente. Identificar dados coletados, tipos de usuario, permissoes, responsavel pelo handoff, informacoes confidenciais e tratamentos de alto risco (saude, criancas, pagamentos ou dados sensiveis).",
  },
  {
    id: "contract-draft",
    source: "Monespira - Minuta de Contrato - REVISAR, versao inicial, 17/07/2026",
    pages: "1-6",
    specialists: ["orchestrator", "auditor", "security", "operations", "projects", "knowledge"],
    keywords: ["contrato", "clausula", "juridico", "rescisao", "confidencial", "propriedade", "lgpd", "aceite", "responsabilidade", "foro"],
    content: "A minuta organiza objeto, escopo e mudancas por aceite escrito; obrigacoes das partes; dependencias de cronograma; pagamento e quitacao; terceiros; propriedade intelectual; confidencialidade; papeis de controlador e operador; garantia; aceite; rescisao; responsabilidade; comunicacoes e Anexo I comercial. Permanecem pendentes validacao de qualificacao juridica e tributaria, inadimplencia, cancelamento, devolucao, propriedade intelectual, LGPD, limites de responsabilidade, foro, assinatura e adequacao consumerista.",
    warning: "DOCUMENTO EM REVISAO. Nao usar como contrato final, nao emitir parecer juridico e nao preencher lacunas por inferencia. Toda aplicacao exige validacao de advogado e contador.",
  },
];

const routing: Array<{ specialist: Specialist; keywords: string[] }> = [
  { specialist: "security", keywords: ["senha", "vulnerabilidade", "seguranca", "lgpd", "privacidade", "permissao", "incidente", "dado sensivel"] },
  { specialist: "brand", keywords: ["marca", "logo", "paleta", "tipografia", "identidade visual", "tom de voz"] },
  { specialist: "finance", keywords: ["margem", "custo", "financeiro", "caixa", "rentabilidade", "preco interno"] },
  { specialist: "sales", keywords: ["proposta", "venda", "lead", "cliente", "crm", "pacote", "preco"] },
  { specialist: "marketing", keywords: ["campanha", "marketing", "conteudo", "aquisicao", "social"] },
  { specialist: "projects", keywords: ["projeto", "escopo", "prazo", "backlog", "cronograma", "entrega"] },
  { specialist: "operations", keywords: ["processo", "operacao", "capacidade", "manutencao", "handoff", "indicador"] },
  { specialist: "auditor", keywords: ["auditar", "validar", "fonte", "conflito", "contrato", "compliance"] },
  { specialist: "knowledge", keywords: ["documento", "conhecimento", "fonte", "versao", "informacao"] },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function routeSpecialist(requested: Specialist, message: string): Specialist {
  if (requested !== "orchestrator") return requested;
  const normalized = normalize(message);
  let best: { specialist: Specialist; score: number } = { specialist: "orchestrator", score: 0 };
  for (const route of routing) {
    const score = route.keywords.reduce((total, keyword) => total + (normalized.includes(normalize(keyword)) ? 1 : 0), 0);
    if (score > best.score) best = { specialist: route.specialist, score };
  }
  return best.specialist;
}

export function retrieveKnowledge(specialist: Specialist, message: string) {
  const normalized = normalize(message);
  return chunks
    .filter((chunk) => chunk.specialists.includes(specialist) || specialist === "orchestrator")
    .map((chunk) => ({ chunk, score: chunk.keywords.reduce((total, keyword) => total + (normalized.includes(normalize(keyword)) ? 3 : 0), 0) + (chunk.specialists[0] === specialist ? 1 : 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ chunk }) => chunk);
}

export function formatKnowledge(chunksToUse: ReturnType<typeof retrieveKnowledge>) {
  if (!chunksToUse.length) return "Nenhum trecho documental interno foi selecionado para esta pergunta.";
  return chunksToUse.map((chunk, index) => [
    `[FONTE ${index + 1}] ${chunk.source}, paginas ${chunk.pages}`,
    chunk.content,
    chunk.warning ? `ALERTA: ${chunk.warning}` : "",
  ].filter(Boolean).join("\n")).join("\n\n");
}

export function knowledgeSources(chunksToUse: ReturnType<typeof retrieveKnowledge>) {
  return chunksToUse.map((chunk) => ({ id: chunk.id, source: chunk.source, pages: chunk.pages, warning: chunk.warning ?? null }));
}
