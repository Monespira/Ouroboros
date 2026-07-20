import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createFineTuneRun, curatedFineTuneExamples } from "../lib/ai-memory";

const minimum = Number(process.env.FINE_TUNE_MIN_EXAMPLES || 200);
const examples = curatedFineTuneExamples() as Array<{ conversationId:string; prompt:string; completion:string; rating:number; comment:string|null }>;
const outputDir = path.join(process.cwd(), "data", "fine-tuning");
mkdirSync(outputDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.join(outputDir, `dataset-${stamp}.jsonl`);
function anonymize(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL_REMOVIDO]")
    .replace(/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}\b/g, "[TELEFONE_REMOVIDO]")
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF_REMOVIDO]")
    .replace(/\b(?:sk-|Bearer\s+)[A-Za-z0-9._-]{12,}\b/gi, "[SEGREDO_REMOVIDO]");
}
const rows = examples.map((item) => JSON.stringify({ messages: [
  { role: "system", content: "Você é um agente local da Monespira. Responda em português do Brasil e respeite aprovações humanas." },
  { role: "user", content: anonymize(item.prompt) },
  { role: "assistant", content: anonymize(item.rating === -1 && item.comment ? item.comment : item.completion) },
], metadata: { source: "opt_in_feedback", conversation_id: item.conversationId } }));
writeFileSync(output, `${rows.join("\n")}${rows.length ? "\n" : ""}`, { encoding: "utf8", flag: "wx" });
const runId = createFineTuneRun(output, rows.length);
process.stdout.write(JSON.stringify({ runId, output, examples: rows.length, minimum, eligible: rows.length >= minimum, status: "awaiting_human_approval", dispatched: false }, null, 2));
