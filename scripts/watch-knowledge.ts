import { mkdirSync, readFileSync, watch } from "node:fs";
import path from "node:path";
import { ingestRagDocument } from "../lib/ai-rag";

const inbox = path.join(process.cwd(), "knowledge", "inbox");
mkdirSync(inbox, { recursive: true });
const allowed = new Set([".txt", ".md", ".json"]);
const processing = new Set<string>();

async function ingest(filename: string) {
  const fullPath = path.resolve(inbox, filename);
  if (!fullPath.startsWith(`${path.resolve(inbox)}${path.sep}`) || !allowed.has(path.extname(filename).toLowerCase()) || processing.has(fullPath)) return;
  processing.add(fullPath);
  try {
    const content = readFileSync(fullPath, "utf8");
    const result = await ingestRagDocument({ source: `inbox:${filename}`, title: path.basename(filename), documentType: "watched_document", reliability: "não classificada - requer revisão", content });
    process.stdout.write(`${new Date().toISOString()} ${filename}: ${result.duplicate ? "duplicado" : `${result.chunks} chunks`}\n`);
  } catch (error) { process.stderr.write(`${filename}: ${error instanceof Error ? error.message : "falha"}\n`); }
  finally { processing.delete(fullPath); }
}

watch(inbox, { persistent: true }, (_, filename) => { if (filename) setTimeout(() => void ingest(filename), 500); });
process.stdout.write(`Watcher ativo em ${inbox}\n`);
