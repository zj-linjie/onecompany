export type ProductMode = "mixed" | "web" | "automation";

export type TaskType =
  | "frontend"
  | "backend"
  | "architecture"
  | "product-docs"
  | "testing"
  | "general";

export interface SkillRouteResult {
  taskType: TaskType;
  skills: string[];
  reason: string;
}

export interface RoleSkillBundle {
  role: string;
  skills: string[];
}

export interface NewProjectInput {
  workspaceRoot: string;
  projectName: string;
  projectDescription: string;
  productMode: ProductMode;
  creator: string;
}

export interface NewProjectResult {
  workspacePath: string;
  createdFiles: string[];
  roleBundles: RoleSkillBundle[];
}

export interface TakeoverInput {
  workspaceRoot: string;
  sourcePath: string;
  projectName?: string;
  owner: string;
}

export interface ScanSummary {
  sourcePath: string;
  projectName: string;
  fileCount: number;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  docsFound: string[];
  missingFoundations: string[];
  risks: string[];
  recommendations: string[];
}

export interface TakeoverResult {
  workspacePath: string;
  scan: ScanSummary;
  createdFiles: string[];
}

export interface IterateInput {
  workspacePath: string;
  taskTitle: string;
  actor: string;
}

export interface IterateResult {
  taskType: TaskType;
  skills: string[];
  devLogPath: string;
  qualityGates: string[];
}

// Agent 相关类型
export type AgentRole =
  | "product-manager"
  | "architect"
  | "frontend-dev"
  | "backend-dev"
  | "fullstack-dev"
  | "devops"
  | "tester"
  | "spec-reviewer"
  | "code-reviewer";

export interface AgentContext {
  workspacePath: string;
  projectDocs?: string[];
  previousTasks?: any[];
}

// Task 相关类型
export type TaskStatus = "pending" | "ready" | "running" | "reviewing" | "completed" | "failed";

export interface TaskResult {
  success: boolean;
  output: string;
  artifacts?: string[];
  nextSteps?: string[];
  metadata?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  assignedAgent?: string;
  dependencies: string[];
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: TaskResult;
  error?: string;
}

// State 相关类型
export interface ExecutionEvent {
  timestamp: Date;
  type: "task_created" | "task_started" | "task_completed" | "task_failed" | "agent_dispatched" | "system_event";
  taskId?: string;
  agentRole?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectState {
  tasks: Task[];
  executionLog: ExecutionEvent[];
  lastUpdated: Date;
}

// Canvas 配置类型
export interface CanvasSkillNode {
  id: string;
  type: 'skill';
  skillId: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface CanvasAgentNode {
  id: string;
  type: 'agent';
  role: string;
  name: string;
  skills: string[];
  enabled: boolean;
  specialization: string;
}

export interface CanvasConfig {
  version: string;
  nodes: Array<CanvasSkillNode | CanvasAgentNode | any>;
  connections?: any[];
}
