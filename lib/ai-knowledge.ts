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
    source: "Monespira - Guia Comercial e Operacional, v2.0, 17/07/2026",
    pages: "2-5",
    specialists: ["sales", "finance", "projects", "operations", "orchestrator", "knowledge"],
    keywords: ["servico", "pacote", "landing", "site", "loja", "agenda", "saas", "mvp", "preco", "valor", "escopo", "seo"],
    content: "Linhas: Fundacao (landing page, normal R$ 1.190; lancamento R$ 990 para ate cinco clientes selecionados; ate 5 horas-pessoa), Estrutura (site institucional, normal a partir de R$ 2.190; lancamento R$ 1.690 com escopo restrito; ate 18 horas-pessoa), Operacao (venda, catalogo ou agendamento, lancamento R$ 2.990; normal a partir de R$ 3.990; ate 40 horas-pessoa) e SaaS/MVP sob medida (descoberta R$ 600 a R$ 900; desenvolvimento a partir de R$ 6.900; referencia ate 80 horas-pessoa). Pacotes incluem dominio padrao de ate R$ 100 e 12 meses de hospedagem gerenciada; limites adicionais variam por linha. SEO basico nao promete posicao no Google e nao inclui conteudo continuo, backlinks, pesquisa aprofundada, Ads ou gestao mensal.",
    warning: "Valores sao premissas de trabalho com revisao trimestral; confirmar versao, escopo, horas, custos atuais e margem antes de apresentar proposta.",
  },
  {
    id: "commercial-finance",
    source: "Monespira - Guia Comercial e Operacional, v2.0, 17/07/2026",
    pages: "2, 4, 6-8",
    specialists: ["finance", "sales", "operations", "auditor", "orchestrator", "knowledge"],
    keywords: ["margem", "custo", "hora", "financeiro", "pagamento", "entrada", "urgencia", "cambio", "rentabilidade", "manutencao"],
    content: "Premissas iniciais: hora interna R$ 30 por hora-pessoa; hora avulsa R$ 80 com minimo de uma hora; urgencia R$ 120/h mediante disponibilidade; reserva fiscal/financeira 10% da receita; margem-alvo minima 15%; capacidade inicial um projeto pago por mes; cambio interno R$ 5,50/US$; custos fixos planejados R$ 400/mes. Se o preco de lancamento nao preservar 15% de margem, reduzir escopo, nunca ocultar horas ou custos. Pagamento: ate R$ 5.000, 50% na contratacao e 50% antes da publicacao; acima disso, 50%/30%/20%. Planos mensais: Base R$ 149, Cuidado R$ 249, Crescimento/Operacao R$ 579, com franquias e prazos distintos.",
    warning: "Reserva fiscal e precos sao provisorios. Exigir revisao contabil, dados atuais e aprovacao humana antes de decisao financeira ou compromisso comercial.",
  },
  {
    id: "operational-process",
    source: "Monespira - Guia Comercial e Operacional, v2.0, 17/07/2026",
    pages: "7-9",
    specialists: ["operations", "projects", "sales", "orchestrator", "knowledge"],
    keywords: ["processo", "fluxo", "projeto", "kickoff", "homologacao", "publicacao", "entrega", "indicador", "manutencao", "garantia"],
    content: "Fluxo: qualificacao, briefing, estimativa, proposta e contrato, kickoff, design e conteudo, desenvolvimento, homologacao, publicacao e entrega. Uma rodada consolidada e regra padrao dos pacotes. Garantia de 30 dias cobre defeitos contra o escopo, nao novas funcionalidades. Manutencao nao acumula horas; nova pagina, redesign, backend ou integracao exige orcamento separado. Indicadores iniciais: margem minima 15%, retrabalho nao cobrado abaixo de 10% das horas e prazo de landing de 1 a 2 semanas com conteudo pronto. Revisar precos trimestralmente e substituir estimativas por tempos observados apos cinco projetos.",
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
