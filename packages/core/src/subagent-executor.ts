/**
 * Subagent 执行器
 * 通过 Task tool 派发 subagent 来执行任务
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Task, TaskResult, AgentRole, AgentContext } from "./types.js";
import { BaseAgent } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SubagentConfig {
  model?: "sonnet" | "opus" | "haiku";
  timeout?: number;
}

export class SubagentExecutor extends BaseAgent {
  private promptsDir: string;

  constructor(
    id: string,
    role: AgentRole,
    skills: string[],
    promptsDir?: string
  ) {
    super(id, role, skills);
    // 默认使用相对于当前文件的 prompts 目录
    this.promptsDir = promptsDir || path.join(__dirname, "prompts");
  }

  async execute(task: Task, context: AgentContext, config?: SubagentConfig): Promise<TaskResult> {
    try {
      // 1. 加载 agent prompt 模板
      const promptTemplate = await this.loadPromptTemplate(this.role);

      // 2. 构建完整的 prompt
      const fullPrompt = this.buildPrompt(promptTemplate, task, context);

      // 3. 派发 subagent（这里需要实际调用 Task tool）
      // 注意：在实际环境中，这会通过 Claude Code 的 Task tool 执行
      // 目前我们先返回一个模拟结果，后续需要集成真实的 Task tool
      const result = await this.dispatchSubagent(fullPrompt, config);

      return result;
    } catch (error) {
      return {
        success: false,
        output: `Error executing task: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async loadPromptTemplate(role: AgentRole): Promise<string> {
    const promptFiles: Record<AgentRole, string> = {
      "product-manager": "pm-agent-prompt.md",
      "architect": "dev-agent-prompt.md", // 架构师使用开发者模板
      "frontend-dev": "dev-agent-prompt.md",
      "backend-dev": "dev-agent-prompt.md",
      "spec-reviewer": "spec-reviewer-prompt.md",
      "code-reviewer": "code-reviewer-prompt.md",
      "tester": "dev-agent-prompt.md", // 测试者使用开发者模板
    };

    const filename = promptFiles[role];
    const filepath = path.join(this.promptsDir, filename);

    try {
      return await readFile(filepath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to load prompt template for role ${role}: ${error}`);
    }
  }

  private buildPrompt(template: string, task: Task, context: AgentContext): string {
    // 构建上下文信息
    const contextInfo = this.buildContextInfo(context);

    // 构建任务信息
    const taskInfo = `
## Task Details

**Title**: ${task.title}

**Description**:
${task.description}

**Type**: ${task.type}

**Priority**: ${task.priority}

**Dependencies**: ${task.dependencies.length > 0 ? task.dependencies.join(", ") : "None"}
`;

    // 组合完整 prompt
    return `${template}

${contextInfo}

${taskInfo}

---

Please execute this task following the guidelines above. If you have any questions, ask them first before starting implementation.
`;
  }

  private buildContextInfo(context: AgentContext): string {
    let info = `## Context Information

**Workspace Path**: ${context.workspacePath}
`;

    if (context.projectDocs && context.projectDocs.length > 0) {
      info += `\n**Project Documentation**:\n`;
      for (const doc of context.projectDocs) {
        info += `- ${doc}\n`;
      }
    }

    if (context.previousTasks && context.previousTasks.length > 0) {
      info += `\n**Previous Tasks** (for context):\n`;
      for (const prevTask of context.previousTasks) {
        info += `- ${prevTask.title} (${prevTask.status})\n`;
      }
    }

    return info;
  }

  private async dispatchSubagent(prompt: string, config?: SubagentConfig): Promise<TaskResult> {
    // TODO: 实际实现需要调用 Claude Code 的 Task tool
    // 这里先返回一个占位实现

    // 在真实环境中，这应该是：
    // const result = await Task({
    //   description: `Execute ${this.role} task`,
    //   prompt: prompt,
    //   subagent_type: "general-purpose",
    //   model: config?.model || "sonnet",
    // });

    console.log(`[SubagentExecutor] Would dispatch ${this.role} agent with prompt length: ${prompt.length}`);

    // 返回模拟结果
    return {
      success: true,
      output: `[SIMULATED] ${this.role} agent would execute the task here`,
      nextSteps: ["Integrate with actual Task tool"],
    };
  }
}

/**
 * 创建专业化的 agent 执行器
 */
export function createAgentExecutor(
  role: AgentRole,
  promptsDir?: string
): SubagentExecutor {
  const skillMapping: Record<AgentRole, string[]> = {
    "product-manager": ["brainstorming", "writing-plans", "task-decomposition"],
    "architect": ["architecture-design", "system-design", "technical-planning"],
    "frontend-dev": ["react", "vue", "css", "ui-testing"],
    "backend-dev": ["api-design", "database", "authentication", "testing"],
    "spec-reviewer": ["requirement-analysis", "acceptance-testing"],
    "code-reviewer": ["code-quality", "best-practices", "security-review"],
    "tester": ["unit-testing", "integration-testing", "e2e-testing"],
  };

  const skills = skillMapping[role] || [];
  const id = `${role}-${Date.now()}`;

  return new SubagentExecutor(id, role, skills, promptsDir);
}
