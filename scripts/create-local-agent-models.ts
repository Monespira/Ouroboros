import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { agentProfile, profileFiles } from "../lib/agent-profiles";
import { agentModel } from "../lib/agent-models";
import type { Specialist } from "../lib/ai-knowledge";

const ollama = process.env.OLLAMA_EXECUTABLE
  || "C:\\Users\\Zimbra\\AppData\\Local\\Programs\\Ollama\\ollama.exe";
const baseModel = process.env.OLLAMA_MODEL || "qwen2.5:7b";
const outputDirectory = path.resolve(process.cwd(), "data", "ollama-agents");

function modelfile(specialist: Specialist) {
  const profile = agentProfile(specialist).replaceAll('"""', '\\"\\"\\"');
  return [
    `FROM ${baseModel}`,
    "PARAMETER temperature 0.2",
    "PARAMETER num_ctx 16384",
    "PARAMETER repeat_penalty 1.08",
    'SYSTEM """',
    "Você é uma IA local e privada da Monespira. Trabalhe somente como o agente definido abaixo.",
    "Use os documentos incorporados como fonte interna versionada. Não invente dados nem execute ações externas.",
    "Quando houver conflito, a atualização comercial v3.0 de 21/07/2026 prevalece sobre versões anteriores.",
    "Decisões financeiras, jurídicas, de segurança ou publicação exigem aprovação humana.",
    "Responda em português do Brasil com diagnóstico, recomendação, risco, próxima ação e fontes utilizadas.",
    "",
    profile,
    '"""',
    "",
  ].join("\n");
}

function main() {
  mkdirSync(outputDirectory, { recursive: true });
  for (const specialist of Object.keys(profileFiles()) as Specialist[]) {
    const filename = path.join(outputDirectory, `${specialist}.Modelfile`);
    writeFileSync(filename, modelfile(specialist), "utf8");
    const model = agentModel(specialist);
    process.stdout.write(`Criando ${model}...\n`);
    const result = spawnSync(ollama, ["create", model, "-f", filename], { stdio: "inherit", windowsHide: true });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Falha ao criar ${model} (codigo ${result.status ?? "desconhecido"}).`);
  }
  process.stdout.write("Dez agentes locais criados e persistidos no Ollama.\n");
}

main();
