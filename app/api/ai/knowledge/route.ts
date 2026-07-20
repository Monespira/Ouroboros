import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ingestRagDocument } from "@/lib/ai-rag";
import { readSession, sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const store = await cookies(); const user = readSession(store.get(sessionCookie.name)?.value);
  if (!user || !["zimbra", "callisto"].includes(user.id)) return NextResponse.json({ error: "Sem permissão para indexar conhecimento." }, { status: 403 });
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > 1_000_000) return NextResponse.json({ error: "Documento excede 1 MB." }, { status: 413 });
  let body: { source?: string; title?: string; documentType?: string; reliability?: string; content?: string; supersedesId?: string };
  try { body = JSON.parse(text) as typeof body; } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!body.source?.trim() || !body.title?.trim() || !body.content?.trim() || body.content.length < 20) return NextResponse.json({ error: "Documento inválido." }, { status: 400 });
  const result = await ingestRagDocument({ source: body.source.trim().slice(0, 300), title: body.title.trim().slice(0, 200), documentType: body.documentType?.trim().slice(0, 80) || "document", reliability: body.reliability?.trim().slice(0, 100) || "não classificada", content: body.content, supersedesId: body.supersedesId });
  return NextResponse.json(result, { status: result.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
}
