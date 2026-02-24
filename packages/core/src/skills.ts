import type { RoleSkillBundle, SkillRouteResult, TaskType } from "./types.js";

const BASE_SKILLS = [
  "brainstorming",
  "writing-plans",
  "test-driven-development",
  "systematic-debugging",
  "requesting-code-review",
  "verification-before-completion",
  "finishing-a-development-branch"
];

const FRONTEND_SKILLS = ["webapp-testing", "canvas-design", "theme-factory", "gh-fix-ci"];
const BACKEND_SKILLS = ["mcp-builder", "using-git-worktrees", "gh-address-comments", "gh-fix-ci"];
const ARCHITECT_SKILLS = ["create-plan", "writing-plans", "mcp-builder", "subagent-driven-development"];
const PRODUCT_DOC_SKILLS = [
  "meeting-notes-and-actions",
  "internal-comms",
  "changelog-generator",
  "content-research-writer"
];
const OPS_SKILLS = ["linear", "connect", "connect-apps"];

const TASK_PATTERNS: Record<TaskType, RegExp[]> = {
  frontend: [
    /ui|ux|页面|组件|样式|交互|前端|e2e|css|react|vue|svelte|动画/i,
    /web\s?app|frontend/i
  ],
  backend: [
    /api|后端|数据库|鉴权|deploy|部署|mcp|集成|queue|service|redis|postgres/i,
    /backend|server/i
  ],
  architecture: [/架构|重构|演进|可扩展|技术债|系统设计|adr|architecture/i],
  "product-docs": [/prd|需求|周报|会议纪要|文档|变更日志|roadmap|brief|spec/i],
  testing: [/测试|test|单元测试|集成测试|e2e|qa|质量保证/i],
  general: []
};

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

export function getRoleSkillBundles(): RoleSkillBundle[] {
  return [
    { role: "基础必备包", skills: BASE_SKILLS },
    { role: "前端工程师包", skills: unique([...BASE_SKILLS, ...FRONTEND_SKILLS]) },
    { role: "后端/全栈包", skills: unique([...BASE_SKILLS, ...BACKEND_SKILLS]) },
    { role: "架构师包", skills: unique([...BASE_SKILLS, ...ARCHITECT_SKILLS]) },
    { role: "产品与文档包", skills: unique([...BASE_SKILLS, ...PRODUCT_DOC_SKILLS]) },
    { role: "协同运营包", skills: OPS_SKILLS }
  ];
}

export function inferTaskType(taskTitle: string): TaskType {
  const normalized = taskTitle.trim();
  if (!normalized) {
    return "general";
  }

  const entries = Object.entries(TASK_PATTERNS) as Array<[TaskType, RegExp[]]>;
  for (const [type, patterns] of entries) {
    if (type === "general") {
      continue;
    }

    if (patterns.some((pattern) => pattern.test(normalized))) {
      return type;
    }
  }

  return "general";
}

export function routeSkillsByTask(taskTitle: string): SkillRouteResult {
  const taskType = inferTaskType(taskTitle);

  if (taskType === "frontend") {
    return {
      taskType,
      skills: unique([...BASE_SKILLS, ...FRONTEND_SKILLS]),
      reason: "命中前端关键词（UI/组件/页面/交互/样式/E2E）"
    };
  }

  if (taskType === "backend") {
    return {
      taskType,
      skills: unique([...BASE_SKILLS, ...BACKEND_SKILLS]),
      reason: "命中后端关键词（API/数据库/鉴权/部署/MCP/集成）"
    };
  }

  if (taskType === "architecture") {
    return {
      taskType,
      skills: unique([...BASE_SKILLS, ...ARCHITECT_SKILLS]),
      reason: "命中架构关键词（架构/重构/扩展性/技术债）"
    };
  }

  if (taskType === "product-docs") {
    return {
      taskType,
      skills: unique([...BASE_SKILLS, ...PRODUCT_DOC_SKILLS]),
      reason: "命中文档和产品协同关键词（PRD/纪要/变更/说明）"
    };
  }

  if (taskType === "testing") {
    return {
      taskType,
      skills: unique([...BASE_SKILLS, "test-driven-development", "systematic-debugging"]),
      reason: "命中测试关键词（测试/test/QA）"
    };
  }

  return {
    taskType: "general",
    skills: BASE_SKILLS,
    reason: "未命中特定类型，使用基础必备包"
  };
}
