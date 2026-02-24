/**
 * 任务调度器
 * 负责任务的调度和执行
 */

import type { Task, AgentRole, AgentContext, CanvasConfig } from "./types.js";
import { TaskQueue } from "./task-queue.js";
import { createAgentExecutor } from "./subagent-executor.js";
import { ReviewManager } from "./reviewers/review-manager.js";

export interface SchedulerConfig {
  maxParallelTasks?: number;
  enableReview?: boolean;
}

export class TaskScheduler {
  private queue: TaskQueue;
  private config: SchedulerConfig;
  private runningTasks = new Set<string>();
  private reviewManager: ReviewManager;
  private canvasConfig: CanvasConfig | null = null;

  constructor(queue: TaskQueue, config: SchedulerConfig = {}) {
    this.queue = queue;
    this.config = {
      maxParallelTasks: config.maxParallelTasks || 3,
      enableReview: config.enableReview !== false,
    };
    this.reviewManager = new ReviewManager();
  }

  /**
   * 设置 Canvas 配置
   */
  setCanvasConfig(config: CanvasConfig): void {
    this.canvasConfig = config;
  }

  /**
   * 调度单个任务
   */
  async scheduleTask(taskId: string, context: AgentContext): Promise<void> {
    const task = this.queue.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // 检查依赖是否满足
    if (!this.queue.areDependenciesMet(taskId)) {
      throw new Error(`Task dependencies not met: ${taskId}`);
    }

    // 检查任务状态
    if (task.status !== "ready") {
      throw new Error(`Task is not ready: ${taskId} (status: ${task.status})`);
    }

    // 更新状态为 running
    this.queue.updateStatus(taskId, "running");
    this.runningTasks.add(taskId);

    try {
      // 选择合适的 agent
      const agentRole = this.selectAgent(task);
      const agent = createAgentExecutor(agentRole);

      // 执行任务
      const result = await agent.execute(task, context);

      // 保存结果
      task.result = result;

      if (result.success) {
        // 如果启用审查，进入审查状态
        if (this.config.enableReview) {
          this.queue.updateStatus(taskId, "reviewing");

          // 执行两阶段审查
          console.log(`[TaskScheduler] Starting two-stage review for task: ${taskId}`);
          const reviewResult = await this.reviewManager.performTwoStageReview(task, context);

          if (reviewResult.overallApproved) {
            this.queue.updateStatus(taskId, "completed");
            console.log(`[TaskScheduler] Task ${taskId} passed review`);
          } else {
            this.queue.updateStatus(taskId, "failed");
            task.error = `Review failed: ${reviewResult.summary}`;
            console.log(`[TaskScheduler] Task ${taskId} failed review`);
          }
        } else {
          this.queue.updateStatus(taskId, "completed");
        }
      } else {
        this.queue.updateStatus(taskId, "failed");
        task.error = result.output;
      }
    } catch (error) {
      this.queue.updateStatus(taskId, "failed");
      task.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * 并行执行多个独立任务
   */
  async executeParallel(
    taskIds: string[],
    context: AgentContext
  ): Promise<void> {
    // 过滤出可以并行执行的任务
    const readyTasks = taskIds.filter((id) => {
      const task = this.queue.get(id);
      return (
        task &&
        task.status === "ready" &&
        this.queue.areDependenciesMet(id) &&
        !this.runningTasks.has(id)
      );
    });

    // 限制并行数量
    const tasksToExecute = readyTasks.slice(0, this.config.maxParallelTasks);

    if (tasksToExecute.length === 0) {
      return;
    }

    console.log(
      `[TaskScheduler] Executing ${tasksToExecute.length} tasks in parallel`
    );

    // 并行执行
    const promises = tasksToExecute.map((taskId) =>
      this.scheduleTask(taskId, context).catch((error) => {
        console.error(`[TaskScheduler] Task ${taskId} failed:`, error);
        // 不抛出错误，让其他任务继续执行
      })
    );

    await Promise.all(promises);
  }

  /**
   * 执行所有就绪的任务（串行或并行）
   */
  async executeReady(context: AgentContext): Promise<void> {
    const readyTasks = this.queue.getReadyTasks();

    if (readyTasks.length === 0) {
      return;
    }

    // 识别独立任务（可以并行执行）
    const independentTasks = this.findIndependentTasks(readyTasks);

    if (independentTasks.length > 1) {
      // 并行执行独立任务
      await this.executeParallel(
        independentTasks.map((t) => t.id),
        context
      );
    } else if (readyTasks.length > 0 && readyTasks[0]) {
      // 串行执行第一个任务
      await this.scheduleTask(readyTasks[0].id, context);
    }
  }

  /**
   * 找出可以并行执行的独立任务
   */
  private findIndependentTasks(tasks: Task[]): Task[] {
    // 简单实现：所有 ready 状态的任务都是独立的
    // 因为有依赖的任务会是 pending 状态
    return tasks.filter((task) => task?.status === "ready");
  }

  /**
   * 根据任务类型选择合适的 agent
   * 如果有 Canvas 配置，优先使用配置中的 agent
   */
  private selectAgent(task: Task): AgentRole {
    // 如果有 Canvas 配置，根据配置选择 agent
    if (this.canvasConfig) {
      const agent = this.selectAgentFromCanvas(task);
      if (agent) {
        return agent;
      }
    }

    // 默认选择逻辑
    switch (task.type) {
      case "frontend":
        return "frontend-dev";
      case "backend":
        return "backend-dev";
      case "architecture":
        return "architect";
      case "testing":
        return "tester";
      case "product-docs":
        return "product-manager";
      default:
        return "backend-dev"; // 默认使用后端开发者
    }
  }

  /**
   * 从 Canvas 配置中选择最合适的 agent
   */
  private selectAgentFromCanvas(task: Task): AgentRole | null {
    if (!this.canvasConfig) return null;

    // 获取项目启用的 Skills
    const projectSkills = this.canvasConfig.nodes
      .filter((n: any) => n.type === "skill" && n.enabled)
      .map((n: any) => n.skillId);

    // 获取可用的 Agents
    const agents = this.canvasConfig.nodes
      .filter((n: any) => n.type === "agent" && n.enabled);

    // 任务类型映射到所需技能
    const taskSkillMap: Record<string, string[]> = {
      backend: ["api-development", "database-design", "authentication"],
      frontend: ["react-dev", "ui-design", "state-management", "responsive-layout"],
      testing: ["unit-testing", "integration-testing", "e2e-testing"],
      architecture: ["api-development", "database-design", "system-design"],
      "product-docs": ["documentation", "technical-writing"],
    };

    const requiredSkills = taskSkillMap[task.type] || [];

    // 找到最匹配的 agent
    let bestAgent: any = null;
    let bestScore = 0;

    for (const agentNode of agents) {
      const agentSkills = agentNode.skills || [];

      // 计算匹配分数
      const matchingSkills = requiredSkills.filter(
        (skill) => agentSkills.includes(skill) && projectSkills.includes(skill)
      );

      const score = matchingSkills.length;

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agentNode;
      }
    }

    if (bestAgent) {
      console.log(
        `[TaskScheduler] Selected agent from Canvas: ${bestAgent.name} (${bestAgent.role}) for task type: ${task.type}`
      );
      return bestAgent.role as AgentRole;
    }

    return null;
  }

  /**
   * 获取当前运行中的任务数量
   */
  getRunningCount(): number {
    return this.runningTasks.size;
  }

  /**
   * 检查是否还有任务在运行
   */
  hasRunningTasks(): boolean {
    return this.runningTasks.size > 0;
  }
}
