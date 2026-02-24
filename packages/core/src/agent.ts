/**
 * Agent 抽象层
 */

import type { Task, TaskResult, AgentRole, AgentContext } from "./types.js";

export interface Agent {
  id: string;
  role: AgentRole;
  skills: string[];
  execute(task: Task, context: AgentContext): Promise<TaskResult>;
  canHandle(task: Task): boolean;
}

export abstract class BaseAgent implements Agent {
  constructor(
    public id: string,
    public role: AgentRole,
    public skills: string[]
  ) {}

  abstract execute(task: Task, context: AgentContext): Promise<TaskResult>;

  canHandle(task: Task): boolean {
    // 默认实现：检查任务类型是否匹配 agent 角色
    return this.isTaskTypeCompatible(task.type);
  }

  protected isTaskTypeCompatible(taskType: string): boolean {
    const roleTaskMapping: Record<AgentRole, string[]> = {
      "product-manager": ["general", "product-docs"],
      "architect": ["architecture", "general"],
      "frontend-dev": ["frontend"],
      "backend-dev": ["backend"],
      "fullstack-dev": ["frontend", "backend"],
      "devops": ["general"],
      "tester": ["testing", "general"],
      "spec-reviewer": ["general"],
      "code-reviewer": ["general"],
    };

    return roleTaskMapping[this.role]?.includes(taskType) || false;
  }
}
