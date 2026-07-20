import { AppShell } from "@/components/layout/app-shell";
import { LoginForm } from "@/components/login-form";
import { readSession, sessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const user = readSession(cookieStore.get(sessionCookie.name)?.value);

  return user ? <AppShell authenticatedUser={user} /> : <LoginForm />;
}
