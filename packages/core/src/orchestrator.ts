/**
 * 任务编排引擎
 * 协调任务分解、调度和执行的核心组件
 */

import type { Task, AgentContext, ExecutionEvent } from "./types.js";
import { TaskQueue } from "./task-queue.js";
import { TaskDecomposer } from "./task-decomposer.js";
import { TaskScheduler, type SchedulerConfig } from "./task-scheduler.js";
import { AgentManager } from "./agent-manager.js";
import { StateManager } from "./state-manager.js";

export interface OrchestratorConfig extends SchedulerConfig {
  autoExecute?: boolean;
  enablePersistence?: boolean;
}

export interface ExecutionResult {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  tasks: Task[];
}

export class TaskOrchestrator {
  private taskQueue: TaskQueue;
  private decomposer: TaskDecomposer;
  private scheduler: TaskScheduler;
  private agentManager: AgentManager;
  private stateManager: StateManager | null = null;
  private config: OrchestratorConfig;
  private executionLog: ExecutionEvent[] = [];

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxParallelTasks: config.maxParallelTasks || 3,
      enableReview: config.enableReview !== false,
      autoExecute: config.autoExecute !== false,
      enablePersistence: config.enablePersistence !== false,
    };

    this.taskQueue = new TaskQueue();
    this.decomposer = new TaskDecomposer();
    this.scheduler = new TaskScheduler(this.taskQueue, this.config);
    this.agentManager = new AgentManager();
  }

  /**
   * 初始化状态管理器
   */
  async initialize(workspacePath: string): Promise<void> {
    if (this.config.enablePersistence) {
      this.stateManager = new StateManager(workspacePath);
      await this.stateManager.initialize();

      // 尝试加载之前的状态
      try {
        const state = await this.stateManager.loadState();
        this.taskQueue.addAll(state.tasks);
        this.executionLog = state.executionLog;
        this.log({
          type: "system_event",
          message: `Loaded ${state.tasks.length} tasks from previous session`,
        });
      } catch (error) {
        this.log({
          type: "system_event",
          message: "Starting fresh session (no previous state found)",
        });
      }
    }
  }

  /**
   * 从 Canvas 配置初始化 Agents
   */
  async initializeFromCanvas(workspacePath: string): Promise<{
    agents: number;
    skills: number;
    agentRoles: string[];
    skillIds: string[];
  }> {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");

    const configPath = join(workspacePath, ".onecompany/canvas-config.json");

    try {
      const configData = await readFile(configPath, "utf-8");
      const config = JSON.parse(configData);

      // 提取启用的 Agents
      const enabledAgents = config.nodes.filter(
        (node: any) => node.type === "agent" && node.enabled
      );

      // 为每个 Agent 预注册到管理器
      const agentRoles: string[] = [];
      for (const agentNode of enabledAgents) {
        // 预创建 agent 实例
        this.agentManager.getAgent(agentNode.role);
        agentRoles.push(agentNode.role);

        await this.log({
          type: "system_event",
          message: `✅ 已加载 Agent: ${agentNode.name} (${agentNode.role})`,
          metadata: {
            skills: agentNode.skills,
            specialization: agentNode.specialization
          },
        });
      }

      // 提取启用的 Skills
      const enabledSkills = config.nodes.filter(
        (node: any) => node.type === "skill" && node.enabled
      );

      const skillIds = enabledSkills.map((s: any) => s.skillId);

      await this.log({
        type: "system_event",
        message: `📦 项目技能栈: ${enabledSkills.map((s: any) => s.name).join(", ")}`,
        metadata: { skillCount: enabledSkills.length },
      });

      // 将 Canvas 配置传递给 scheduler
      this.scheduler.setCanvasConfig(config);

      return {
        agents: enabledAgents.length,
        skills: enabledSkills.length,
        agentRoles,
        skillIds,
      };
    } catch (error) {
      await this.log({
        type: "system_event",
        message: "⚠️ 未找到 Canvas 配置，使用默认 Agents",
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });

      // 返回空配置
      return {
        agents: 0,
        skills: 0,
        agentRoles: [],
        skillIds: [],
      };
    }
  }

  /**
   * 记录执行事件
   */
  private async log(event: Omit<ExecutionEvent, "timestamp">): Promise<void> {
    const fullEvent: ExecutionEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.executionLog.push(fullEvent);

    if (this.stateManager) {
      await this.stateManager.logExecution(fullEvent);
    }

    console.log(
      `[${fullEvent.timestamp.toISOString()}] [${fullEvent.type}] ${fullEvent.message}`
    );
  }

  /**
   * 保存当前状态
   */
  async saveState(): Promise<void> {
    if (this.stateManager) {
      await this.stateManager.saveState(
        this.taskQueue.getAll(),
        this.executionLog
      );
    }
  }

  /**
   * 分解用户需求为任务
   */
  async decomposeTask(
    userInput: string,
    context: AgentContext
  ): Promise<Task[]> {
    await this.log({
      type: "system_event",
      message: `Decomposing user input: "${userInput}"`,
    });

    const result = await this.decomposer.decompose(userInput, context);

    // 将任务添加到队列
    this.taskQueue.addAll(result.tasks);

    // 记录任务创建事件
    for (const task of result.tasks) {
      await this.log({
        type: "task_created",
        taskId: task.id,
        message: `Created task: ${task.title}`,
        metadata: { type: task.type, priority: task.priority },
      });
    }

    // 保存状态
    await this.saveState();

    console.log(`[Orchestrator] ${result.summary}`);
    console.log(
      `[Orchestrator] Task queue stats:`,
      this.taskQueue.getStats()
    );

    return result.tasks;
  }

  /**
   * 执行所有任务
   */
  async executeAll(context: AgentContext): Promise<ExecutionResult> {
    console.log(`[Orchestrator] Starting execution...`);

    let iterations = 0;
    const maxIterations = 100; // 防止无限循环

    while (iterations < maxIterations) {
      iterations++;

      // 获取就绪的任务
      const readyTasks = this.taskQueue.getReadyTasks();

      if (readyTasks.length === 0) {
        // 检查是否还有运行中的任务
        if (!this.scheduler.hasRunningTasks()) {
          break;
        }
        // 等待运行中的任务完成
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      // 执行就绪的任务
      await this.scheduler.executeReady(context);

      // 打印进度
      const stats = this.taskQueue.getStats();
      console.log(
        `[Orchestrator] Progress: ${stats.completed}/${stats.total} completed, ${stats.running} running, ${stats.failed} failed`
      );
    }

    if (iterations >= maxIterations) {
      console.warn(
        `[Orchestrator] Reached max iterations (${maxIterations}), stopping execution`
      );
    }

    // 返回执行结果
    const stats = this.taskQueue.getStats();
    return {
      totalTasks: stats.total,
      completedTasks: stats.completed,
      failedTasks: stats.failed,
      tasks: this.taskQueue.getAll(),
    };
  }

  /**
   * 执行单个任务
   */
  async executeTask(taskId: string, context: AgentContext): Promise<void> {
    await this.log({
      type: "task_started",
      taskId,
      message: `Starting task: ${taskId}`,
    });

    try {
      await this.scheduler.scheduleTask(taskId, context);

      const task = this.taskQueue.get(taskId);
      if (task?.status === "completed") {
        await this.log({
          type: "task_completed",
          taskId,
          message: `Completed task: ${task.title}`,
        });
      } else if (task?.status === "failed") {
        await this.log({
          type: "task_failed",
          taskId,
          message: `Failed task: ${task.title}`,
          metadata: { error: task.error },
        });
      }

      // 保存状态
      await this.saveState();
    } catch (error) {
      await this.log({
        type: "task_failed",
        taskId,
        message: `Task execution error: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  /**
   * 并行执行多个任务
   */
  async executeParallel(
    taskIds: string[],
    context: AgentContext
  ): Promise<void> {
    await this.scheduler.executeParallel(taskIds, context);
  }

  /**
   * 获取任务队列
   */
  getTaskQueue(): TaskQueue {
    return this.taskQueue;
  }

  /**
   * 获取 Agent 管理器
   */
  getAgentManager(): AgentManager {
    return this.agentManager;
  }

  /**
   * 获取执行统计
   */
  getStats() {
    return {
      tasks: this.taskQueue.getStats(),
      agents: this.agentManager.getStats(),
      scheduler: {
        runningTasks: this.scheduler.getRunningCount(),
      },
    };
  }

  /**
   * 清空所有状态
   */
  clear(): void {
    this.taskQueue.clear();
    this.agentManager.clear();
  }
}
