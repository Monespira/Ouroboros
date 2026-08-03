import { readFileSync } from "node:fs";
import path from "node:path";
import { ingestRagDocument } from "../lib/ai-rag";

async function main() {
  const filename = "monespira-guia-comercial-operacional-v3-2026-07-21.md";
  const content = readFileSync(path.join(process.cwd(), "knowledge", "documents", filename), "utf8");
  const result = await ingestRagDocument({
    source: `knowledge/documents/${filename}`,
    title: "Monespira — Guia Comercial e Operacional v3.0",
    documentType: "official_commercial_guide",
    reliability: "fonte primaria vigente; substitui o Guia Comercial e Operacional v2.0",
    content,
  });
  process.stdout.write(`${filename}: ${result.duplicate ? "ja indexado" : `${result.chunks} chunks`}\n`);
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Falha de ingestao"}\n`);
  process.exitCode = 1;
});
