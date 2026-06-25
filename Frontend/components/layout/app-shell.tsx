"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Folder,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Repeat,
  Sun,
  Users,
  X,
} from "lucide-react";
import { ForumLanding, type ForumPost, forumUsers } from "@/components/forum-landing";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ViewId = "forum" | "projects" | "tasks" | "calendar";
type ProjectStatus = "Planejamento" | "Ativo" | "Pausado" | "Concluído";
type TaskStatus = "Backlog" | "A fazer" | "Em andamento" | "Revisão" | "Concluído";

type Project = {
  id: string;
  name: string;
  area: string;
  status: ProjectStatus;
  description: string;
  progress: number;
  members: number;
  creatorId: string;
  memberIds: string[];
  color: string;
};

type ShellTask = {
  id: string;
  title: string;
  projectId: string;
  status: TaskStatus;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  points?: number;
  sourcePostId?: string;
  sourceTaskId?: string;
};

type ProjectMeeting = {
  id: string;
  projectId: string;
  title: string;
  date: string;
  time: string;
  type: "Daily" | "Planning" | "Review" | "Retrospectiva" | "Outro";
};

type ChatMessage = {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string;
};

const projectColors = ["#24599a", "#4b2872", "#ff6b00", "#2f74c0", "#6d3aa0", "#0f9f6e"];

const views: Array<{
  id: ViewId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "forum", label: "Fórum", description: "Posts e Scrum do SCRUB", icon: MessageSquare },
  { id: "projects", label: "Projetos", description: "Carteira CIEE Rio", icon: Folder },
  { id: "tasks", label: "Tarefas", description: "Backlog operacional", icon: ClipboardList },
  { id: "calendar", label: "Calendário", description: "Agenda de reuniões", icon: CalendarDays },
];

const taskColumns: TaskStatus[] = ["Backlog", "A fazer", "Em andamento", "Revisão", "Concluído"];

const demoPosts: ForumPost[] = [
  {
    id: "3003",
    title: "Projeto JAC",
    body: "Projeto que incentiva jovens aprendizes a desenvolver soluções capazes de gerar impacto positivo na sociedade.",
    category: "Projeto",
    kind: "Ideia",
    creatorId: "Bruce",
    creatorName: "Bruce Medeiros",
    memberIds: ["bruce", "bruno", "", "", "", "", "", "", "",""],
    requests: [],
    score: 2,
    votes: { bruce: 1, bruno: 1 },
    comments: ["Validar as construção do projeto.", "Projeto concluido pessoal!"],
    createdAt: "há 21 dias",
    tasks: [
      { id: "task-3003-1", title: "Criação de Slide", status: "DONE", priority: "Alta", points: 5 },
      { id: "task-3003-2", title: "Projeto Saúde Mental", status: "DONE", priority: "Alta", points: 8 },
      { id: "task-3003-3", title: "Projeto Comunicação", status: "DONE", priority: "Média", points: 3 },
      { id: "task-3003-4", title: "Projeto Conectando", status: "DONE", priority: "Média", points: 3 },
      { id: "task-3003-5", title: "Café da manha Compartilhado", status: "DONE", priority: "Média", points: 3 },
      { id: "task-3003-6", title: "Pesquisa de dados", status: "DONE", priority: "Média", points: 3 }
    ],
  },
  {
    id: "3002",
    title: "Automação de triagem de currículos",
    body: "Organizar regras de triagem para reduzir trabalho manual e destacar candidatos aderentes aos requisitos das empresas.",
    category: "RH",
    kind: "Sugestão",
    creatorId: "bruno",
    creatorName: "Bruno Lima",
    memberIds: ["ana", "bruno", "carla"],
    requests: [],
    score: 1,
    votes: { ana: 1, bruno: 1, carla: -1 },
    comments: ["Começar com critérios transparentes.", "Registrar justificativas da classificação."],
    createdAt: "há 4 dias",
    tasks: [
      { id: "task-3002-1", title: "Levantar regras atuais de triagem", status: "DONE", priority: "Média", points: 3 },
      { id: "task-3002-2", title: "Criar protótipo de ranking", status: "REVIEW", priority: "Alta", points: 5 },
      { id: "task-3002-3", title: "Testar com uma vaga piloto", status: "BACKLOG", priority: "Média", points: 5 },
    ],
  },
  {
    id: "3001",
    title: "Calendário de cerimônias Scrum",
    body: "Padronizar planning, daily, review e retrospectiva dos projetos internos com agenda visível para todos os participantes.",
    category: "Engenharia",
    kind: "Atualização",
    creatorId: "carla",
    creatorName: "Carla Mendes",
    memberIds: ["ana", "carla"],
    requests: [],
    score: 1,
    votes: { ana: -1, carla: 1, bruno: 1 },
    comments: ["Adicionar lembretes antes das reuniões."],
    createdAt: "há 1 semana",
    tasks: [
      { id: "task-3001-1", title: "Definir modelo de cerimônias", status: "DONE", priority: "Baixa", points: 2 },
      { id: "task-3001-2", title: "Cadastrar reuniões recorrentes", status: "TODO", priority: "Média", points: 3 },
      { id: "task-3001-3", title: "Compartilhar calendário com equipes", status: "BACKLOG", priority: "Baixa", points: 2 },
    ],
  },
];

const demoMeetings: ProjectMeeting[] = [
  { id: "meeting-3003-1", projectId: "post-3003", title: "Definição de metas", date: "2026-06-18", time: "09:30", type: "Planning" },
  { id: "meeting-3003-2", projectId: "post-3003", title: "Planejamento", date: "2026-06-25", time: "09:30", type: "Daily" },
  { id: "meeting-3003-3", projectId: "post-3003", title: "Revisão", date: "2026-07-02", time: "09:30", type: "Daily" },
  { id: "meeting-3003-4", projectId: "post-3003", title: "Finalização", date: "2026-07-09", time: "09:30", type: "Review" },
  { id: "meeting-3002-1", projectId: "post-3002", title: "Review da triagem piloto", date: "2026-06-22", time: "14:00", type: "Review" },
  { id: "meeting-3001-1", projectId: "post-3001", title: "Daily de agenda Scrum", date: "2026-06-23", time: "10:15", type: "Daily" },
];

const demoChatMessages: ChatMessage[] = [
  {
    id: "chat-3003-1",
    projectId: "post-3003",
    authorId: "bruce",
    authorName: "Bruce Medeiros",
    authorInitials: "BM",
    body: "Pessoal, fazer as apresentações do projeto!",
    createdAt: "2026-06-18T09:10:00.000Z",
  },
  {
    id: "chat-3002-1",
    projectId: "post-3002",
    authorId: "bruno",
    authorName: "Bruno Lima",
    authorInitials: "BL",
    body: "O protótipo está em review. Falta validar os critérios com RH.",
    createdAt: "2026-06-18T10:25:00.000Z",
  },
  {
    id: "chat-3001-1",
    projectId: "post-3001",
    authorId: "carla",
    authorName: "Carla Mendes",
    authorInitials: "CM",
    body: "Inclui a primeira daily para demonstrar o calendário do projeto.",
    createdAt: "2026-06-18T11:40:00.000Z",
  },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>("forum");
  const [posts, setPosts] = useState<ForumPost[]>(demoPosts);
  const [meetings, setMeetings] = useState<ProjectMeeting[]>(demoMeetings);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(demoChatMessages);
  const [currentUserId, setCurrentUserId] = useState(forumUsers[0].id);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const activeMeta = views.find((view) => view.id === activeView) ?? views[0];
  const sidebarCollapsed = collapsed && !mobileOpen;
  const currentUser = forumUsers.find((user) => user.id === currentUserId) ?? forumUsers[0];
  const forumProjects = useMemo(() => posts.map(postToProject), [posts]);
  const projects = forumProjects;
  const visibleProjects = useMemo(
    () => projects.filter((project) => project.creatorId === currentUser.id || project.memberIds.includes(currentUser.id)),
    [currentUser.id, projects],
  );
  const selectedProject = visibleProjects.find((project) => project.id === selectedProjectId) ?? visibleProjects[0];
  const forumTasks = useMemo(() => posts.flatMap(postToTasks), [posts]);
  const visibleProjectIds = useMemo(() => new Set(visibleProjects.map((project) => project.id)), [visibleProjects]);
  const visibleTasks = useMemo(
    () => forumTasks.filter((task) => visibleProjectIds.has(task.projectId)),
    [forumTasks, visibleProjectIds],
  );

  const projectStats = useMemo(
    () => ({
      active: visibleProjects.filter((project) => project.status === "Ativo").length,
      members: visibleProjects.reduce((total, project) => total + project.members, 0),
      doneTasks: visibleTasks.filter((task) => task.status === "Concluído").length,
    }),
    [visibleProjects, visibleTasks],
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function selectView(view: ViewId) {
    setActiveView(view);
    setMobileOpen(false);
  }

  function moveTask(taskId: string, status: TaskStatus) {
    const forumTask = forumTasks.find((task) => task.id === taskId);

    if (forumTask?.sourcePostId && forumTask.sourceTaskId) {
      setPosts((current) =>
        current.map((post) =>
          post.id === forumTask.sourcePostId
            ? {
                ...post,
                tasks: post.tasks.map((task) =>
                  task.id === forumTask.sourceTaskId ? { ...task, status: taskStatusToScrumStatus(status) } : task,
                ),
              }
            : post,
        ),
      );
      return;
    }
  }

  function createPost(post: ForumPost) {
    setPosts((current) => [post, ...current]);
    setSelectedProjectId(`post-${post.id}`);
  }

  function updatePost(postId: string, updater: (post: ForumPost) => ForumPost) {
    setPosts((current) => current.map((post) => (post.id === postId ? updater(post) : post)));
  }

  function deletePost(postId: string) {
    setPosts((current) => current.filter((post) => post.id !== postId));
  }

  function addTaskToProject(projectId: string, title: string) {
    const postId = projectId.replace(/^post-/, "");

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              tasks: [
                ...post.tasks,
                {
                  id: crypto.randomUUID(),
                  title,
                  status: "BACKLOG",
                  priority: "Média",
                  points: 3,
                },
              ],
            }
          : post,
      ),
    );
  }

  function addMeeting(meeting: Omit<ProjectMeeting, "id">) {
    setMeetings((current) => [{ id: crypto.randomUUID(), ...meeting }, ...current]);
  }

  function sendChatMessage(projectId: string, body: string) {
    if (!body.trim()) return;

    setChatMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        projectId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorInitials: currentUser.initials,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function createProject() {
    if (!newProjectName.trim()) return;
    setNewProjectName("");
    setCreateOpen(false);
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--foreground)]">
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "brand-gradient fixed inset-y-0 left-0 z-40 flex border-r border-white/15 text-white shadow-xl shadow-blue-950/25 transition-all duration-200 lg:translate-x-0",
          sidebarCollapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-24 items-center gap-3 border-b border-white/15 px-4">
            <ScrubLogo compact={sidebarCollapsed} />
            {!sidebarCollapsed && <div className="min-w-0 flex-1" />}
            <button className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {!sidebarCollapsed && <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.18em] text-white/55">Programa</p>}
            <nav className="space-y-1">
              {views.map((view) => {
                const Icon = view.icon;
                const active = activeView === view.id;

                return (
                  <button
                    key={view.id}
                    onClick={() => selectView(view.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left text-sm font-semibold transition",
                      active
                        ? "border-white/30 bg-white text-[var(--accent)] shadow-sm"
                        : "text-white/72 hover:bg-white/10 hover:text-white",
                      sidebarCollapsed && "justify-center px-0",
                    )}
                    title={view.label}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="min-w-0">
                        <span className="block truncate">{view.label}</span>
                        <span className={cn("block truncate text-xs font-normal", active ? "text-[var(--accent-blue)]" : "text-white/50")}>
                          {view.description}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {!sidebarCollapsed && (
              <div className="mt-6 rounded-lg border border-white/15 bg-white/10 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Resumo</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Ativos" value={projectStats.active} />
                  <MiniStat label="Pessoas" value={projectStats.members} />
                  <MiniStat label="Concluídas" value={projectStats.doneTasks} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/15 p-3">
            <Button
              variant="ghost"
              size={sidebarCollapsed ? "icon" : "sm"}
              className={cn("w-full", !sidebarCollapsed && "justify-start")}
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              {!sidebarCollapsed && <span>{collapsed ? "Expandir menu" : "Recolher menu"}</span>}
            </Button>
          </div>
        </div>
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/88 px-3 backdrop-blur dark:bg-[var(--card)]/88 sm:px-4">
          <div className="mx-auto flex min-h-16 max-w-[1320px] flex-wrap items-center gap-2 py-2 sm:h-16 sm:flex-nowrap sm:gap-3 sm:py-0">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className="lg:hidden">
              <ScrubLogo compact />
            </div>
            <div className="min-w-0 flex-[1_1_140px] sm:flex-1">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-blue)]">SCRUB / CIEE Rio</div>
              <h1 className="truncate text-lg font-black">{activeMeta.label}</h1>
            </div>
            <Button variant="outline" size="icon" onClick={() => setDark((value) => !value)} title="Alternar tema">
              {dark ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <select
              value={currentUserId}
              onChange={(event) => setCurrentUserId(event.target.value)}
              className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-sm sm:max-w-none sm:flex-none"
              aria-label="Usuário ativo"
            >
              {forumUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {activeView === "forum" ? (
              <a href="#novo-post" className="hidden sm:block">
                <Button variant="primary" size="sm">Nova publicação</Button>
              </a>
            ) : null}
            <Avatar label={currentUser.initials} />
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1320px] px-3 py-4 sm:px-4 md:px-6 md:py-6">
          {activeView === "forum" && (
            <ForumLanding
              posts={posts}
              currentUser={currentUser}
              onCreatePost={createPost}
              onUpdatePost={updatePost}
              onDeletePost={deletePost}
            />
          )}
          {activeView === "projects" && (
            <ProjectsView
              projects={visibleProjects}
              selectedProjectId={selectedProject?.id ?? ""}
              onSelectProject={setSelectedProjectId}
              currentUserName={currentUser.name}
              currentUserId={currentUser.id}
              meetings={meetings}
              onScheduleMeeting={addMeeting}
              chatMessages={chatMessages}
              onSendChatMessage={sendChatMessage}
            />
          )}
          {activeView === "tasks" && (
            <TasksView projects={visibleProjects} tasks={visibleTasks} onMoveTask={moveTask} onCreateTask={addTaskToProject} />
          )}
          {activeView === "calendar" && <CalendarView projects={visibleProjects} meetings={meetings} />}
        </main>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={() => setCreateOpen(false)}>
          <div
            className="mx-auto mt-40 max-w-md overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-black">Novo projeto</p>
              <button onClick={() => setCreateOpen(false)} className="text-muted hover:text-[var(--foreground)]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <input
                autoFocus
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && createProject()}
                placeholder="Nome do projeto"
                className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={createProject}>
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

function ProjectsView({
  projects,
  selectedProjectId,
  onSelectProject,
  currentUserName,
  currentUserId,
  meetings,
  onScheduleMeeting,
  chatMessages,
  onSendChatMessage,
}: {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  currentUserName: string;
  currentUserId: string;
  meetings: ProjectMeeting[];
  onScheduleMeeting: (meeting: Omit<ProjectMeeting, "id">) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (projectId: string, body: string) => void;
}) {
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const projectMeetings = selectedProject ? meetings.filter((meeting) => meeting.projectId === selectedProject.id) : [];
  const projectMessages = selectedProject ? chatMessages.filter((message) => message.projectId === selectedProject.id) : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black">Carteira de projetos</h2>
        <p className="text-sm text-muted">Projetos criados por {currentUserName} ou onde a participação foi aceita.</p>
      </div>

      {projects.length === 0 || !selectedProject ? (
        <Card>
          <CardContent className="grid min-h-56 place-items-center text-center">
            <div>
              <h3 className="text-lg font-black">Nenhum projeto disponível</h3>
              <p className="mt-2 max-w-md text-sm text-muted">Solicite participação em um post do fórum para acompanhar o projeto aqui.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border bg-[var(--card)] p-3 text-left shadow-sm transition hover:border-[var(--accent)] sm:p-4",
                  selectedProject.id === project.id ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/15" : "border-[var(--border)]",
                )}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-white" style={{ backgroundColor: project.color }}>
                  <Folder size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-black">{project.name}</h3>
                    <Badge tone={project.status === "Ativo" ? "green" : project.status === "Pausado" ? "orange" : "neutral"}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{project.description}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full bg-[var(--success)]" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Card className="min-w-0">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-md text-white" style={{ backgroundColor: selectedProject.color }}>
                  <Folder size={24} />
                </div>
                <h3 className="truncate text-xl font-black">{selectedProject.name}</h3>
                <p className="mt-1 text-sm text-muted">{selectedProject.area}</p>
              </div>
              <Badge tone={selectedProject.status === "Ativo" ? "green" : selectedProject.status === "Pausado" ? "orange" : "neutral"}>
                {selectedProject.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-muted">Descrição</p>
                <p className="mt-2 text-sm leading-6">{selectedProject.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <ProjectInfo label="Progresso" value={`${selectedProject.progress}%`} />
                <ProjectInfo label="Membros" value={selectedProject.members.toString()} />
                <ProjectInfo label="Área" value={selectedProject.area} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-muted">
                  <span>Conclusao</span>
                  <span>{selectedProject.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full bg-[var(--success)]" style={{ width: `${selectedProject.progress}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--border)] p-4">
                  <p className="text-xs font-bold uppercase text-muted">Identificador</p>
                  <p className="mt-2 break-all text-sm font-semibold">{selectedProject.id}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] p-4">
                  <p className="text-xs font-bold uppercase text-muted">Acesso</p>
                  <p className="mt-2 text-sm font-semibold">Participante do projeto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-4 lg:col-start-2 xl:grid-cols-2">
            <ProjectMeetingsPanel
              project={selectedProject}
              meetings={projectMeetings}
              canSchedule={selectedProject.creatorId === currentUserId}
              onScheduleMeeting={onScheduleMeeting}
            />
            <ChatView project={selectedProject} messages={projectMessages} onSendMessage={onSendChatMessage} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="mt-2 truncate text-lg font-black">{value}</p>
    </div>
  );
}

function postToProject(post: ForumPost): Project {
  const completed = post.tasks.filter((task) => task.status === "DONE").length;
  const progress = post.tasks.length ? Math.round((completed / post.tasks.length) * 100) : 0;
  const color = projectColors[Math.abs(hashString(post.id)) % projectColors.length];

  return {
    id: `post-${post.id}`,
    name: post.title,
    area: post.category,
    status: progress === 100 ? "Concluído" : "Ativo",
    description: post.body || `Projeto criado a partir de uma publicação de ${post.creatorName}.`,
    progress,
    members: post.memberIds.length,
    creatorId: post.creatorId,
    memberIds: post.memberIds,
    color,
  };
}

function postToTasks(post: ForumPost): ShellTask[] {
  return post.tasks.map((task) => ({
    id: `post-${post.id}-${task.id}`,
    title: task.title,
    projectId: `post-${post.id}`,
    status: scrumStatusToTaskStatus(task.status),
    priority: task.priority,
    points: task.points,
    sourcePostId: post.id,
    sourceTaskId: task.id,
  }));
}

function scrumStatusToTaskStatus(status: ForumPost["tasks"][number]["status"]): TaskStatus {
  const statusMap: Record<ForumPost["tasks"][number]["status"], TaskStatus> = {
    BACKLOG: "Backlog",
    TODO: "A fazer",
    IN_PROGRESS: "Em andamento",
    REVIEW: "Revisão",
    DONE: "Concluído",
  };

  return statusMap[status];
}

function taskStatusToScrumStatus(status: TaskStatus): ForumPost["tasks"][number]["status"] {
  const statusMap: Record<TaskStatus, ForumPost["tasks"][number]["status"]> = {
    Backlog: "BACKLOG",
    "A fazer": "TODO",
    "Em andamento": "IN_PROGRESS",
    Revisão: "REVIEW",
    Concluído: "DONE",
  };

  return statusMap[status];
}

function hashString(value: string) {
  return [...value].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarMonthDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function SprintsView({ project }: { project: Project }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <h2 className="font-black">Sprint atual - {project.name}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Planejamento", "Daily", "Review", "Retrospectiva"].map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--accent)]/10 text-sm font-black text-[var(--accent)]">
                {index + 1}
              </div>
              <div>
                <p className="font-bold">{step}</p>
                <p className="text-sm text-muted">Cerimônia conectada ao ciclo de entrega do projeto.</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="font-black">Meta</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Entregar o fluxo principal com backlog refinado, tarefas priorizadas e critérios de aceite revisados.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TasksView({
  projects,
  tasks,
  onMoveTask,
  onCreateTask,
}: {
  projects: Project[];
  tasks: ShellTask[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onCreateTask: (projectId: string, title: string) => void;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id ?? "");
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const selectedProjectStillVisible = projects.some((project) => project.id === taskProjectId);
  const activeProjectId = selectedProjectStillVisible ? taskProjectId : projects[0]?.id ?? "";

  useEffect(() => {
    if (!selectedProjectStillVisible) {
      setTaskProjectId(projects[0]?.id ?? "");
    }
  }, [projects, selectedProjectStillVisible]);

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProjectId || !taskTitle.trim()) return;

    onCreateTask(activeProjectId, taskTitle.trim());
    setTaskTitle("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-black">Quadro de tarefas</h2>
          <p className="text-sm text-muted">Todas as tarefas dos projetos em que o usuário participa. A cor identifica o projeto.</p>
        </div>
        <form className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 sm:grid-cols-[minmax(160px,220px)_minmax(220px,1fr)_auto]" onSubmit={submitTask}>
          <select
            value={activeProjectId}
            onChange={(event) => setTaskProjectId(event.target.value)}
            disabled={projects.length === 0}
            className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Projeto da tarefa"
          >
            {projects.length === 0 ? (
              <option value="">Sem projetos</option>
            ) : (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            )}
          </select>
          <input
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            disabled={projects.length === 0}
            placeholder="Título da tarefa"
            className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button variant="primary" disabled={projects.length === 0 || !taskTitle.trim()}>
            <Plus size={16} />
            Cadastrar
          </Button>
        </form>
      </div>
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {projects.map((project) => (
            <span key={project.id} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </span>
          ))}
        </div>
      )}
      <div className="pb-2 sm:overflow-x-auto">
        <div className="grid gap-3 sm:min-w-[900px] sm:grid-cols-5">
          {taskColumns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column);
            return (
              <div key={column} className="min-h-52 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 sm:min-h-80">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-muted">{column}</h3>
                  <Badge>{columnTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-md border border-[var(--border)] p-3 shadow-sm"
                      style={{ borderLeftWidth: 5, borderLeftColor: projectMap.get(task.projectId)?.color ?? "var(--border)" }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: projectMap.get(task.projectId)?.color ?? "var(--muted)" }} />
                        <span className="truncate text-xs font-bold text-muted">{projectMap.get(task.projectId)?.name ?? "Projeto"}</span>
                      </div>
                      <p className="text-sm font-black">{task.title}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone={task.priority === "Crítica" ? "red" : task.priority === "Alta" ? "orange" : "neutral"}>
                          {task.priority}
                        </Badge>
                        <select
                          value={task.status}
                          onChange={(event) => onMoveTask(task.id, event.target.value as TaskStatus)}
                          className="h-7 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs"
                        >
                          {taskColumns.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectMeetingsPanel({
  project,
  meetings,
  canSchedule,
  onScheduleMeeting,
}: {
  project: Project;
  meetings: ProjectMeeting[];
  canSchedule: boolean;
  onScheduleMeeting: (meeting: Omit<ProjectMeeting, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<ProjectMeeting["type"]>("Daily");

  function submitMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !date || !time) return;

    onScheduleMeeting({
      projectId: project.id,
      title: title.trim(),
      date,
      time,
      type,
    });
    setTitle("");
    setDate("");
    setTime("");
    setType("Daily");
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-black">Reuniões</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {canSchedule && (
          <form className="grid gap-2 sm:grid-cols-2" onSubmit={submitMeeting}>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título da reunião"
              className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)] sm:col-span-2"
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ProjectMeeting["type"])}
              className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)]"
              aria-label="Tipo de reunião"
            >
              {["Daily", "Planning", "Review", "Retrospectiva", "Outro"].map((meetingType) => (
                <option key={meetingType}>{meetingType}</option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
            <Button variant="primary" disabled={!title.trim() || !date || !time}>
              <CalendarDays size={16} />
              Marcar
            </Button>
          </form>
        )}

        {!canSchedule && (
          <p className="rounded-lg border border-[var(--border)] p-3 text-sm text-muted">Somente o criador do projeto pode marcar reuniões.</p>
        )}

        <div className="space-y-2">
          {meetings.length === 0 ? (
            <p className="rounded-lg border border-[var(--border)] p-3 text-sm text-muted">Nenhuma reunião marcada para este projeto.</p>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{meeting.title}</p>
                  <Badge tone="blue">{meeting.type}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                  <span>{formatDate(meeting.date)}</span>
                  <span>{meeting.time}</span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={14} />
                    Time do projeto
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarView({ projects, meetings }: { projects: Project[]; meetings: ProjectMeeting[] }) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const visibleMeetings = meetings
    .filter((meeting) => projectMap.has(meeting.projectId))
    .sort((first, second) => `${first.date}T${first.time}`.localeCompare(`${second.date}T${second.time}`));
  const monthDays = getCalendarMonthDays(visibleMonth);
  const monthLabel = visibleMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const meetingsByDate = visibleMeetings.reduce<Record<string, ProjectMeeting[]>>((grouped, meeting) => {
    grouped[meeting.date] = [...(grouped[meeting.date] ?? []), meeting].sort((first, second) => first.time.localeCompare(second.time));
    return grouped;
  }, {});

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">Calendário</h2>
          <p className="text-sm text-muted">Reuniões marcadas nos projetos em que o usuário participa.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => moveMonth(-1)} title="Mês anterior">
            <ChevronLeft size={18} />
          </Button>
          <div className="min-w-44 text-center text-sm font-black capitalize">{monthLabel}</div>
          <Button variant="outline" size="icon" onClick={() => moveMonth(1)} title="Próximo mês">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 border-b border-[var(--border)] text-center text-xs font-bold uppercase text-muted">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((weekday) => (
                  <div key={weekday} className="border-r border-[var(--border)] px-2 py-3 last:border-r-0">
                    {weekday}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dateKey = toDateKey(day);
                  const dayMeetings = meetingsByDate[dateKey] ?? [];
                  const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                  const isToday = dateKey === toDateKey(today);

                  return (
                    <div
                      key={dateKey}
                      className={cn(
                        "min-h-32 border-r border-b border-[var(--border)] p-2 last:border-r-0",
                        !inCurrentMonth && "bg-black/[0.02] text-muted dark:bg-white/[0.02]",
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-md text-sm font-bold",
                            isToday && "bg-[var(--accent)] text-white",
                          )}
                        >
                          {day.getDate()}
                        </span>
                        {dayMeetings.length > 0 && <Badge>{dayMeetings.length}</Badge>}
                      </div>
                      <div className="space-y-1.5">
                        {dayMeetings.map((meeting) => {
                          const project = projectMap.get(meeting.projectId);

                          return (
                            <div
                              key={meeting.id}
                              className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2 text-left shadow-sm"
                              style={{ borderLeftWidth: 4, borderLeftColor: project?.color ?? "var(--accent)" }}
                            >
                              <div className="flex items-center gap-1 text-[11px] font-bold text-muted">
                                <span>{meeting.time}</span>
                                <span>-</span>
                                <span>{meeting.type}</span>
                              </div>
                              <p className="mt-1 truncate text-xs font-black">{meeting.title}</p>
                              <p className="truncate text-[11px] text-muted">{project?.name ?? "Projeto"}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChatView({
  project,
  messages,
  onSendMessage,
}: {
  project: Project;
  messages: ChatMessage[];
  onSendMessage: (projectId: string, body: string) => void;
}) {
  const [message, setMessage] = useState("");
  const sortedMessages = [...messages].sort((first, second) => first.createdAt.localeCompare(second.createdAt));

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) return;

    onSendMessage(project.id, message.trim());
    setMessage("");
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-black">Canal #{project.name.toLowerCase().replaceAll(" ", "-")}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-[var(--border)] p-3">
          {sortedMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nenhuma mensagem enviada neste projeto.</p>
          ) : (
            sortedMessages.map((chatMessage) => (
              <div key={chatMessage.id} className="flex gap-3">
                <Avatar label={chatMessage.authorInitials} />
                <div className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 text-sm dark:bg-white/[0.03]">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{chatMessage.authorName}</p>
                    <span className="text-xs text-muted">{formatMessageTime(chatMessage.createdAt)}</span>
                  </div>
                  <p className="break-words leading-5">{chatMessage.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={submitMessage}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Enviar mensagem"
            className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)]"
          />
          <Button disabled={!message.trim()}>Enviar</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/12 p-2 text-white">
      <strong className="block text-sm font-black">{value}</strong>
      <span className="text-[10px] font-semibold uppercase text-white/60">{label}</span>
    </div>
  );
}

function ScrubLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div
        className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-white p-1.5 shadow-sm shadow-blue-950/20"
        aria-label="SCRUB CIEE Rio"
      >
        <img src="/scrub-icon.png" alt="Ícone SCRUB" className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className="flex h-14 shrink-0 items-center gap-3 rounded-md bg-white px-3 shadow-sm shadow-blue-950/20"
      aria-label="SCRUB CIEE Rio"
    >
      <img src="/scrub-icon.png" alt="Ícone SCRUB" className="h-10 w-10 object-contain" />
      <span className="text-xl font-black tracking-[0.14em] text-[var(--accent)]">SCRUB</span>
    </div>
  );
}
