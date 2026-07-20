import { existsSync, readFileSync } from "node:fs";
import { approveFineTuneRun, db } from "../lib/ai-memory";

const [runId, approver] = process.argv.slice(2);
if (!runId || !approver) throw new Error("Uso: npm run fine-tune:approve -- <run-id> <aprovador>");
const minimum = Number(process.env.FINE_TUNE_MIN_EXAMPLES || 200);
const pending = db.prepare("SELECT dataset_path AS datasetPath,example_count AS exampleCount FROM fine_tune_runs WHERE id=? AND status='awaiting_human_approval'").get(runId) as { datasetPath:string; exampleCount:number } | undefined;
if (!pending) throw new Error("Execução não encontrada ou não está aguardando aprovação.");
if (!existsSync(pending.datasetPath)) throw new Error("Arquivo do dataset não existe.");
const lines = readFileSync(pending.datasetPath, "utf8").trim().split("\n").filter(Boolean);
if (lines.length !== pending.exampleCount) throw new Error("Contagem do dataset diverge do registro de auditoria.");
for (const line of lines) {
  const item = JSON.parse(line) as { messages?: Array<{ role?:string; content?:string }> };
  if (!Array.isArray(item.messages) || item.messages.length !== 3 || item.messages.some((message) => !message.role || !message.content)) throw new Error("Dataset contém exemplo inválido.");
}
const approved = approveFineTuneRun(runId, approver, minimum);
process.stdout.write(JSON.stringify({ ...approved, validatedExamples: lines.length, dispatched: false, nextStep: "Configurar e executar manualmente um treinador LoRA/API aprovado; este checkpoint não envia dados." }, null, 2));
