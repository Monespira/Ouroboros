export type Role = "ADMIN" | "PROJECT_OWNER" | "PARTICIPANT";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "PAUSED" | "DONE";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ForumPostType = "DISCUSSION" | "IDEA" | "PROBLEM" | "SUGGESTION" | "UPDATE" | "DOC";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department: string;
  avatar: string;
  bio: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  goals: string;
  area: string;
  status: ProjectStatus;
  tags: string[];
  startDate: string;
  targetDate: string;
  ownerId: string;
  tenantId: string;
};

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: "PLANNED" | "ACTIVE" | "CLOSED";
  resources: string[];
  velocity: number;
};

export type Epic = {
  id: string;
  projectId: string;
  name: string;
  description: string;
};

export type UserStory = {
  id: string;
  epicId: string;
  title: string;
  story: string;
  priority: Priority;
  storyPoints: number;
  acceptanceCriteria: string;
  dependencies: string[];
};

export type Task = {
  id: string;
  projectId: string;
  sprintId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number;
  assigneeId: string;
  labels: string[];
  comments: number;
  attachments: number;
  history: string[];
};

export type ForumPost = {
  id: string;
  projectId?: string;
  category: string;
  type: ForumPostType;
  title: string;
  body: string;
  authorId: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  createdAt: string;
  reactions: string[];
};
