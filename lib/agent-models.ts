import type { Specialist } from "@/lib/ai-knowledge";

const modelNames: Record<Specialist, string> = {
  orchestrator: "monespira-orquestrador:latest",
  knowledge: "monespira-conhecimento:latest",
  auditor: "monespira-auditor:latest",
  brand: "monespira-marca:latest",
  sales: "monespira-comercial:latest",
  marketing: "monespira-marketing:latest",
  finance: "monespira-financeiro:latest",
  projects: "monespira-projetos:latest",
  operations: "monespira-operacoes:latest",
  security: "monespira-seguranca:latest",
};

export function agentModel(specialist: Specialist) {
  return modelNames[specialist];
}

export function agentModels() {
  return { ...modelNames };
}
