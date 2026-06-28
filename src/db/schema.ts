import { pgTable, serial, varchar, text, timestamp, integer, jsonb, boolean, pgEnum, real } from "drizzle-orm/pg-core";

// ===== ENUMS =====
export const workspaceTypeEnum = pgEnum("workspace_type", ["startup", "saas", "client_project", "research"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "review", "done", "blocked"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "critical"]);
export const agentStatusEnum = pgEnum("agent_status", ["idle", "working", "paused", "error"]);
export const documentTypeEnum = pgEnum("document_type", ["prd", "architecture", "database_schema", "api_spec", "roadmap", "pitch", "tech_doc", "marketing_plan", "deployment_guide", "other"]);
export const memoryTypeEnum = pgEnum("memory_type", ["short_term", "long_term", "workspace", "project", "architecture", "decision"]);
export const workflowStatusEnum = pgEnum("workflow_status", ["pending", "running", "paused", "completed", "failed", "cancelled"]);
export const stepStatusEnum = pgEnum("step_status", ["pending", "running", "completed", "failed", "skipped"]);
export const knowledgeTypeEnum = pgEnum("knowledge_type", ["pdf", "docx", "pptx", "txt", "website", "github", "youtube", "markdown"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "member", "viewer"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "execute", "login", "logout", "export", "share"]);

// ===== CORE TABLES =====
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: workspaceTypeEnum("type").notNull().default("startup"),
  goal: text("goal"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("planning"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("todo"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assignedAgent: varchar("assigned_agent", { length: 100 }),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 10 }),
  color: varchar("color", { length: 20 }),
  status: agentStatusEnum("status").notNull().default("idle"),
  capabilities: jsonb("capabilities").$type<string[]>(),
  tools: jsonb("tools").$type<string[]>(),
  systemPrompt: text("system_prompt"),
  model: varchar("model", { length: 50 }).default("gpt-4o"),
  temperature: real("temperature").default(0.7),
  totalTasksCompleted: integer("total_tasks_completed").notNull().default(0),
  successRate: integer("success_rate").notNull().default(0),
  totalTokensUsed: integer("total_tokens_used").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: documentTypeEnum("type").notNull().default("other"),
  content: text("content"),
  author: varchar("author", { length: 100 }),
  version: varchar("version", { length: 20 }).default("1.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  messages: jsonb("messages").$type<{role: string; content: string; agent?: string; timestamp: string}[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const agentExecutions = pgTable("agent_executions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  workflowExecutionId: integer("workflow_execution_id"),
  input: text("input"),
  output: text("output"),
  tokensUsed: integer("tokens_used"),
  cost: integer("cost"),
  latency: integer("latency"),
  status: varchar("status", { length: 50 }).notNull().default("running"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== MEMORY SYSTEM =====
export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").references(() => agents.id, { onDelete: "cascade" }),
  type: memoryTypeEnum("type").notNull().default("short_term"),
  key: varchar("key", { length: 255 }),
  content: text("content").notNull(),
  summary: text("summary"),
  importance: integer("importance").default(5),
  embedding: jsonb("embedding").$type<number[]>(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

// ===== KNOWLEDGE BASE / RAG =====
export const knowledgeSources = pgTable("knowledge_sources", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: knowledgeTypeEnum("type").notNull(),
  sourceUrl: text("source_url"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  content: text("content"),
  metadata: jsonb("metadata"),
  version: integer("version").notNull().default(1),
  chunkCount: integer("chunk_count").default(0),
  status: varchar("status", { length: 50 }).default("processing"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull().references(() => knowledgeSources.id, { onDelete: "cascade" }),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: jsonb("embedding").$type<number[]>(),
  chunkIndex: integer("chunk_index").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== WORKFLOW ENGINE =====
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  definition: jsonb("definition").$type<{
    steps: { id: string; agent: string; prompt: string; dependsOn?: string[]; validation?: string }[];
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  goal: text("goal"),
  status: workflowStatusEnum("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").default(0),
  tokensUsed: integer("tokens_used").default(0),
  cost: integer("cost").default(0),
  result: jsonb("result"),
  logs: jsonb("logs").$type<{timestamp: string; level: string; message: string; agent?: string}[]>(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").notNull().references(() => workflowExecutions.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").references(() => agents.id),
  stepIndex: integer("step_index").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  prompt: text("prompt"),
  input: text("input"),
  output: text("output"),
  status: stepStatusEnum("status").notNull().default("pending"),
  tokensUsed: integer("tokens_used"),
  cost: integer("cost"),
  latency: integer("latency"),
  validationResult: jsonb("validation_result"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== GITHUB INTELLIGENCE =====
export const githubRepos = pgTable("github_repos", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  owner: varchar("owner", { length: 100 }),
  repo: varchar("repo", { length: 100 }),
  branch: varchar("branch", { length: 100 }).default("main"),
  language: varchar("language", { length: 50 }),
  stars: integer("stars"),
  forks: integer("forks"),
  fileCount: integer("file_count"),
  dependencyGraph: jsonb("dependency_graph"),
  architectureDoc: text("architecture_doc"),
  securityAudit: jsonb("security_audit"),
  apiDocumentation: text("api_documentation"),
  improvementRecommendations: jsonb("improvement_recommendations"),
  lastAnalyzedAt: timestamp("last_analyzed_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ===== SECURITY / AUTH =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("member"),
  avatar: text("avatar"),
  preferences: jsonb("preferences"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  action: auditActionEnum("action").notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: varchar("key_prefix", { length: 8 }),
  scopes: jsonb("scopes").$type<string[]>(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
