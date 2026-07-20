import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveFeedback } from "@/lib/ai-memory";
import { ingestRagDocument } from "@/lib/ai-rag";
import { readSession, sessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const store = await cookies(); const user = readSession(store.get(sessionCookie.name)?.value);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const body = await request.json().catch(() => null) as { messageId?: string; rating?: number; comment?: string } | null;
  if (!body?.messageId || ![-1, 1].includes(body.rating ?? 0) || (body.comment?.length ?? 0) > 2000) return NextResponse.json({ error: "Feedback inválido." }, { status: 400 });
  const saved = saveFeedback(user.id, body.messageId, body.rating as -1 | 1, body.comment?.trim() || "");
  if (!saved) return NextResponse.json({ error: "Resposta não encontrada." }, { status: 404 });
  let correctionIndexed = false;
  if (body.rating === -1 && body.comment?.trim()) {
    const indexed = await ingestRagDocument({ source: `feedback:${body.messageId}`, title: "Correção fornecida pelo usuário", documentType: "feedback_correction", reliability: "feedback humano - requer revisão", content: body.comment.trim() }).catch(() => null);
    correctionIndexed = Boolean(indexed);
  }
  return NextResponse.json({ saved: true, correctionIndexed }, { headers: { "Cache-Control": "no-store" } });
}
