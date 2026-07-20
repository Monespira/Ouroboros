import { DatabaseSync } from "node:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "ai-memory.sqlite"));
db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
db.exec(`
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL,
  title TEXT NOT NULL, training_opt_in INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','assistant')), content TEXT NOT NULL,
  created_at TEXT NOT NULL, token_count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE TABLE IF NOT EXISTS summaries (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL, created_at TEXT NOT NULL, through_message_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_summaries_conversation ON summaries(conversation_id, created_at DESC);
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY, message_id TEXT NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating IN (-1,1)), comment TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id TEXT PRIMARY KEY, source TEXT NOT NULL, title TEXT NOT NULL, document_type TEXT NOT NULL,
  reliability TEXT NOT NULL, version INTEGER NOT NULL, content_hash TEXT NOT NULL UNIQUE,
  superseded_by TEXT REFERENCES knowledge_documents(id), created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL, content TEXT NOT NULL, content_hash TEXT NOT NULL UNIQUE,
  vector_id TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS retrieval_logs (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  chunk_ids_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS fine_tune_runs (
  id TEXT PRIMARY KEY, dataset_path TEXT NOT NULL, example_count INTEGER NOT NULL,
  status TEXT NOT NULL, approved_by TEXT, approved_at TEXT, provider_job_id TEXT,
  model_version TEXT, metrics_json TEXT, created_at TEXT NOT NULL
);
`);

export type StoredMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string; tokenCount: number };
export const estimateTokens = (content: string) => Math.max(1, Math.ceil(content.length / 4));
export const hashContent = (content: string) => createHash("sha256").update(content).digest("hex");

export function ensureConversation(userId: string, requestedId: string | undefined, titleSeed: string, trainingOptIn: boolean) {
  if (requestedId) {
    const found = db.prepare("SELECT id FROM conversations WHERE id=? AND user_id=?").get(requestedId, userId) as { id?: string } | undefined;
    if (found?.id) { db.prepare("UPDATE conversations SET training_opt_in=? WHERE id=?").run(trainingOptIn ? 1 : 0, requestedId); return requestedId; }
  }
  const id = randomUUID();
  db.prepare("INSERT INTO conversations(id,user_id,created_at,title,training_opt_in) VALUES(?,?,?,?,?)")
    .run(id, userId, new Date().toISOString(), titleSeed.slice(0, 80), trainingOptIn ? 1 : 0);
  return id;
}

export function addMessage(conversationId: string, role: StoredMessage["role"], content: string) {
  const message: StoredMessage = { id: randomUUID(), role, content, createdAt: new Date().toISOString(), tokenCount: estimateTokens(content) };
  db.prepare("INSERT INTO messages(id,conversation_id,role,content,created_at,token_count) VALUES(?,?,?,?,?,?)")
    .run(message.id, conversationId, role, content, message.createdAt, message.tokenCount);
  return message;
}

export function conversationContext(conversationId: string, limit = Number(process.env.AI_MEMORY_MESSAGES || 12)) {
  const summary = db.prepare("SELECT summary_text AS summaryText,through_message_id AS throughMessageId FROM summaries WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1").get(conversationId) as { summaryText: string; throughMessageId: string } | undefined;
  const rows = db.prepare("SELECT id,role,content,created_at AS createdAt,token_count AS tokenCount FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT ?").all(conversationId, limit) as unknown as StoredMessage[];
  return { summary: summary?.summaryText ?? "", messages: rows.reverse() };
}

export function tokensSinceLatestSummary(conversationId: string) {
  const row = db.prepare(`SELECT COALESCE(SUM(token_count),0) AS total FROM messages WHERE conversation_id=? AND created_at > COALESCE((SELECT created_at FROM summaries WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1),'')`).get(conversationId, conversationId) as { total: number };
  return Number(row.total);
}

export function saveSummary(conversationId: string, summaryText: string) {
  const last = db.prepare("SELECT id FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1").get(conversationId) as { id: string } | undefined;
  if (!last) return;
  db.prepare("INSERT INTO summaries(id,conversation_id,summary_text,created_at,through_message_id) VALUES(?,?,?,?,?)")
    .run(randomUUID(), conversationId, summaryText, new Date().toISOString(), last.id);
}

export function listConversations(userId: string, query = "") {
  const pattern = `%${query.slice(0, 100)}%`;
  return db.prepare(`SELECT c.id,c.title,c.created_at AS createdAt,c.training_opt_in AS trainingOptIn,
    (SELECT content FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) AS lastMessage
    FROM conversations c WHERE c.user_id=? AND (?='' OR c.title LIKE ? OR EXISTS(SELECT 1 FROM messages m WHERE m.conversation_id=c.id AND m.content LIKE ?)) ORDER BY c.created_at DESC LIMIT 100`)
    .all(userId, query, pattern, pattern);
}

export function getConversation(userId: string, conversationId: string) {
  const owner = db.prepare("SELECT id,title,created_at AS createdAt,training_opt_in AS trainingOptIn FROM conversations WHERE id=? AND user_id=?").get(conversationId, userId);
  if (!owner) return null;
  const messages = db.prepare("SELECT id,role,content,created_at AS createdAt,token_count AS tokenCount FROM messages WHERE conversation_id=? ORDER BY created_at").all(conversationId);
  return { ...owner as object, messages };
}

export function deleteConversation(userId: string, conversationId: string) {
  return db.prepare("DELETE FROM conversations WHERE id=? AND user_id=?").run(conversationId, userId).changes > 0;
}

export function saveFeedback(userId: string, messageId: string, rating: -1 | 1, comment: string) {
  const message = db.prepare(`SELECT m.id,m.content,m.conversation_id AS conversationId,c.training_opt_in AS trainingOptIn
    FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE m.id=? AND c.user_id=? AND m.role='assistant'`).get(messageId, userId) as { id: string; content: string; conversationId: string; trainingOptIn: number } | undefined;
  if (!message) return null;
  db.prepare(`INSERT INTO feedback(id,message_id,user_id,rating,comment,created_at) VALUES(?,?,?,?,?,?)
    ON CONFLICT(message_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment,created_at=excluded.created_at`)
    .run(randomUUID(), messageId, userId, rating, comment.slice(0, 2000) || null, new Date().toISOString());
  return message;
}

export function insertKnowledgeDocument(input: { source: string; title: string; documentType: string; reliability: string; content: string; supersedesId?: string }) {
  const contentHash = hashContent(input.content);
  const existing = db.prepare("SELECT id FROM knowledge_documents WHERE content_hash=?").get(contentHash) as { id: string } | undefined;
  if (existing) return { id: existing.id, duplicate: true };
  const versionRow = db.prepare("SELECT COALESCE(MAX(version),0)+1 AS version FROM knowledge_documents WHERE source=?").get(input.source) as { version: number };
  const id = randomUUID();
  db.prepare("INSERT INTO knowledge_documents(id,source,title,document_type,reliability,version,content_hash,superseded_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
    .run(id, input.source, input.title, input.documentType, input.reliability, versionRow.version, contentHash, null, new Date().toISOString());
  if (input.supersedesId) db.prepare("UPDATE knowledge_documents SET superseded_by=? WHERE id=? AND superseded_by IS NULL").run(id, input.supersedesId);
  return { id, duplicate: false };
}

export function insertChunk(documentId: string, chunkIndex: number, content: string, vectorId: string) {
  const hash = hashContent(content);
  const existing = db.prepare("SELECT id FROM knowledge_chunks WHERE content_hash=?").get(hash) as { id: string } | undefined;
  if (existing) return { id: existing.id, duplicate: true };
  const id = randomUUID();
  db.prepare("INSERT INTO knowledge_chunks(id,document_id,chunk_index,content,content_hash,vector_id,created_at) VALUES(?,?,?,?,?,?,?)")
    .run(id, documentId, chunkIndex, content, hash, vectorId, new Date().toISOString());
  return { id, duplicate: false };
}

export function logRetrieval(conversationId: string, messageId: string, chunkIds: string[]) {
  db.prepare("INSERT INTO retrieval_logs(id,conversation_id,message_id,chunk_ids_json,created_at) VALUES(?,?,?,?,?)")
    .run(randomUUID(), conversationId, messageId, JSON.stringify(chunkIds), new Date().toISOString());
}

export function curatedFineTuneExamples() {
  return db.prepare(`SELECT c.id AS conversationId,u.content AS prompt,a.content AS completion,f.rating,f.comment
    FROM feedback f JOIN messages a ON a.id=f.message_id JOIN conversations c ON c.id=a.conversation_id
    JOIN messages u ON u.id=(SELECT id FROM messages WHERE conversation_id=c.id AND role='user' AND created_at<a.created_at ORDER BY created_at DESC LIMIT 1)
    WHERE c.training_opt_in=1 AND (f.rating=1 OR (f.rating=-1 AND LENGTH(COALESCE(f.comment,''))>=20)) ORDER BY f.created_at`).all();
}

export function createFineTuneRun(datasetPath: string, exampleCount: number) {
  const id = randomUUID();
  db.prepare("INSERT INTO fine_tune_runs(id,dataset_path,example_count,status,created_at) VALUES(?,?,?,?,?)")
    .run(id, datasetPath, exampleCount, "awaiting_human_approval", new Date().toISOString());
  return id;
}

export function approveFineTuneRun(runId: string, approver: string, minimum: number) {
  const run = db.prepare("SELECT id,example_count AS exampleCount,status,dataset_path AS datasetPath FROM fine_tune_runs WHERE id=?").get(runId) as { id:string; exampleCount:number; status:string; datasetPath:string } | undefined;
  if (!run) throw new Error("Execução não encontrada.");
  if (run.status !== "awaiting_human_approval") throw new Error("Execução não está aguardando aprovação.");
  if (run.exampleCount < minimum) throw new Error(`Dataset possui ${run.exampleCount} exemplos; mínimo exigido: ${minimum}.`);
  db.prepare("UPDATE fine_tune_runs SET status='approved_for_manual_dispatch',approved_by=?,approved_at=? WHERE id=?").run(approver.slice(0, 100), new Date().toISOString(), runId);
  return { ...run, status: "approved_for_manual_dispatch", approvedBy: approver };
}

export function recordKnowledgeChunk(documentId: string, chunkIndex: number, content: string, vectorId: string) { return insertChunk(documentId, chunkIndex, content, vectorId); }
export { db };
