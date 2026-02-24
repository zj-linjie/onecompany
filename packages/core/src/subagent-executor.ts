/**
 * Subagent 执行器
 * 使用 Anthropic API 实现真实的 Agent 执行
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import type { Task, TaskResult, AgentRole, AgentContext } from "./types.js";
import { BaseAgent } from "./agent.js";
import { getAnthropicApiKey } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SubagentConfig {
  model?: "claude-sonnet-4-5-20250929" | "claude-opus-4-6" | "claude-haiku-4-5-20251001";
  timeout?: number;
  maxTokens?: number;
}

export class SubagentExecutor extends BaseAgent {
  private promptsDir: string;
  private anthropic: Anthropic | null = null;

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

  /**
   * 初始化 Anthropic 客户端
   */
  private async initAnthropicClient(): Promise<Anthropic> {
    if (this.anthropic) {
      return this.anthropic;
    }

    const apiKey = await getAnthropicApiKey();
    if (!apiKey) {
      throw new Error(
        "Anthropic API Key not found. Please set ANTHROPIC_API_KEY environment variable or run 'npm run config set-api-key'"
      );
    }

    this.anthropic = new Anthropic({ apiKey });
    return this.anthropic;
  }

  async execute(task: Task, context: AgentContext, config?: SubagentConfig): Promise<TaskResult> {
    try {
      // 1. 加载 agent prompt 模板
      const promptTemplate = await this.loadPromptTemplate(this.role);

      // 2. 构建完整的 prompt
      const fullPrompt = this.buildPrompt(promptTemplate, task, context);

      // 3. 派发 subagent（真实的 API 调用）
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

Please execute this task following the guidelines above. Provide a detailed response including:
1. Your analysis of the task
2. The steps you took
3. The results or output
4. Any next steps or recommendations
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

  /**
   * 真实的 Subagent 派发实现
   * 使用 Anthropic API 执行任务
   */
  private async dispatchSubagent(prompt: string, config?: SubagentConfig): Promise<TaskResult> {
    try {
      console.log(`[SubagentExecutor] Dispatching ${this.role} agent...`);
      console.log(`[SubagentExecutor] Prompt length: ${prompt.length} characters`);

      // 初始化 Anthropic 客户端
      const anthropic = await this.initAnthropicClient();

      // 选择模型
      const model = config?.model || "claude-sonnet-4-5-20250929";
      const maxTokens = config?.maxTokens || 8000;

      console.log(`[SubagentExecutor] Using model: ${model}`);

      // 调用 Anthropic API
      const startTime = Date.now();
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      console.log(`[SubagentExecutor] Response received in ${duration}ms`);

      // 提取响应内容
      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as any).text)
        .join("\n");

      // 解析响应
      const result = this.parseResponse(content);

      console.log(`[SubagentExecutor] Task completed successfully`);

      return {
        success: true,
        output: content,
        nextSteps: result.nextSteps,
        metadata: {
          model,
          duration,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          stopReason: response.stop_reason,
        },
      };
    } catch (error) {
      console.error(`[SubagentExecutor] Error dispatching subagent:`, error);

      if (error instanceof Anthropic.APIError) {
        return {
          success: false,
          output: `API Error: ${error.message}`,
          metadata: {
            errorType: error.constructor.name,
            statusCode: error.status,
          },
        };
      }

      return {
        success: false,
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 解析 Agent 响应，提取关键信息
   */
  private parseResponse(content: string): { nextSteps: string[] } {
    const nextSteps: string[] = [];

    // 尝试提取 "Next Steps" 或 "下一步" 部分
    const nextStepsRegex = /(?:Next Steps?|下一步|Recommendations?|建议)[:\s]*\n((?:[-*]\s*.+\n?)+)/gi;
    const matches = content.match(nextStepsRegex);

    if (matches) {
      for (const match of matches) {
        const lines = match.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            nextSteps.push(trimmed.substring(1).trim());
          }
        }
      }
    }

    return { nextSteps };
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
    "frontend-dev": ["canvas-design", "artifacts-builder"],
    "backend-dev": ["mcp-builder", "api-design", "database"],
    "spec-reviewer": ["verification-before-completion", "requirement-analysis"],
    "code-reviewer": ["requesting-code-review", "code-quality", "best-practices"],
    "tester": ["test-driven-development", "systematic-debugging"],
  };

  const skills = skillMapping[role] || [];
  const id = `${role}-${Date.now()}`;

  return new SubagentExecutor(id, role, skills, promptsDir);
}
