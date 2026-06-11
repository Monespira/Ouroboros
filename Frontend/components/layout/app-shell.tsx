"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Bot, Sun, Moon, Folder, Plus, X, MessageSquare, Kanban } from "lucide-react";

const initialProjects = [
  { id: 1, name: "Portal CIEE", description: "Portal principal de estagiários e empresas." },
  { id: 2, name: "ScrumHub", description: "Ferramenta interna de gerenciamento ágil." },
  { id: 3, name: "RH Interno", description: "Sistema de triagem e onboarding." },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  
  // Estado para controlar qual aba está ativa ("forum" ou "projetos")
  const [activeTab, setActiveTab] = useState<"forum" | "projetos">("forum");
  
  const [projects, setProjects] = useState(initialProjects);
  const [newProjectName, setNewProjectName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

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

  function handleCreateProject() {
    if (!newProjectName.trim()) return;
    setProjects((prev) => [
      ...prev,
      { id: Date.now(), name: newProjectName.trim(), description: "Sem descrição informada." },
    ]);
    setNewProjectName("");
    setCreateOpen(false);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* BARRA LATERAL */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-4">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--accent)] text-xl font-black text-white">
            <Bot size={24} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-black">SCRUM CIEE</p>
              <p className="text-xs text-muted">Controle de projetos</p>
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

          <p className="mb-2 px-3 text-xs font-bold uppercase text-muted">Scrum</p>
          <nav className="space-y-1">
            {/* Opção Forum */}
            <button
              onClick={() => setActiveTab("forum")}
              className={[
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
                activeTab === "forum" ? "bg-black/[0.06] text-[var(--foreground)] dark:bg-white/[0.08]" : "",
              ].join(" ")}
            >
              <MessageSquare size={18} />
              {!collapsed && <span>Forum</span>}
            </button>

            {/* Opção Projetos */}
            <button
              onClick={() => setActiveTab("projetos")}
              className={[
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
                activeTab === "projetos" ? "bg-black/[0.06] text-[var(--foreground)] dark:bg-white/[0.08]" : "",
              ].join(" ")}
            >
              <Kanban size={18} />
              {!collapsed && <span>Projetos</span>}
            </button>
          </nav>

          {/* Só exibe os tópicos do fórum se o menu não estiver colapsado e se estiver na aba fórum */}
          {!collapsed && activeTab === "forum" && (
            <div className="mt-6">
              <p className="mb-2 px-3 text-xs font-bold uppercase text-muted">Tópicos</p>
              {["/engenharia", "/produto", "/design", "/marketing", "/rh", "/geral"].map((community) => (
                <a
                  key={community}
                  href="#forum"
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                >
                  {community}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "← Recolher"}
          </Button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={collapsed ? "lg:pl-20" : "lg:pl-72"}>
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/92 px-4 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">
                {activeTab === "forum" ? "Forum interno / Scrum por post" : "Dashboard / Visão Geral"}
              </div>
              <h1 className="truncate text-lg font-black">
                {activeTab === "forum" ? "Forum Corporativo Ciee" : "Projetos Ativos"}
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
              {dark ? <Moon size={24} /> : <Sun />}
            </Button>
            
            {activeTab === "forum" ? (
              <a href="#novo-post">
                <Button variant="primary" size="sm">Nova publicação</Button>
              </a>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={16} className="mr-2" /> Novo Projeto
              </Button>
            )}
            <Avatar label="EU" />
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1320px] px-4 py-5 md:px-6 md:py-6">
          {activeTab === "forum" ? (
            // Renderiza o conteúdo padrão do Fórum (passado via children)
            children
          ) : (
            // TELA INTERNA DE PROJETOS (Aparece quando clica em Projetos)
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Seus Projetos Scrum</h2>
                  <p className="text-sm text-muted">Gerencie e acompanhe o progresso das sprints do CIEE.</p>
                </div>
                
                {/* BOTÃO INTERNO DE CADASTRO DE PROJETO */}
                <Button 
                  variant="primary" 
                  onClick={() => setCreateOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus size={16} className="mr-2" /> Cadastrar Projeto
                </Button>
              </div>

              {/* Grid de Cards de Projetos */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Folder size={20} />
                      </div>
                      <h3 className="font-bold text-base">{project.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* BOTÕES DE AÇÃO INTERNOS DO CARD */}
                    <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-[var(--accent)] hover:text-white transition-colors"
                        onClick={() => alert(`Você se inscreveu no projeto: ${project.name}`)}
                      >
                        Se Inscrever
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Abrir Quadro
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL GLOBAL DE BUSCA (⌘K) */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={() => setCommandOpen(false)}>
          <div
            className="surface mx-auto mt-20 max-w-2xl overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl"
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

      {/* MODAL DE CRIAR NOVO PROJETO */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={() => setCreateOpen(false)}>
          <div
            className="mx-auto mt-40 max-w-md overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-black">Novo Projeto</p>
              <button onClick={() => setCreateOpen(false)} className="text-muted hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                placeholder="Nome do projeto..."
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleCreateProject}>
                  Criar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}