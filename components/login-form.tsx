"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoginForm() {
  const [username, setUsername] = useState("zimbra");
  const [participantName, setParticipantName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, participantName, password }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="brand-gradient p-7 text-white">
          <img src="/ouroboros-logo.png" alt="Ouroboros" className="h-28 w-28 rounded-2xl object-cover shadow-lg shadow-black/10" />
          <h1 className="mt-8 text-2xl font-black">Acesse seu workspace</h1>
          <p className="mt-1 text-sm text-white/75">Entre com uma conta interna ou como participante.</p>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-bold">
              Tipo de acesso
              <select
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 font-normal"
              >
                <option value="zimbra">Zimbra</option>
                <option value="callisto">Callisto</option>
                <option value="participant">Outro participante</option>
              </select>
            </label>
            {username === "participant" && (
              <label className="block text-sm font-bold">
                Seu nome
                <input
                  value={participantName}
                  onChange={(event) => setParticipantName(event.target.value)}
                  minLength={2}
                  maxLength={60}
                  required
                  autoFocus
                  className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-transparent px-3 font-normal outline-none focus:border-[var(--accent)]"
                />
              </label>
            )}
            <label className="block text-sm font-bold">
              Senha de acesso
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                autoFocus={username !== "participant"}
                className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-transparent px-3 font-normal outline-none focus:border-[var(--accent)]"
              />
            </label>
            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
