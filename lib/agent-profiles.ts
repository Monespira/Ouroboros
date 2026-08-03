import { readFileSync } from "node:fs";
import path from "node:path";
import type { Specialist } from "@/lib/ai-knowledge";

const files: Record<Specialist, string> = {
  orchestrator: "agente-01-orquestrador-geral.md",
  knowledge: "agente-02-chefe-de-conhecimento.md",
  auditor: "agente-03-auditor-de-ia.md",
  brand: "agente-04-guardiao-da-marca.md",
  sales: "agente-05-comercial-e-crm.md",
  marketing: "agente-06-marketing.md",
  finance: "agente-07-financeiro.md",
  projects: "agente-08-projetos.md",
  operations: "agente-09-operacoes.md",
  security: "agente-10-seguranca.md",
};

const cache = new Map<string, string>();
const commercialGuideSpecialists = new Set<Specialist>([
  "orchestrator", "knowledge", "auditor", "sales", "finance", "projects", "operations",
]);
function readAgentFile(filename: string) {
  const existing = cache.get(filename);
  if (existing) return existing;
  const base = path.resolve(process.cwd(), "knowledge", "agents");
  const file = path.resolve(base, filename);
  if (!file.startsWith(`${base}${path.sep}`)) throw new Error("Perfil de agente fora da base permitida.");
  const content = readFileSync(file, "utf8").trim();
  if (!content.startsWith("# ") || content.length < 500) throw new Error(`Perfil de agente inválido: ${filename}`);
  cache.set(filename, content);
  return content;
}

export function agentProfile(specialist: Specialist) {
  const profile = readAgentFile(files[specialist]);
  const governanceFiles = specialist === "orchestrator"
    ? ["orquestrador-mapa-roteamento.md"]
    : specialist === "knowledge"
      ? ["mapeamento-documentos-agentes.md", "inventario-drive.md"]
      : specialist === "auditor"
        ? ["auditor-relatorio-cobertura.md", "mapeamento-documentos-agentes.md"]
        : [];
  const governance = governanceFiles.map((filename) => readAgentFile(filename)).join("\n\n");
  const governedProfile = governance ? `${profile}\n\n# Governança complementar\n\n${governance}` : profile;
  if (!commercialGuideSpecialists.has(specialist)) return governedProfile;
  const currentGuide = readFileSync(
    path.resolve(process.cwd(), "knowledge", "documents", "monespira-guia-comercial-operacional-v3-2026-07-21.md"),
    "utf8",
  ).trim();
  return `${governedProfile}\n\n# Atualização comercial vigente obrigatória\n\nO guia v3.0 abaixo substitui todas as versões anteriores quanto a oferta, preços, custos, capacidade, indicadores e regras operacionais. Em conflito, use o v3.0 e informe a fonte. Valores-chave: custo operacional-base R$ 476; plano Crescimento/Operação R$ 449/mês; hora avulsa R$ 100; urgência R$ 150/h.\n\n${currentGuide}`;
}

export function profileFiles() { return { ...files }; }
