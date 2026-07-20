import { createHmac, timingSafeEqual } from "node:crypto";

export const users = {
  zimbra: { id: "zimbra", name: "Zimbra", initials: "ZI" },
  callisto: { id: "callisto", name: "Callisto", initials: "CA" },
} as const;

export type AuthUser = { id: string; name: string; initials: string };

const COOKIE_NAME = "scrub_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.SCRUB_SESSION_SECRET || "scrub-local-session-change-in-production";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSession(user: AuthUser) {
  const payload = Buffer.from(JSON.stringify({ user, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(token?: string): AuthUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user?: AuthUser; userId?: keyof typeof users; expiresAt: number };
    if (session.expiresAt < Date.now()) return null;
    if (session.user?.id && session.user.name && session.user.initials) return session.user;
    return session.userId ? users[session.userId] ?? null : null;
  } catch {
    return null;
  }
}

export function passwordFor(userId: keyof typeof users) {
  if (userId === "zimbra") return process.env.SCRUB_ZIMBRA_PASSWORD || "Zimbra";
  return process.env.SCRUB_CALLISTO_PASSWORD || "Callisto";
}

export function participantPassword() {
  return process.env.SCRUB_PARTICIPANT_PASSWORD || "Participante";
}

export const sessionCookie = { name: COOKIE_NAME, maxAge: SESSION_TTL_SECONDS };
