import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readSession, sessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WorkspaceRecord = {
  revision: number;
  updatedAt: string;
  updatedBy: string;
  data: Record<string, unknown>;
};

const dataDirectory = path.join(process.cwd(), "data");
const workspaceFile = path.join(dataDirectory, "workspace.json");
const emptyWorkspace: WorkspaceRecord = {
  revision: 0,
  updatedAt: new Date(0).toISOString(),
  updatedBy: "system",
  data: { posts: [], meetings: [], chatMessages: [], completedProjectIds: [], crmLeads: [], crmAccounts: [], crmContacts: [], crmOpportunities: [], crmActivities: [], crmExtras: { interactions: [], transactions: [], pipelineHistory: [], segments: [], campaigns: [], automations: [], notifications: [], integrations: [] } },
};

async function authenticatedUser() {
  const cookieStore = await cookies();
  return readSession(cookieStore.get(sessionCookie.name)?.value);
}

async function readWorkspace(): Promise<WorkspaceRecord> {
  try {
    return JSON.parse(await fs.readFile(workspaceFile, "utf8")) as WorkspaceRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyWorkspace;
    throw error;
  }
}

export async function GET() {
  if (!(await authenticatedUser())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  return NextResponse.json(await readWorkspace(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const user = await authenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = (await request.json()) as { revision?: number; data?: Record<string, unknown> };
  if (!Number.isInteger(body.revision) || !body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json({ error: "Workspace inválido" }, { status: 400 });
  }

  await fs.mkdir(dataDirectory, { recursive: true });
  const current = await readWorkspace();
  if (body.revision !== current.revision) {
    return NextResponse.json(current, { status: 409, headers: { "Cache-Control": "no-store" } });
  }

  const next: WorkspaceRecord = {
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
    data: body.data,
  };
  const temporaryFile = `${workspaceFile}.${process.pid}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(temporaryFile, workspaceFile);
  return NextResponse.json(next, { headers: { "Cache-Control": "no-store" } });
}
