import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession, sessionCookie } from "@/lib/auth";
import { integrationAdapter, integrationKinds, type IntegrationKind } from "@/lib/crm-integrations";

export async function POST(request: Request) {
  const store = await cookies();
  if (!readSession(store.get(sessionCookie.name)?.value)) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await request.json() as { kind?: string; baseUrl?: string; webhookUrl?: string; credentialRef?: string };
  if (!integrationKinds.includes(body.kind as IntegrationKind)) return NextResponse.json({ error: "Adapter inválido" }, { status: 400 });
  return NextResponse.json(integrationAdapter(body.kind as IntegrationKind).validate({ baseUrl: body.baseUrl ?? "", webhookUrl: body.webhookUrl ?? "", credentialRef: body.credentialRef ?? "" }));
}
