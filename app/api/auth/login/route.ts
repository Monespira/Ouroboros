import { NextResponse } from "next/server";
import { createSession, participantPassword, passwordFor, sessionCookie, users, type AuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
    participantName?: string;
  } | null;
  const username = body?.username?.trim().toLowerCase();
  let user: AuthUser | null = null;

  if (username === "participant") {
    const name = body?.participantName?.trim().replace(/\s+/g, " ").slice(0, 60) ?? "";
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    if (name.length >= 2 && slug && body?.password === participantPassword()) {
      user = { id: `participant-${slug}`, name, initials: initials || "PA" };
    }
  } else if (username && username in users) {
    const userId = username as keyof typeof users;
    if (body?.password === passwordFor(userId)) user = users[userId];
  }

  if (!user) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const response = NextResponse.json({ user });
  response.cookies.set(sessionCookie.name, createSession(user), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookie.maxAge,
  });
  return response;
}
