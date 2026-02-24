/**
 * 任务分解器
 * 使用 PM Agent 将用户需求分解为多个可执行的任务
 */

import type { Task, AgentContext } from "./types.js";
import { createTask } from "./task.js";
import { createAgentExecutor } from "./subagent-executor.js";

export interface DecompositionResult {
  tasks: Task[];
  summary: string;
}

export class TaskDecomposer {
  private pmAgent = createAgentExecutor("product-manager");

  /**
   * 将用户输入分解为多个任务
   */
  async decompose(
    userInput: string,
    context: AgentContext
  ): Promise<DecompositionResult> {
    // 创建一个临时任务来触发 PM Agent
    const analysisTask = createTask(
      "分析需求并分解任务",
      `用户需求：${userInput}\n\n请分析这个需求，并将其分解为 3-7 个具体的、可执行的任务。每个任务应该：\n- 可在 30-60 分钟内完成\n- 有明确的验收标准\n- 正确标识依赖关系\n\n请以 JSON 数组格式返回任务列表。`,
      "general"
    );

    try {
      // 调用 PM Agent 进行任务分解
      const result = await this.pmAgent.execute(analysisTask, context);

      if (!result.success) {
        throw new Error(`Task decomposition failed: ${result.output}`);
      }

      // 解析 PM Agent 的输出
      const tasks = this.parseTasksFromOutput(result.output);

      return {
        tasks,
        summary: `成功分解为 ${tasks.length} 个任务`,
      };
    } catch (error) {
      throw new Error(
        `Failed to decompose tasks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 从 PM Agent 的输出中解析任务列表
   */
  private parseTasksFromOutput(output: string): Task[] {
    try {
      // 尝试从输出中提取 JSON
      const jsonMatch = output.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in output");
      }

      const tasksData = JSON.parse(jsonMatch[0]) as Array<{
        title: string;
        description: string;
        type: string;
        dependencies?: string[];
        priority?: number;
      }>;

      // 创建任务映射（用于处理依赖关系）
      const taskMap = new Map<string, Task>();
      const tasks: Task[] = [];

      // 第一遍：创建所有任务
      for (const data of tasksData) {
        const task = createTask(
          data.title,
          data.description,
          this.normalizeTaskType(data.type),
          {
            priority: data.priority || 5,
          }
        );
        taskMap.set(data.title, task);
        tasks.push(task);
      }

      // 第二遍：设置依赖关系
      for (let i = 0; i < tasksData.length; i++) {
        const data = tasksData[i];
        const task = tasks[i];

        if (!data || !task) continue;

        if (data.dependencies && data.dependencies.length > 0) {
          // 将依赖的任务标题转换为任务 ID
          task.dependencies = data.dependencies
            .map((depTitle) => {
              const depTask = taskMap.get(depTitle);
              return depTask?.id;
            })
            .filter((id): id is string => id !== undefined);

          // 如果有依赖，状态设为 pending
          if (task.dependencies.length > 0) {
            task.status = "pending";
          }
        }
      }

      return tasks;
    } catch (error) {
      throw new Error(
        `Failed to parse tasks from output: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 标准化任务类型
   */
  private normalizeTaskType(type: string): Task["type"] {
    const normalized = type.toLowerCase();
    if (normalized.includes("frontend") || normalized.includes("前端")) {
      return "frontend";
    }
    if (normalized.includes("backend") || normalized.includes("后端")) {
      return "backend";
    }
    if (normalized.includes("architecture") || normalized.includes("架构")) {
      return "architecture";
    }
    if (normalized.includes("test") || normalized.includes("测试")) {
      return "testing";
    }
    if (normalized.includes("doc") || normalized.includes("文档")) {
      return "product-docs";
    }
    return "general";
  }
}
