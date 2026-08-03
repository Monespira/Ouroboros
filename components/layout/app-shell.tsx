"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Folder,
  Landmark,
  Megaphone,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Repeat,
  RotateCcw,
  Sun,
  Users,
  X,
} from "lucide-react";
import { ForumLanding, type ForumPost } from "@/components/forum-landing";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, createClientId } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";
import type { CrmExtras } from "@/components/crm/crm-workspace";

const CrmWorkspace = dynamic(
  () => import("@/components/crm/crm-workspace").then(module => module.CrmWorkspace),
  { loading: () => <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-muted">Carregando CRM local…</div> },
);

type ViewId = "forum" | "projects" | "tasks" | "calendar" | "crm" | "ai";
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
  deliveryDate?: string;
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
  type: "Daily" | "Planning" | "Review" | "Retrospectiva" | "Outro" | "Entrega";
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

const projectColors = ["#344a3b", "#c9973d", "#62715f", "#8a6a32", "#506553", "#9d7b3d"];

const views: Array<{
  id: ViewId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "forum", label: "Fórum", description: "Posts e ciclos do Ouroboros", icon: MessageSquare },
  { id: "projects", label: "Projetos", description: "Carteira de projetos", icon: Folder },
  { id: "tasks", label: "Tarefas", description: "Backlog operacional", icon: ClipboardList },
  { id: "calendar", label: "Calendário", description: "Agenda de reuniões", icon: CalendarDays },
  { id: "crm", label: "CRM", description: "Clientes, propostas e faturamento", icon: BriefcaseBusiness },
  { id: "ai", label: "IAs locais", description: "Agentes privados da Monespira", icon: Bot },
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
    memberIds: ["bruce", "bruno", "", "", "", "", "", "", "","","", "", "", "", "", "", "", "", "","","", "", "", "", "", "", "", "", "","","", "", "", "", ""],
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

type SharedWorkspace = {
  posts: ForumPost[];
  meetings: ProjectMeeting[];
  chatMessages: ChatMessage[];
  completedProjectIds: string[];
  crmLeads: CrmLead[];
  crmAccounts: CrmAccount[];
  crmContacts: CrmContact[];
  crmOpportunities: CrmOpportunity[];
  crmActivities: CrmActivity[];
  crmExtras: CrmExtras;
};

type CrmLead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  value: number;
  status: "Novo" | "Em contato" | "Qualificado" | "Não qualificado";
  source: string;
  owner: string;
  nextAction: string;
};
type CrmAccount = { id: string; name: string; owner: string; industry: string; website: string };
type CrmContact = { id: string; accountId: string; name: string; email: string; phone: string; role: string };
type CrmStage = string;
type CrmOpportunity = { id: string; accountId: string; name: string; value: number; stage: CrmStage; probability: number; closeDate: string; owner: string; nextAction: string };
type CrmActivity = { id: string; relatedId: string; subject: string; type: "Tarefa" | "Reunião" | "Ligação"; dueDate: string; completed: boolean; owner: string };

type WorkspaceResponse = {
  revision: number;
  data: Partial<SharedWorkspace>;
};

const LEGACY_STORAGE_KEY = "scrub-workspace-v1";

export function AppShell({ authenticatedUser }: { authenticatedUser: AuthUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>("forum");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [meetings, setMeetings] = useState<ProjectMeeting[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [completedProjectIds, setCompletedProjectIds] = useState<string[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [crmAccounts, setCrmAccounts] = useState<CrmAccount[]>([]);
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [crmOpportunities, setCrmOpportunities] = useState<CrmOpportunity[]>([]);
  const [crmActivities, setCrmActivities] = useState<CrmActivity[]>([]);
  const [crmExtras, setCrmExtras] = useState<CrmExtras>({ interactions: [], transactions: [], pipelineHistory: [], segments: [], campaigns: [], automations: [], notifications: [], integrations: [] });
  const [storageReady, setStorageReady] = useState(false);
  const revisionRef = useRef(0);
  const lastSyncedRef = useRef("");
  const savingRef = useRef(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const activeMeta = views.find((view) => view.id === activeView) ?? views[0];
  const sidebarCollapsed = collapsed && !mobileOpen;
  const currentUser = authenticatedUser;
  const completedProjectIdSet = useMemo(() => new Set(completedProjectIds), [completedProjectIds]);
  const activeForumPosts = useMemo(
    () => posts.filter((post) => !completedProjectIdSet.has(`post-${post.id}`)),
    [completedProjectIdSet, posts],
  );
  const forumProjects = useMemo(
    () => posts.map((post) => postToProject(post, completedProjectIdSet.has(`post-${post.id}`))),
    [completedProjectIdSet, posts],
  );
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
  const taskProjects = useMemo(
    () => visibleProjects.filter((project) => project.status !== "Concluído"),
    [visibleProjects],
  );
  const taskProjectIds = useMemo(() => new Set(taskProjects.map((project) => project.id)), [taskProjects]);
  const activeProjectTasks = useMemo(
    () => visibleTasks.filter((task) => taskProjectIds.has(task.projectId)),
    [taskProjectIds, visibleTasks],
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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workspace", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar o workspace compartilhado");
        return response.json() as Promise<WorkspaceResponse>;
      })
      .then(async (workspace) => {
        if (cancelled) return;
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        const serverIsEmpty = [workspace.data.posts, workspace.data.meetings, workspace.data.chatMessages, workspace.data.completedProjectIds, workspace.data.crmLeads, workspace.data.crmAccounts, workspace.data.crmContacts, workspace.data.crmOpportunities, workspace.data.crmActivities]
          .every((items) => !Array.isArray(items) || items.length === 0);
        if (legacy && serverIsEmpty) {
          try {
            const legacyData = JSON.parse(legacy) as Partial<SharedWorkspace>;
            const migrated: SharedWorkspace = {
              posts: Array.isArray(legacyData.posts) ? legacyData.posts : [],
              meetings: Array.isArray(legacyData.meetings) ? legacyData.meetings : [],
              chatMessages: Array.isArray(legacyData.chatMessages) ? legacyData.chatMessages : [],
              completedProjectIds: Array.isArray(legacyData.completedProjectIds) ? legacyData.completedProjectIds : [],
              crmLeads: Array.isArray(legacyData.crmLeads) ? legacyData.crmLeads : [],
              crmAccounts: Array.isArray(legacyData.crmAccounts) ? legacyData.crmAccounts : [],
              crmContacts: Array.isArray(legacyData.crmContacts) ? legacyData.crmContacts : [],
              crmOpportunities: Array.isArray(legacyData.crmOpportunities) ? legacyData.crmOpportunities : [],
              crmActivities: Array.isArray(legacyData.crmActivities) ? legacyData.crmActivities : [],
              crmExtras: legacyData.crmExtras ?? { interactions: [], transactions: [], pipelineHistory: [], segments: [], campaigns: [], automations: [], notifications: [], integrations: [] },
            };
            if ([migrated.posts, migrated.meetings, migrated.chatMessages, migrated.completedProjectIds, migrated.crmLeads, migrated.crmAccounts, migrated.crmContacts, migrated.crmOpportunities, migrated.crmActivities].some((items) => items.length > 0)) {
              const response = await fetch("/api/workspace", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revision: workspace.revision, data: migrated }),
              });
              if (response.ok) workspace = (await response.json()) as WorkspaceResponse;
            }
          } catch {
            // Estado legado inválido é ignorado; o workspace central continua íntegro.
          }
        }
        applyWorkspace(workspace);
      })
      .finally(() => {
        if (!cancelled) setStorageReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const data: SharedWorkspace = { posts, meetings, chatMessages, completedProjectIds, crmLeads, crmAccounts, crmContacts, crmOpportunities, crmActivities, crmExtras };
    const timer = window.setTimeout(async () => {
      const serialized = JSON.stringify(data);
      if (serialized === lastSyncedRef.current) return;
      if (savingRef.current) return;
      savingRef.current = true;
      try {
        let response = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revision: revisionRef.current, data }),
        });
        if (response.status === 409) {
          const current = (await response.json()) as WorkspaceResponse;
          revisionRef.current = current.revision;
          response = await fetch("/api/workspace", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ revision: revisionRef.current, data }),
          });
        }
        if (!response.ok) throw new Error("Falha ao salvar o workspace compartilhado");
        const saved = (await response.json()) as WorkspaceResponse;
        revisionRef.current = saved.revision;
        lastSyncedRef.current = serialized;
      } finally {
        savingRef.current = false;
      }
    }, 750);
    return () => window.clearTimeout(timer);
  }, [chatMessages, completedProjectIds, crmAccounts, crmActivities, crmContacts, crmLeads, crmOpportunities, crmExtras, meetings, posts, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setInterval(async () => {
      if (savingRef.current || document.hidden) return;
      const response = await fetch("/api/workspace", { cache: "no-store" });
      if (!response.ok) return;
      const workspace = (await response.json()) as WorkspaceResponse;
      if (workspace.revision > revisionRef.current) applyWorkspace(workspace);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [storageReady]);

  function applyWorkspace(workspace: WorkspaceResponse) {
    const data = workspace.data;
    const normalized: SharedWorkspace = {
      posts: Array.isArray(data.posts) ? data.posts : [],
      meetings: Array.isArray(data.meetings) ? data.meetings : [],
      chatMessages: Array.isArray(data.chatMessages) ? data.chatMessages : [],
      completedProjectIds: Array.isArray(data.completedProjectIds) ? data.completedProjectIds : [],
      crmLeads: Array.isArray(data.crmLeads) ? data.crmLeads : [],
      crmAccounts: Array.isArray(data.crmAccounts) ? data.crmAccounts : [],
      crmContacts: Array.isArray(data.crmContacts) ? data.crmContacts : [],
      crmOpportunities: Array.isArray(data.crmOpportunities) ? data.crmOpportunities : [],
      crmActivities: Array.isArray(data.crmActivities) ? data.crmActivities : [],
      crmExtras: data.crmExtras ?? { interactions: [], transactions: [], pipelineHistory: [], segments: [], campaigns: [], automations: [], notifications: [], integrations: [] },
    };
    revisionRef.current = workspace.revision;
    lastSyncedRef.current = JSON.stringify(normalized);
    setPosts(normalized.posts);
    setMeetings(normalized.meetings);
    setChatMessages(normalized.chatMessages);
    setCompletedProjectIds(normalized.completedProjectIds);
    setCrmLeads(normalized.crmLeads);
    setCrmAccounts(normalized.crmAccounts);
    setCrmContacts(normalized.crmContacts);
    setCrmOpportunities(normalized.crmOpportunities);
    setCrmActivities(normalized.crmActivities);
    setCrmExtras(normalized.crmExtras);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

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
                  id: createClientId(),
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
    setMeetings((current) => [{ id: createClientId(), ...meeting }, ...current]);
  }

  function changeTaskPriority(taskId: string, priority: ShellTask["priority"]) {
    const forumTask = forumTasks.find((task) => task.id === taskId);
    if (!forumTask?.sourcePostId || !forumTask.sourceTaskId) return;

    setPosts((current) =>
      current.map((post) =>
        post.id === forumTask.sourcePostId
          ? {
              ...post,
              tasks: post.tasks.map((task) => (task.id === forumTask.sourceTaskId ? { ...task, priority } : task)),
            }
          : post,
      ),
    );
  }

  function setProjectCompleted(projectId: string, completed: boolean) {
    setCompletedProjectIds((current) =>
      completed ? (current.includes(projectId) ? current : [...current, projectId]) : current.filter((id) => id !== projectId),
    );
    setSelectedProjectId(projectId);
  }

  function setProjectDeliveryDate(projectId: string, deliveryDate: string) {
    const postId = projectId.replace(/^post-/, "");
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, deliveryDate: deliveryDate || undefined } : post
    )));
  }

  function sendChatMessage(projectId: string, body: string) {
    if (!body.trim()) return;

    setChatMessages((current) => [
      ...current,
      {
        id: createClientId(),
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
          className="fixed inset-0 z-30 bg-black/45 xl:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "brand-gradient fixed inset-y-0 left-0 z-40 flex border-r border-white/15 text-white shadow-xl shadow-blue-950/25 transition-all duration-200 xl:hidden",
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

      <div>
        <header className="sticky top-0 z-20 px-3 py-3 backdrop-blur-md sm:px-5 lg:py-5">
          <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/92 px-3 py-2 shadow-sm shadow-[var(--accent)]/5 sm:px-4 xl:grid xl:grid-cols-[minmax(190px,1fr)_auto_minmax(190px,1fr)]">
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className="xl:hidden">
              <ScrubLogo compact />
            </div>
            <div className="hidden min-w-0 items-center gap-3 xl:flex">
              <img src="/ouroboros-icon.png" alt="" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-sm font-black tracking-[0.16em]">OUROBOROS</span>
            </div>
            <nav className="hidden items-center gap-1 rounded-full bg-[var(--accent-soft)]/80 p-1.5 xl:flex" aria-label="Navegação principal">
              {views.map((view) => {
                const Icon = view.icon;
                const active = activeView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => selectView(view.id)}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition",
                      active ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-muted hover:text-[var(--foreground)]",
                    )}
                  >
                    <Icon size={16} />
                    {view.label}
                  </button>
                );
              })}
            </nav>
            <div className="min-w-0 flex-1 xl:hidden">
              <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-2)]">OUROBOROS</div>
              <h1 className="truncate text-lg font-black">{activeMeta.label}</h1>
            </div>
            <div className="ml-auto flex min-w-0 items-center justify-end gap-2 xl:ml-0">
              <Button variant="outline" size="icon" onClick={() => setDark((value) => !value)} title="Alternar tema">
                {dark ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
              <div className="hidden text-right 2xl:block">
                <p className="text-sm font-black">{currentUser.name}</p>
                <button onClick={logout} className="text-xs font-semibold text-muted hover:text-[var(--accent)]">Sair</button>
              </div>
              {activeView === "forum" ? (
                <a href="#novo-post" className="hidden 2xl:block">
                  <Button variant="primary" size="sm">Nova publicação</Button>
                </a>
              ) : null}
              <Avatar label={currentUser.initials} />
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-6rem)] max-w-[1440px] px-3 pb-8 pt-2 sm:px-5 md:pb-12">
          <section className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)]/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-2)]">Workspace Ouroboros</span>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] md:text-5xl">{activeMeta.label}</h1>
              <p className="mt-2 text-sm text-muted md:text-base">{activeMeta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold">{projectStats.active} ativos</span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold">{projectStats.members} pessoas</span>
              <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold">{projectStats.doneTasks} concluídas</span>
            </div>
          </section>
          {activeView === "forum" && (
            <ForumLanding
              posts={activeForumPosts}
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
              onSetProjectCompleted={setProjectCompleted}
              onSetProjectDeliveryDate={setProjectDeliveryDate}
            />
          )}
          {activeView === "tasks" && (
            <TasksView
              projects={taskProjects}
              tasks={activeProjectTasks}
              onMoveTask={moveTask}
              onChangeTaskPriority={changeTaskPriority}
              onCreateTask={addTaskToProject}
            />
          )}
          {activeView === "calendar" && <CalendarView projects={visibleProjects} meetings={meetings} />}
          {activeView === "crm" && <CrmWorkspace
            leads={crmLeads} accounts={crmAccounts} contacts={crmContacts} opportunities={crmOpportunities} activities={crmActivities}
            onLeadsChange={setCrmLeads} onAccountsChange={setCrmAccounts} onContactsChange={setCrmContacts}
            onOpportunitiesChange={setCrmOpportunities} onActivitiesChange={setCrmActivities}
            extras={crmExtras} onExtrasChange={setCrmExtras} currentUser={currentUser.name}
          />}
          {activeView === "ai" && <LocalAgentsView context={{ projects: visibleProjects.length, tasks: visibleTasks.length, leads: crmLeads.length }} />}
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
  onSetProjectCompleted,
  onSetProjectDeliveryDate,
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
  onSetProjectCompleted: (projectId: string, completed: boolean) => void;
  onSetProjectDeliveryDate: (projectId: string, deliveryDate: string) => void;
}) {
  const [projectList, setProjectList] = useState<"active" | "completed">("active");
  const listedProjects = projects.filter((project) =>
    projectList === "completed" ? project.status === "Concluído" : project.status !== "Concluído",
  );
  const selectedProject = listedProjects.find((project) => project.id === selectedProjectId) ?? listedProjects[0];
  const projectMeetings = selectedProject ? meetings.filter((meeting) => meeting.projectId === selectedProject.id) : [];
  const projectMessages = selectedProject ? chatMessages.filter((message) => message.projectId === selectedProject.id) : [];

  return (
    <div className="space-y-5">
      <div className="flex min-h-13 items-center">
      <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5" role="tablist" aria-label="Filtrar projetos">
        <button
          type="button"
          role="tab"
          aria-selected={projectList === "active"}
          onClick={() => setProjectList("active")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-bold transition",
            projectList === "active" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-[var(--foreground)]",
          )}
        >
          Em andamento ({projects.filter((project) => project.status !== "Concluído").length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={projectList === "completed"}
          onClick={() => setProjectList("completed")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-bold transition",
            projectList === "completed" ? "bg-[var(--accent)] text-white shadow-sm" : "text-muted hover:text-[var(--foreground)]",
          )}
        >
          Concluídos ({projects.filter((project) => project.status === "Concluído").length})
        </button>
      </div>
      </div>

      {listedProjects.length === 0 || !selectedProject ? (
        <Card>
          <CardContent className="grid min-h-56 place-items-center text-center">
            <div>
              <h3 className="text-lg font-black">
                {projectList === "completed" ? "Nenhum projeto concluído" : "Nenhum projeto em andamento"}
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted">
                {projectList === "completed"
                  ? "Os projetos marcados como concluídos aparecerão aqui."
                  : "Solicite participação em um post do fórum para acompanhar o projeto aqui."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <div className="space-y-2">
            {listedProjects.map((project) => (
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
                  <p className="mt-2 text-xs font-bold text-[var(--accent-blue)]">
                    {project.deliveryDate ? `Entrega: ${formatDate(project.deliveryDate)}` : "Entrega não definida"}
                  </p>
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
              <div className="flex justify-end">
                {selectedProject.status === "Concluído" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSetProjectCompleted(selectedProject.id, false);
                      setProjectList("active");
                    }}
                  >
                    <RotateCcw size={16} />
                    Desmarcar conclusão
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSetProjectCompleted(selectedProject.id, true);
                      setProjectList("completed");
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Concluir projeto
                  </Button>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted">Descrição</p>
                <p className="mt-2 text-sm leading-6">{selectedProject.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <ProjectInfo label="Progresso" value={`${selectedProject.progress}%`} />
                <ProjectInfo label="Membros" value={selectedProject.members.toString()} />
                <ProjectInfo label="Área" value={selectedProject.area} />
              </div>

              <div className="rounded-lg border border-[var(--border)] p-4">
                <label className="text-xs font-bold uppercase text-muted" htmlFor={`delivery-${selectedProject.id}`}>
                  Data de entrega
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id={`delivery-${selectedProject.id}`}
                    type="date"
                    value={selectedProject.deliveryDate ?? ""}
                    disabled={selectedProject.creatorId !== currentUserId}
                    onChange={(event) => onSetProjectDeliveryDate(selectedProject.id, event.target.value)}
                    className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p className="text-xs text-muted">
                    {selectedProject.deliveryDate
                      ? `A entrega aparece no calendário em ${formatDate(selectedProject.deliveryDate)}.`
                      : "Defina uma data para exibir a entrega no calendário."}
                  </p>
                </div>
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

function postToProject(post: ForumPost, completedByUser: boolean): Project {
  const completed = post.tasks.filter((task) => task.status === "DONE").length;
  const progress = post.tasks.length ? Math.round((completed / post.tasks.length) * 100) : 0;
  const color = projectColors[Math.abs(hashString(post.id)) % projectColors.length];

  return {
    id: `post-${post.id}`,
    name: post.title,
    area: post.category,
    status: completedByUser ? "Concluído" : "Ativo",
    description: post.body || `Projeto criado a partir de uma publicação de ${post.creatorName}.`,
    progress,
    members: post.memberIds.length,
    creatorId: post.creatorId,
    memberIds: post.memberIds,
    color,
    deliveryDate: post.deliveryDate,
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
  onChangeTaskPriority,
  onCreateTask,
}: {
  projects: Project[];
  tasks: ShellTask[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onChangeTaskPriority: (taskId: string, priority: ShellTask["priority"]) => void;
  onCreateTask: (projectId: string, title: string) => void;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id ?? "");
  const [projectFilterId, setProjectFilterId] = useState("all");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const filteredTasks = projectFilterId === "all" ? tasks : tasks.filter((task) => task.projectId === projectFilterId);
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
      <div className="flex min-h-13 justify-end">
        <form className="grid w-full gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 sm:w-auto sm:grid-cols-[minmax(160px,220px)_minmax(220px,1fr)_auto]" onSubmit={submitTask}>
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
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <label htmlFor="task-project-filter" className="text-xs font-black uppercase text-muted">
            Filtrar por projeto
          </label>
          <select
            id="task-project-filter"
            value={projectFilterId}
            onChange={(event) => {
              setProjectFilterId(event.target.value);
              setExpandedTaskId(null);
            }}
            className="h-9 min-w-52 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold outline-none focus:border-[var(--accent)]"
          >
            <option value="all">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Badge>{filteredTasks.length} tarefas</Badge>
        </div>
      )}
      <div className="pb-2 sm:overflow-x-auto">
        <div className="grid gap-3 sm:min-w-[900px] sm:grid-cols-5">
          {taskColumns.map((column) => {
            const columnTasks = filteredTasks.filter((task) => task.status === column);
            return (
              <div key={column} className="min-h-52 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 sm:min-h-80">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-muted">{column}</h3>
                  <Badge>{columnTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-md border border-[var(--border)] px-2.5 py-2 shadow-sm transition hover:border-[var(--accent)]"
                      style={{ borderLeftWidth: 5, borderLeftColor: projectMap.get(task.projectId)?.color ?? "var(--border)" }}
                    >
                      <button
                        type="button"
                        aria-expanded={expandedTaskId === task.id}
                        onClick={() => setExpandedTaskId((current) => (current === task.id ? null : task.id))}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: projectMap.get(task.projectId)?.color ?? "var(--muted)" }} />
                          <span className="truncate text-[11px] font-bold text-muted">{projectMap.get(task.projectId)?.name ?? "Projeto"}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs font-black leading-4">{task.title}</p>
                      </button>
                      {expandedTaskId === task.id && (
                        <div className="mt-2 grid gap-2 border-t border-[var(--border)] pt-2">
                          <label className="grid gap-1 text-[10px] font-bold uppercase text-muted">
                            Prioridade
                            <select
                              value={task.priority}
                              onChange={(event) => onChangeTaskPriority(task.id, event.target.value as ShellTask["priority"])}
                              className={cn(
                                "h-8 rounded-full border px-2 text-xs font-bold outline-none",
                                task.priority === "Crítica" || task.priority === "Alta"
                                  ? "border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
                                  : "border-[var(--border)] bg-[var(--card)]",
                              )}
                            >
                              {(["Baixa", "Média", "Alta", "Crítica"] as ShellTask["priority"][]).map((priority) => (
                                <option key={priority}>{priority}</option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-[10px] font-bold uppercase text-muted">
                            Status
                            <select
                              value={task.status}
                              onChange={(event) => onMoveTask(task.id, event.target.value as TaskStatus)}
                              className="h-8 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 text-xs"
                            >
                              {taskColumns.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}
                    </article>
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
  const deliveryEvents: ProjectMeeting[] = projects
    .filter((project) => Boolean(project.deliveryDate))
    .map((project) => ({
      id: `delivery-${project.id}`,
      projectId: project.id,
      title: `Entrega: ${project.name}`,
      date: project.deliveryDate as string,
      time: "23:59",
      type: "Entrega",
    }));
  const visibleMeetings = [...meetings, ...deliveryEvents]
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
      <div className="flex min-h-13 items-center justify-end">
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


type LocalSpecialistId = "sales" | "marketing" | "finance" | "projects" | "operations" | "orchestrator" | "knowledge" | "auditor" | "brand" | "security";

const localSpecialistOptions: Array<{ id: LocalSpecialistId; label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id:"orchestrator", label:"Orquestrador-geral", description:"Planeja, classifica riscos e coordena aprovações.", icon:Bot },
  { id:"knowledge", label:"Chefe de conhecimento", description:"Organiza fontes, versões e memória empresarial.", icon:Folder },
  { id:"auditor", label:"Auditor de IA", description:"Verifica fontes, permissões e alucinações.", icon:CheckCircle2 },
  { id:"brand", label:"Guardião da marca", description:"Revisa identidade e tom de voz Monespira.", icon:Megaphone },
  { id:"sales", label:"Comercial e CRM", description:"Apoia prospecção, diagnóstico e follow-up.", icon:BriefcaseBusiness },
  { id:"marketing", label:"Marketing", description:"Planeja conteúdo, campanhas e crescimento.", icon:Megaphone },
  { id:"finance", label:"Financeiro", description:"Analisa caixa, margem, previsões e precificação.", icon:Landmark },
  { id:"projects", label:"Projetos", description:"Mapeia escopo, dependências e próximos passos.", icon:ClipboardList },
  { id:"operations", label:"Operações", description:"Acompanha capacidade, processos e indicadores.", icon:Repeat },
  { id:"security", label:"Segurança", description:"Avalia riscos, hardening e continuidade.", icon:CheckCircle2 },
];

function LocalAgentsView({ context }: { context: Record<string, number> }) {
  const [specialist, setSpecialist] = useState<LocalSpecialistId>("orchestrator");
  const [message, setMessage] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [model, setModel] = useState("");
  const [routedSpecialist, setRoutedSpecialist] = useState<LocalSpecialistId | "">("");
  const [documentSources, setDocumentSources] = useState<Array<{ id:string; source:string; pages:string; warning:string|null }>>([]);
  const [conversationId, setConversationId] = useState("");
  const [answerMessageId, setAnswerMessageId] = useState("");
  const [conversations, setConversations] = useState<Array<{ id:string; title:string; createdAt:string; lastMessage?:string }>>([]);
  const [trainingOptIn, setTrainingOptIn] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const selected = localSpecialistOptions.find((item) => item.id === specialist)!;

  async function refreshConversations() {
    const response = await fetch("/api/ai/conversations", { cache:"no-store" });
    const body = await response.json().catch(()=>null) as { conversations?:Array<{ id:string; title:string; createdAt:string; lastMessage?:string }> } | null;
    if (response.ok) setConversations(body?.conversations || []);
  }
  useEffect(() => { void refreshConversations(); }, []);

  async function ask(event: React.FormEvent) {
    event.preventDefault(); if (!message.trim()) return; setLoading(true); setError(""); setAnswer(""); setRoutedSpecialist(""); setDocumentSources([]);
    try {
      const response = await fetch("/api/ai", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ specialist, message:message.trim(), referenceUrl:referenceUrl.trim() || undefined, context, conversationId:conversationId||undefined, trainingOptIn }) });
      const body = await response.json().catch(() => null) as { answer?:string; error?:string; model?:string; conversationId?:string; messageId?:string; routedSpecialist?:LocalSpecialistId; sources?:Array<{ id:string; source:string; pages:string; warning:string|null }> } | null;
      if (!response.ok) setError(body?.error || "Agente local indisponível."); else { setAnswer(body?.answer || "Sem resposta."); setModel(body?.model || ""); setConversationId(body?.conversationId || ""); setAnswerMessageId(body?.messageId || ""); setRoutedSpecialist(body?.routedSpecialist || specialist); setDocumentSources(body?.sources || []); setMessage(""); setFeedbackStatus(""); await refreshConversations(); }
    } catch { setError("Falha ao comunicar com o agente local."); }
    finally { setLoading(false); }
  }

  async function openConversation(id: string) {
    const response=await fetch(`/api/ai/conversations/${encodeURIComponent(id)}`,{cache:"no-store"});
    const body=await response.json().catch(()=>null) as { trainingOptIn?:number; messages?:Array<{id:string;role:string;content:string}> }|null;
    if(!response.ok)return; const last=body?.messages?.filter((item)=>item.role==="assistant").at(-1); setConversationId(id); setTrainingOptIn(Boolean(body?.trainingOptIn)); setAnswer(last?.content||""); setAnswerMessageId(last?.id||""); setFeedbackStatus("");
  }
  async function deleteCurrentConversation() {
    if(!conversationId)return; const response=await fetch(`/api/ai/conversations/${encodeURIComponent(conversationId)}`,{method:"DELETE"});
    if(response.ok){setConversationId("");setAnswer("");setAnswerMessageId("");await refreshConversations();}
  }
  async function sendFeedback(rating:-1|1) {
    if(!answerMessageId)return; const response=await fetch("/api/ai/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messageId:answerMessageId,rating,comment:feedbackComment.trim()})});
    setFeedbackStatus(response.ok?"Feedback registrado.":"Não foi possível registrar o feedback."); if(response.ok)setFeedbackComment("");
  }

  return <div className="space-y-5">
    <Card className="overflow-hidden"><CardContent className="grid gap-4 p-5 md:grid-cols-3">
      <div><Badge tone="green">LOCAL</Badge><h2 className="mt-3 text-xl font-black">Privacidade por padrão</h2><p className="mt-1 text-sm text-muted">Inferência via Ollama no computador host. Nenhuma API de IA em nuvem.</p></div>
      <div><Badge>WEB RESTRITA</Badge><h2 className="mt-3 text-xl font-black">Consulta, não download</h2><p className="mt-1 text-sm text-muted">Somente HTTPS, domínios permitidos e texto de até 256 KB, mantido apenas em memória.</p></div>
      <div><Badge>APROVAÇÃO</Badge><h2 className="mt-3 text-xl font-black">Sem ação autônoma</h2><p className="mt-1 text-sm text-muted">Os agentes recomendam; não publicam, instalam, pagam, apagam ou alteram permissões.</p></div>
    </CardContent></Card>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{localSpecialistOptions.map((item) => { const Icon=item.icon; return <button key={item.id} type="button" onClick={()=>setSpecialist(item.id)} className={cn("rounded-xl border p-4 text-left transition", specialist===item.id?"border-[var(--accent)] bg-[var(--accent)] text-white":"border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]")}><Icon size={20}/><strong className="mt-3 block text-sm">{item.label}</strong><span className={cn("mt-1 block text-xs leading-5",specialist===item.id?"text-white/70":"text-muted")}>{item.description}</span></button>; })}</div>
    <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]"><Card><CardHeader><div className="flex items-center justify-between gap-2"><h2 className="font-black">Conversas</h2><Button size="sm" variant="outline" onClick={()=>{setConversationId("");setAnswer("");setAnswerMessageId("");}}>Nova</Button></div></CardHeader><CardContent className="space-y-2">{conversations.map((item)=><button type="button" key={item.id} onClick={()=>void openConversation(item.id)} className={cn("w-full rounded-lg border p-3 text-left",conversationId===item.id?"border-[var(--accent)] bg-[var(--accent-soft)]":"border-[var(--border)]")}><strong className="block truncate text-sm">{item.title}</strong><span className="mt-1 block truncate text-xs text-muted">{item.lastMessage||"Sem mensagens"}</span></button>)}{conversations.length===0&&<p className="text-sm text-muted">Nenhuma conversa persistida.</p>}{conversationId&&<Button size="sm" variant="danger" className="w-full" onClick={()=>void deleteCurrentConversation()}>Apagar conversa</Button>}</CardContent></Card>
    <Card><CardHeader><div><h2 className="text-lg font-black">Consultar {selected.label}</h2><p className="text-sm text-muted">A URL é opcional e precisa pertencer à lista segura configurada no servidor.</p></div></CardHeader><CardContent><form className="space-y-3" onSubmit={ask}>
      <textarea required maxLength={4000} rows={5} value={message} onChange={(event)=>setMessage(event.target.value)} placeholder="Descreva a análise ou tarefa consultiva" className="w-full resize-y rounded-lg border border-[var(--border)] bg-transparent p-3 text-sm outline-none focus:border-[var(--accent)]" />
      <input type="url" maxLength={2000} value={referenceUrl} onChange={(event)=>setReferenceUrl(event.target.value)} placeholder="https://fonte-permitida.exemplo/pagina (opcional)" className="crm-input w-full" />
      <label className="flex items-start gap-2 text-xs text-muted"><input type="checkbox" checked={trainingOptIn} onChange={(event)=>setTrainingOptIn(event.target.checked)} /><span>Autorizo usar os feedbacks desta conversa na preparação de datasets supervisionados. O treinamento continua sujeito a revisão humana.</span></label>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">Conteúdo externo é tratado como não confiável e não pode dar instruções ao agente.</p><Button type="submit" variant="primary" disabled={loading || !message.trim()}>{loading?"Processando localmente...":"Consultar IA local"}</Button></div>
    </form>{error&&<p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}{answer&&<div className="mt-4"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge tone="green">{model||"Ollama"}</Badge><span className="text-xs text-muted">Resposta gerada localmente</span>{routedSpecialist&&<Badge>Triagem: {localSpecialistOptions.find((item)=>item.id===routedSpecialist)?.label||routedSpecialist}</Badge>}</div><div className="whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-black/[.02] p-4 text-sm leading-6 dark:bg-white/[.03]">{answer}</div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={()=>void sendFeedback(1)}>👍 Útil</Button><Button size="sm" variant="outline" onClick={()=>void sendFeedback(-1)}>👎 Corrigir</Button><input value={feedbackComment} onChange={(event)=>setFeedbackComment(event.target.value)} maxLength={2000} placeholder="Comentário opcional; obrigatório para ensinar uma correção" className="crm-input min-w-64 flex-1" /></div>{feedbackStatus&&<p className="mt-2 text-xs text-muted">{feedbackStatus}</p>}{documentSources.length>0&&<div className="mt-3 rounded-lg border border-[var(--border)] p-3"><strong className="text-xs uppercase tracking-wide">Base documental selecionada</strong><ul className="mt-2 space-y-2 text-xs text-muted">{documentSources.map((source)=><li key={source.id}><span className="font-semibold text-[var(--foreground)]">{source.source}</span> · páginas {source.pages}{source.warning&&<span className="mt-1 block text-amber-700 dark:text-amber-300">{source.warning}</span>}</li>)}</ul></div>}</div>}</CardContent></Card></div>
  </div>;
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
      <img
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        aria-label="Ouroboros"
        src="/ouroboros-icon.png"
        alt="Ouroboros"
      />
    );
  }

  return (
    <div
      className="flex h-14 shrink-0 items-center gap-3 px-2"
      aria-label="Ouroboros"
    >
      <img src="/ouroboros-icon.png" alt="" className="h-11 w-11 rounded-full object-cover" />
      <span className="text-base font-black tracking-[0.16em] text-white">OUROBOROS</span>
    </div>
  );
}
