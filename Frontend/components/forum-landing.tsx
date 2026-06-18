"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ScrumStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type PostKind = "Discussao" | "Ideia" | "Problema" | "Sugestao" | "Atualizacao" | "Documentacao";
export type PostVote = 1 | -1;

export type ScrumTask = {
  id: string;
  title: string;
  status: ScrumStatus;
  priority: "Baixa" | "Media" | "Alta" | "Critica";
  points: number;
};

export type ForumUser = {
  id: string;
  name: string;
  initials: string;
};

export type ParticipationRequest = {
  id: string;
  userId: string;
  userName: string;
  createdAt: string;
};

export type ForumPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  kind: PostKind;
  creatorId: string;
  creatorName: string;
  memberIds: string[];
  requests: ParticipationRequest[];
  score: number;
  votes: Record<string, PostVote>;
  comments: string[];
  tasks: ScrumTask[];
  createdAt: string;
};

export const forumUsers: ForumUser[] = [
  { id: "ana", name: "Ana Souza", initials: "AS" },
  { id: "bruno", name: "Bruno Lima", initials: "BL" },
  { id: "carla", name: "Carla Mendes", initials: "CM" },
];
const categories = ["Engenharia", "Produto", "Design", "Marketing", "RH", "Geral"];
const kinds: PostKind[] = ["Discussao", "Ideia", "Problema", "Sugestao", "Atualizacao", "Documentacao"];
const columns: Array<{ id: ScrumStatus; label: string }> = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" },
];

export function ForumLanding({
  posts,
  currentUser,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
}: {
  posts: ForumPost[];
  currentUser: ForumUser;
  onCreatePost: (post: ForumPost) => void;
  onUpdatePost: (postId: string, updater: (post: ForumPost) => ForumPost) => void;
  onDeletePost: (postId: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [sort, setSort] = useState("Recentes");
  const [query, setQuery] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    body: "",
    category: "Engenharia",
    kind: "Discussao" as PostKind,
  });
  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesCategory = activeCategory === "Todas" || post.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.body.toLowerCase().includes(normalizedQuery) ||
        post.tasks.some((task) => task.title.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "Mais votados") return b.score - a.score;
      if (sort === "Mais comentados") return b.comments.length - a.comments.length;
      return Number(b.id) - Number(a.id);
    });
  }, [activeCategory, posts, query, sort]);

  function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim()) return;

    const post: ForumPost = {
      id: String(Date.now()),
      title: draft.title.trim(),
      body: draft.body.trim(),
      category: draft.category,
      kind: draft.kind,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      memberIds: [currentUser.id],
      requests: [],
      score: 0,
      votes: {},
      comments: [],
      createdAt: "agora",
      tasks: [
        {
          id: crypto.randomUUID(),
          title: "Refinar proposta",
          status: "BACKLOG",
          priority: "Media",
          points: 3,
        },
        {
          id: crypto.randomUUID(),
          title: "Validar com envolvidos",
          status: "TODO",
          priority: "Alta",
          points: 5,
        },
      ],
    };

    onCreatePost(post);
    setExpandedPostId(post.id);
    setDraft({ title: "", body: "", category: "Engenharia", kind: "Discussao" });
  }

  function updatePost(postId: string, updater: (post: ForumPost) => ForumPost) {
    onUpdatePost(postId, updater);
  }

  function deletePost(postId: string) {
    onDeletePost(postId);
    if (expandedPostId === postId) setExpandedPostId(null);
  }

  return (
    <section id="forum" className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Card id="novo-post" className="overflow-hidden">
            <CardHeader className="grid-pattern p-5 md:p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                <div className="min-w-0">
                  <Badge tone="orange">Forum + Scrum</Badge>
                  <h2 className="mt-3 text-2xl font-black tracking-normal md:text-3xl">Crie posts com painel Scrum proprio</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted">
                    A landing page agora e apenas o forum. Cada publicacao vira um pequeno projeto com tarefas,
                    colunas Scrum, votos, comentarios e solicitacoes de participacao.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center shadow-sm">
                  <Stat label="Posts" value={posts.length} />
                  <Stat label="Tarefas" value={posts.reduce((total, post) => total + post.tasks.length, 0)} />
                  <Stat label="Votos" value={posts.reduce((total, post) => total + post.score, 0)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-5">
              <form className="grid gap-3" onSubmit={createPost}>
                <div className="rounded-md border border-[var(--border)] bg-black/[0.02] px-3 py-2 text-sm text-muted dark:bg-white/[0.03]">
                  <p className="text-sm text-muted">Usuario ativo: <strong className="text-[var(--foreground)]">{currentUser.name}</strong></p>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <Avatar label={currentUser.initials} />
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))}
                    className="h-11 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-transparent px-3 outline-none focus:border-[var(--accent-2)]"
                    placeholder="Titulo do post"
                  />
                </div>
                <textarea
                  value={draft.body}
                  onChange={(event) => setDraft((value) => ({ ...value, body: event.target.value }))}
                  className="min-h-24 rounded-md border border-[var(--border)] bg-transparent p-3 outline-none focus:border-[var(--accent-2)]"
                  placeholder="Descreva a discussao, ideia, problema ou atualizacao"
                />
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px]">
                  <select
                    value={draft.category}
                    onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value }))}
                    className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={draft.kind}
                    onChange={(event) => setDraft((value) => ({ ...value, kind: event.target.value as PostKind }))}
                    className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
                  >
                    {kinds.map((kind) => (
                      <option key={kind}>{kind}</option>
                    ))}
                  </select>
                  <Button variant="primary" type="submit" className="w-full">Publicar</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-10 rounded-md border border-[var(--border)] bg-transparent px-3 outline-none focus:border-[var(--accent-2)]"
                  placeholder="Buscar posts e tarefas"
                />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3"
                >
                  <option>Recentes</option>
                  <option>Mais votados</option>
                  <option>Mais comentados</option>
                </select>
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {["Todas", ...categories].map((category) => (
                  <button
                    key={category}
                    className={cn(
                      "h-9 whitespace-nowrap rounded-full border px-3 text-sm font-bold",
                      activeCategory === category
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                    )}
                    onClick={() => setActiveCategory(category)}
                  >
                    /{category.toLowerCase()}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {visiblePosts.length === 0 ? (
            <Card>
              <CardContent className="grid min-h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border border-[var(--border)] text-2xl">◎</div>
                  <h3 className="text-xl font-black">Nenhum post ainda</h3>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Os dados criados foram removidos. Publique o primeiro post para gerar automaticamente o painel Scrum dele.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  expanded={expandedPostId === post.id}
                  onToggle={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  onDelete={() => deletePost(post.id)}
                  onUpdate={(updater) => updatePost(post.id, updater)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <Card>
            <CardHeader>
              <h2 className="font-black">Como funciona</h2>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm text-muted">
              <p>1. Publique um post.</p>
              <p>2. Abra o painel Scrum do post.</p>
              <p>3. Solicite entrada quando quiser participar do projeto.</p>
              <p>4. O criador aprova ou recusa as solicitacoes.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-black">Resumo</h2>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-black/[0.02] p-3 text-sm dark:bg-white/[0.03]">
                  <span>{column.label}</span>
                  <strong>{posts.reduce((total, post) => total + post.tasks.filter((task) => task.status === column.id).length, 0)}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function PostCard({
  post,
  currentUser,
  expanded,
  onToggle,
  onDelete,
  onUpdate,
}: {
  post: ForumPost;
  currentUser: ForumUser;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updater: (post: ForumPost) => ForumPost) => void;
}) {
  const [comment, setComment] = useState("");
  const isCreator = post.creatorId === currentUser.id;
  const isMember = post.memberIds.includes(currentUser.id);
  const currentRequest = post.requests.find((request) => request.userId === currentUser.id);
  const currentVote = post.votes?.[currentUser.id];

  function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    onUpdate((current) => ({ ...current, comments: [...current.comments, comment.trim()] }));
    setComment("");
  }

  function requestParticipation() {
    if (isCreator || isMember || currentRequest) return;

    onUpdate((current) => ({
      ...current,
      requests: [
        ...current.requests,
        {
          id: crypto.randomUUID(),
          userId: currentUser.id,
          userName: currentUser.name,
          createdAt: "agora",
        },
      ],
    }));
  }

  function approveRequest(request: ParticipationRequest) {
    onUpdate((current) => ({
      ...current,
      memberIds: current.memberIds.includes(request.userId) ? current.memberIds : [...current.memberIds, request.userId],
      requests: current.requests.filter((item) => item.id !== request.id),
    }));
  }

  function rejectRequest(requestId: string) {
    onUpdate((current) => ({
      ...current,
      requests: current.requests.filter((item) => item.id !== requestId),
    }));
  }

  function vote(value: PostVote) {
    onUpdate((current) => {
      const votes = { ...(current.votes ?? {}) };
      const previousVote = votes[currentUser.id] ?? 0;

      if (previousVote === value) {
        delete votes[currentUser.id];
        return { ...current, votes, score: current.score - previousVote };
      }

      votes[currentUser.id] = value;
      return { ...current, votes, score: current.score + value - previousVote };
    });
  }

  return (
    <article className="grid grid-cols-[44px_minmax(0,1fr)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm md:grid-cols-[50px_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-1 bg-black/[0.03] py-4 dark:bg-white/[0.04]">
        <button
          className={cn(
            "grid h-7 w-7 place-items-center rounded-md border text-sm font-black transition",
            currentVote === 1
              ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm"
              : "border-transparent text-muted hover:bg-black/[0.05] hover:text-[var(--accent)] dark:hover:bg-white/[0.08]",
          )}
          onClick={() => vote(1)}
          aria-pressed={currentVote === 1}
          title={currentVote === 1 ? "Upvote selecionado" : "Dar upvote"}
        >
          ▲
        </button>
        <strong className="text-sm">{post.score}</strong>
        <button
          className={cn(
            "grid h-7 w-7 place-items-center rounded-md border text-sm font-black transition",
            currentVote === -1
              ? "border-blue-500 bg-blue-500 text-white shadow-sm"
              : "border-transparent text-muted hover:bg-black/[0.05] hover:text-blue-500 dark:hover:bg-white/[0.08]",
          )}
          onClick={() => vote(-1)}
          aria-pressed={currentVote === -1}
          title={currentVote === -1 ? "Downvote selecionado" : "Dar downvote"}
        >
          ▼
        </button>
      </div>
      <div className="min-w-0 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone="orange">{post.kind}</Badge>
          <span className="font-bold text-[var(--foreground)]">/{post.category.toLowerCase()}</span>
          <span>por {post.creatorName}</span>
          <span>{post.memberIds.length} membro{post.memberIds.length === 1 ? "" : "s"}</span>
          <span>{post.createdAt}</span>
        </div>
        <h3 className="mt-2 break-words text-lg font-black md:text-xl">{post.title}</h3>
        {post.body && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">{post.body}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggle}>{expanded ? "Ocultar Scrum" : "Abrir Scrum"}</Button>
          <Button variant="ghost" size="sm">{post.comments.length} comentarios</Button>
          {!isCreator && !isMember && !currentRequest && (
            <Button variant="outline" size="sm" onClick={requestParticipation}>Solicitar participacao</Button>
          )}
          {!isCreator && currentRequest && <Badge tone="blue">Solicitacao enviada</Badge>}
          {!isCreator && isMember && <Badge tone="green">Participando</Badge>}
          {isCreator && post.requests.length > 0 && <Badge tone="violet">{post.requests.length} solicitacao{post.requests.length === 1 ? "" : "es"}</Badge>}
          {isCreator && <Button variant="ghost" size="sm" onClick={onDelete}>Excluir</Button>}
        </div>

        {isCreator && post.requests.length > 0 && (
          <div className="mt-3 space-y-2 rounded-md border border-[var(--border)] bg-black/[0.02] p-3 dark:bg-white/[0.03]">
            <p className="text-xs font-bold uppercase text-muted">Solicitacoes para participar</p>
            {post.requests.map((request) => (
              <div key={request.id} className="flex flex-col gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] p-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{request.userName}</p>
                  <p className="text-xs text-muted">Solicitou {request.createdAt}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => approveRequest(request)}>Aceitar</Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectRequest(request.id)}>Recusar</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2" onSubmit={addComment}>
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none"
            placeholder="Adicionar comentario"
          />
          <Button size="sm" type="submit">Comentar</Button>
        </form>

        {post.comments.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-[var(--border)] pl-3">
            {post.comments.map((item, index) => (
              <p key={`${item}-${index}`} className="text-sm"><strong>Voce:</strong> {item}</p>
            ))}
          </div>
        )}

        {expanded && <PostScrumPanel post={post} onUpdate={onUpdate} />}
      </div>
    </article>
  );
}

function PostScrumPanel({
  post,
  onUpdate,
}: {
  post: ForumPost;
  onUpdate: (updater: (post: ForumPost) => ForumPost) => void;
}) {
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState<ScrumTask["priority"]>("Media");
  const [points, setPoints] = useState(3);

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim()) return;

    const task: ScrumTask = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      priority,
      points,
      status: "BACKLOG",
    };

    onUpdate((current) => ({ ...current, tasks: [...current.tasks, task] }));
    setTaskTitle("");
    setPriority("Media");
    setPoints(3);
  }

  function moveTask(taskId: string, status: ScrumStatus) {
    onUpdate((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }));
  }

  function deleteTask(taskId: string) {
    onUpdate((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }));
  }

  const completed = post.tasks.filter((task) => task.status === "DONE").length;
  const progress = post.tasks.length ? Math.round((completed / post.tasks.length) * 100) : 0;

  return (
    <div className="mt-5 rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 dark:bg-white/[0.03] md:p-4">
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
        <div className="min-w-0">
          <h4 className="font-black">Painel Scrum do post</h4>
          <p className="text-sm text-muted">{completed}/{post.tasks.length} tarefas concluidas · {progress}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div className="h-full bg-[var(--success)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form className="mb-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_130px_92px_120px]" onSubmit={addTask}>
        <input
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none"
          placeholder="Nova tarefa"
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as ScrumTask["priority"])}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
        >
          <option>Baixa</option>
          <option>Media</option>
          <option>Alta</option>
          <option>Critica</option>
        </select>
        <input
          type="number"
          min="1"
          max="13"
          value={points}
          onChange={(event) => setPoints(Number(event.target.value))}
          className="h-10 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none"
          aria-label="Story points"
        />
        <Button type="submit">Adicionar</Button>
      </form>

      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[880px] grid-cols-5 gap-3">
          {columns.map((column) => {
            const tasks = post.tasks.filter((task) => task.status === column.id);
            return (
              <div
                key={column.id}
                className="min-h-56 rounded-md border border-[var(--border)] bg-[var(--card)] p-2.5"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => moveTask(event.dataTransfer.getData("task-id"), column.id)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="truncate text-xs font-black uppercase text-muted">{column.label}</h5>
                  <Badge>{tasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("task-id", task.id)}
                      className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h6 className="min-w-0 break-words text-sm font-black">{task.title}</h6>
                        <button className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs text-muted hover:bg-red-500/10 hover:text-red-500" onClick={() => deleteTask(task.id)}>x</button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={task.priority === "Critica" ? "red" : task.priority === "Alta" ? "orange" : "neutral"}>{task.priority}</Badge>
                        <Badge tone="blue">{task.points} pts</Badge>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong className="block text-xl font-black">{value}</strong>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
