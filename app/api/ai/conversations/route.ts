import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listConversations } from "@/lib/ai-memory";
import { readSession, sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const store = await cookies(); const user = readSession(store.get(sessionCookie.name)?.value);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  return NextResponse.json({ conversations: listConversations(user.id, query) }, { headers: { "Cache-Control": "no-store" } });
}
