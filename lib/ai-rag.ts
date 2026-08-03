import { randomUUID } from "node:crypto";
import { insertKnowledgeDocument, recordKnowledgeChunk } from "@/lib/ai-memory";

const chromaBase = process.env.CHROMA_URL || "http://127.0.0.1:8001";
const collectionName = "monespira_knowledge";
const collectionRoot = `${chromaBase}/api/v2/tenants/default_tenant/databases/default_database/collections`;

export type RagChunk = { id: string; content: string; source: string; title: string; reliability: string; distance: number };

export function chunkText(text: string, size = Number(process.env.RAG_CHUNK_SIZE || 1200), overlap = Number(process.env.RAG_CHUNK_OVERLAP || 180)) {
  if (!Number.isInteger(size) || size < 200 || size > 4000 || !Number.isInteger(overlap) || overlap < 0 || overlap >= size) throw new Error("Configuração de chunk inválida.");
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(normalized.length, start + size);
    if (end < normalized.length) {
      const boundary = Math.max(normalized.lastIndexOf("\n", end), normalized.lastIndexOf(". ", end));
      if (boundary > start + Math.floor(size * 0.6)) end = boundary + 1;
    }
    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

async function embed(texts: string[]) {
  const base = new URL(process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434");
  if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) throw new Error("Ollama deve permanecer local.");
  const response = await fetch(new URL("/api/embed", base), {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({ model: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text", input: texts, truncate: true }),
  });
  const result = await response.json().catch(() => null) as { embeddings?: number[][]; error?: string } | null;
  if (!response.ok || !result?.embeddings?.length) throw new Error(result?.error || "Falha ao gerar embeddings locais.");
  return result.embeddings;
}

async function collectionId() {
  const get = await fetch(`${collectionRoot}/${collectionName}`, { cache: "no-store", signal: AbortSignal.timeout(5_000) });
  if (get.ok) return ((await get.json()) as { id: string }).id;
  const create = await fetch(collectionRoot, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5_000),
    body: JSON.stringify({ name: collectionName, get_or_create: true, metadata: { "hnsw:space": "cosine" } }),
  });
  const result = await create.json().catch(() => null) as { id?: string; error?: string } | null;
  if (!create.ok || !result?.id) throw new Error(result?.error || "Chroma local indisponível.");
  return result.id;
}

export async function ingestRagDocument(input: { source: string; title: string; documentType: string; reliability: string; content: string; supersedesId?: string }) {
  const document = insertKnowledgeDocument(input);
  if (document.duplicate) return { documentId: document.id, duplicate: true, chunks: 0 };
  const chunks = chunkText(input.content);
  const vectors = await embed(chunks);
  const collection = await collectionId();
  const ids: string[] = [];
  const documents: string[] = [];
  const embeddings: number[][] = [];
  const metadatas: Array<Record<string, string | number>> = [];
  chunks.forEach((content, index) => {
    const vectorId = randomUUID();
    const stored = recordKnowledgeChunk(document.id, index, content, vectorId);
    if (!stored.duplicate) {
      ids.push(vectorId); documents.push(content); embeddings.push(vectors[index]);
      metadatas.push({ chunk_id: stored.id, document_id: document.id, source: input.source, title: input.title, reliability: input.reliability, version: 1 });
    }
  });
  if (ids.length) {
    const response = await fetch(`${collectionRoot}/${collection}/add`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30_000), body: JSON.stringify({ ids, documents, embeddings, metadatas }) });
    if (!response.ok) throw new Error("Falha ao indexar chunks no Chroma local.");
  }
  return { documentId: document.id, duplicate: false, chunks: ids.length };
}

export async function retrieveRag(query: string, limit = 5): Promise<RagChunk[]> {
  try {
    const [vector] = await embed([query]);
    const collection = await collectionId();
    const response = await fetch(`${collectionRoot}/${collection}/query`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(15_000), body: JSON.stringify({ query_embeddings: [vector], n_results: Math.min(10, Math.max(1, limit)), include: ["documents", "metadatas", "distances"] }) });
    if (!response.ok) return [];
    const result = await response.json() as { documents?: string[][]; metadatas?: Array<Array<Record<string, unknown>>>; distances?: number[][] };
    return (result.documents?.[0] ?? []).map((content, index) => {
      const metadata = result.metadatas?.[0]?.[index] ?? {};
      return { id: String(metadata.chunk_id || ""), content, source: String(metadata.source || "Fonte interna"), title: String(metadata.title || "Documento"), reliability: String(metadata.reliability || "não classificada"), distance: Number(result.distances?.[0]?.[index] ?? 1) };
    }).filter((item) => item.id && item.distance <= Number(process.env.RAG_MAX_DISTANCE || 0.65));
  } catch { return []; }
}
