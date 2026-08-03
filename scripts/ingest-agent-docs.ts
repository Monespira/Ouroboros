import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ingestRagDocument } from "../lib/ai-rag";

async function main() {
  const directory = path.join(process.cwd(), "knowledge", "agents");
  const files = readdirSync(directory).filter((name) => name.endsWith(".md")).sort();
  for (const filename of files) {
    const content = readFileSync(path.join(directory, filename), "utf8");
    const governance = !filename.startsWith("agente-");
    const result = await ingestRagDocument({
      source: `knowledge/agents/${filename}`,
      title: content.match(/^#\s+(.+)$/m)?.[1] || filename,
      documentType: governance ? "agent_governance" : "agent_profile",
      reliability: "documento fornecido pela Monespira - revisar vigência das fontes citadas",
      content,
    });
    process.stdout.write(`${filename}: ${result.duplicate ? "já indexado" : `${result.chunks} chunks`}\n`);
  }
}

void main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : "Falha de ingestão"}\n`); process.exitCode=1; });
