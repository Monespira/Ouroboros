"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const nav = ["Forum", "Meus posts", "Em alta", "Salvos"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-4">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--accent)] text-xl font-black text-white">F</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-black">Forum Scrum</p>
              <p className="text-xs text-muted">Landing principal</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <Button
            variant="outline"
            className="mb-4 w-full justify-start text-muted"
            onClick={() => setCommandOpen(true)}
          >
            ⌘K {!collapsed && <span>Busca global</span>}
          </Button>

          <nav className="space-y-1">
            {nav.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={[
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
                  index === 0 ? "bg-black/[0.06] text-[var(--foreground)] dark:bg-white/[0.08]" : "",
                ].join(" ")}
              >
                <span>{["◎", "◷", "↗", "★"][index]}</span>
                {!collapsed && <span>{item}</span>}
              </a>
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-6">
              <p className="mb-2 px-3 text-xs font-bold uppercase text-muted">Comunidades</p>
              {["/engenharia", "/produto", "/design", "/marketing", "/rh", "/geral"].map((community) => (
                <a key={community} href="#forum" className="block rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]">
                  {community}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "← Recolher"}
          </Button>
        </div>
      </aside>

      <div className={collapsed ? "lg:pl-20" : "lg:pl-72"}>
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/92 px-4 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted">Forum interno / Scrum por post</div>
            <h1 className="truncate text-lg font-black">Forum Corporativo</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
            {dark ? "Light" : "Dark"}
          </Button>
          <a href="#novo-post">
            <Button variant="primary" size="sm">Novo post</Button>
          </a>
          <Avatar label="EU" />
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1320px] px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>

      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={() => setCommandOpen(false)}>
          <div
            className="surface mx-auto mt-20 max-w-2xl overflow-hidden rounded-lg border shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              autoFocus
              placeholder="Buscar posts, tarefas e categorias..."
              className="w-full border-b border-[var(--border)] bg-transparent px-4 py-4 outline-none"
            />
            <div className="p-2">
              {["Criar post", "Filtrar por Engenharia", "Ver posts em alta", "Abrir meus posts"].map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                >
                  <span>{item}</span>
                  <span className="text-xs text-muted">Enter</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
