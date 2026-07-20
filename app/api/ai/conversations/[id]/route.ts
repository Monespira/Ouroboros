import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteConversation, getConversation } from "@/lib/ai-memory";
import { readSession, sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
async function user() { const store = await cookies(); return readSession(store.get(sessionCookie.name)?.value); }
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await user(); if (!current) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const data = getConversation(current.id, (await params).id);
  return data ? NextResponse.json(data, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const current = await user(); if (!current) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return deleteConversation(current.id, (await params).id) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
}
