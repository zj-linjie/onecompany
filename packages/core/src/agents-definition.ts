/**
 * Agents 定义
 * 真实可用的 Agent 角色和配置
 */

import type { AgentRole } from "./types.js";

export interface AgentDefinition {
  id: string;
  role: AgentRole;
  name: string;
  nameEn: string;
  specialization: string;
  description: string;
  defaultSkills: string[];
  recommendedFor: string[];
  icon: string;
  color: string;
  category: "development" | "review" | "management";
}

/**
 * 所有可用的 Agents
 * 这些是真实可以执行的 Agent 角色
 */
export const AVAILABLE_AGENTS: AgentDefinition[] = [
  {
    id: "product-manager",
    role: "product-manager",
    name: "产品经理",
    nameEn: "Product Manager",
    specialization: "需求分析和任务分解专家",
    description: "负责需求分析、任务分解、产品规划和项目管理。擅长将复杂需求拆解为可执行的任务。",
    defaultSkills: ["brainstorming", "writing-plans"],
    recommendedFor: ["需求分析", "任务规划", "产品设计", "项目管理"],
    icon: "👔",
    color: "#3b82f6",
    category: "management",
  },
  {
    id: "architect",
    role: "architect",
    name: "架构师",
    nameEn: "Architect",
    specialization: "系统架构设计专家",
    description: "负责系统架构设计、技术选型、架构演进和技术债务管理。擅长设计可扩展的系统架构。",
    defaultSkills: ["architecture-design", "system-design"],
    recommendedFor: ["架构设计", "技术选型", "系统重构", "技术规划"],
    icon: "🏗️",
    color: "#8b5cf6",
    category: "development",
  },
  {
    id: "frontend-developer",
    role: "frontend-dev",
    name: "前端开发工程师",
    nameEn: "Frontend Developer",
    specialization: "前端开发和 UI 实现专家",
    description: "负责前端开发、UI 实现、用户交互和前端性能优化。精通 React、Vue 等现代前端框架。",
    defaultSkills: ["canvas-design", "artifacts-builder"],
    recommendedFor: ["前端开发", "UI 实现", "组件开发", "前端优化"],
    icon: "🎨",
    color: "#10b981",
    category: "development",
  },
  {
    id: "backend-developer",
    role: "backend-dev",
    name: "后端开发工程师",
    nameEn: "Backend Developer",
    specialization: "后端开发和 API 设计专家",
    description: "负责后端开发、API 设计、数据库设计和服务端逻辑实现。精通 Node.js、Python、Java 等后端技术。",
    defaultSkills: ["mcp-builder"],
    recommendedFor: ["后端开发", "API 设计", "数据库设计", "服务端开发"],
    icon: "⚙️",
    color: "#f59e0b",
    category: "development",
  },
  {
    id: "fullstack-developer",
    role: "fullstack-dev",
    name: "全栈开发工程师",
    nameEn: "Fullstack Developer",
    specialization: "全栈开发专家",
    description: "负责前后端全栈开发，能够独立完成完整的功能模块。精通前端和后端技术栈。",
    defaultSkills: ["canvas-design", "mcp-builder"],
    recommendedFor: ["全栈开发", "独立功能", "快速原型", "小型项目"],
    icon: "💻",
    color: "#06b6d4",
    category: "development",
  },
  {
    id: "devops-engineer",
    role: "devops",
    name: "DevOps 工程师",
    nameEn: "DevOps Engineer",
    specialization: "CI/CD 和基础设施专家",
    description: "负责 CI/CD 流程、容器化部署、基础设施管理和运维自动化。精通 Docker、Kubernetes、云服务。",
    defaultSkills: ["using-git-worktrees"],
    recommendedFor: ["CI/CD", "容器化", "部署", "运维自动化"],
    icon: "🚀",
    color: "#ef4444",
    category: "development",
  },
  {
    id: "test-engineer",
    role: "tester",
    name: "测试工程师",
    nameEn: "Test Engineer",
    specialization: "质量保证和测试专家",
    description: "负责测试策略制定、测试用例编写、自动化测试和质量保证。精通各种测试框架和方法。",
    defaultSkills: ["test-driven-development", "systematic-debugging"],
    recommendedFor: ["单元测试", "集成测试", "E2E 测试", "质量保证"],
    icon: "🧪",
    color: "#ec4899",
    category: "development",
  },
  {
    id: "spec-reviewer",
    role: "spec-reviewer",
    name: "规格审查员",
    nameEn: "Spec Reviewer",
    specialization: "需求和规格审查专家",
    description: "负责审查需求文档、技术规格和设计方案，确保需求清晰、完整、可实现。",
    defaultSkills: ["verification-before-completion"],
    recommendedFor: ["需求审查", "规格审查", "设计审查", "验收标准"],
    icon: "📋",
    color: "#6366f1",
    category: "review",
  },
  {
    id: "code-reviewer",
    role: "code-reviewer",
    name: "代码审查员",
    nameEn: "Code Reviewer",
    specialization: "代码质量审查专家",
    description: "负责代码审查、代码质量检查、最佳实践推广和安全审查。确保代码质量和可维护性。",
    defaultSkills: ["requesting-code-review"],
    recommendedFor: ["代码审查", "质量检查", "安全审查", "最佳实践"],
    icon: "🔍",
    color: "#14b8a6",
    category: "review",
  },
];

/**
 * 根据 ID 获取 Agent 定义
 */
export function getAgentById(id: string): AgentDefinition | undefined {
  return AVAILABLE_AGENTS.find((agent) => agent.id === id);
}

/**
 * 根据角色获取 Agent 定义
 */
export function getAgentByRole(role: AgentRole): AgentDefinition | undefined {
  return AVAILABLE_AGENTS.find((agent) => agent.role === role);
}

/**
 * 根据类别获取 Agents
 */
export function getAgentsByCategory(
  category: AgentDefinition["category"]
): AgentDefinition[] {
  return AVAILABLE_AGENTS.filter((agent) => agent.category === category);
}

/**
 * 搜索 Agents
 */
export function searchAgents(query: string): AgentDefinition[] {
  const lowerQuery = query.toLowerCase();
  return AVAILABLE_AGENTS.filter(
    (agent) =>
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.nameEn.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery) ||
      agent.specialization.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 获取推荐的 Agents（基于项目类型）
 */
export function getRecommendedAgents(
  projectType: "frontend" | "backend" | "fullstack"
): AgentDefinition[] {
  const baseAgents = [
    getAgentById("product-manager"),
    getAgentById("code-reviewer"),
    getAgentById("test-engineer"),
  ].filter((a): a is AgentDefinition => a !== undefined);

  if (projectType === "frontend") {
    return [
      ...baseAgents,
      getAgentById("frontend-developer"),
      getAgentById("devops-engineer"),
    ].filter((a): a is AgentDefinition => a !== undefined);
  }

  if (projectType === "backend") {
    return [
      ...baseAgents,
      getAgentById("backend-developer"),
      getAgentById("devops-engineer"),
    ].filter((a): a is AgentDefinition => a !== undefined);
  }

  // fullstack
  return [
    ...baseAgents,
    getAgentById("architect"),
    getAgentById("fullstack-developer"),
    getAgentById("devops-engineer"),
  ].filter((a): a is AgentDefinition => a !== undefined);
}
