/**
 * 状态管理器
 * 负责持久化任务状态和执行日志
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import type { Task, ExecutionEvent, ProjectState } from "./types.js";

export class StateManager {
  private workspacePath: string;
  private stateDir: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.stateDir = path.join(workspacePath, ".onecompany");
  }

  /**
   * 初始化状态目录
   */
  async initialize(): Promise<void> {
    try {
      await mkdir(this.stateDir, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to initialize state directory: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 保存任务列表
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    const tasksPath = path.join(this.stateDir, "tasks.json");

    try {
      const data = JSON.stringify(tasks, null, 2);
      await writeFile(tasksPath, data, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save tasks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 加载任务列表
   */
  async loadTasks(): Promise<Task[]> {
    const tasksPath = path.join(this.stateDir, "tasks.json");

    try {
      await access(tasksPath);
      const data = await readFile(tasksPath, "utf-8");
      const tasks = JSON.parse(data) as Task[];

      // 转换日期字符串为 Date 对象
      return tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
    } catch (error) {
      // 文件不存在时返回空数组
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw new Error(
        `Failed to load tasks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 记录执行事件
   */
  async logExecution(event: ExecutionEvent): Promise<void> {
    const logPath = path.join(this.stateDir, "execution-log.json");

    try {
      // 读取现有日志
      let events: ExecutionEvent[] = [];
      try {
        await access(logPath);
        const data = await readFile(logPath, "utf-8");
        events = JSON.parse(data) as ExecutionEvent[];
      } catch {
        // 文件不存在，使用空数组
      }

      // 添加新事件
      events.push({
        ...event,
        timestamp: new Date(),
      });

      // 保存日志
      const data = JSON.stringify(events, null, 2);
      await writeFile(logPath, data, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to log execution event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 加载执行日志
   */
  async loadExecutionLog(): Promise<ExecutionEvent[]> {
    const logPath = path.join(this.stateDir, "execution-log.json");

    try {
      await access(logPath);
      const data = await readFile(logPath, "utf-8");
      const events = JSON.parse(data) as ExecutionEvent[];

      // 转换日期字符串为 Date 对象
      return events.map((event) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    } catch (error) {
      // 文件不存在时返回空数组
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw new Error(
        `Failed to load execution log: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 保存完整的项目状态
   */
  async saveState(tasks: Task[], executionLog: ExecutionEvent[]): Promise<void> {
    await this.initialize();
    await this.saveTasks(tasks);

    // 保存执行日志（覆盖而不是追加）
    const logPath = path.join(this.stateDir, "execution-log.json");
    const data = JSON.stringify(executionLog, null, 2);
    await writeFile(logPath, data, "utf-8");
  }

  /**
   * 加载完整的项目状态
   */
  async loadState(): Promise<ProjectState> {
    const tasks = await this.loadTasks();
    const executionLog = await this.loadExecutionLog();

    return {
      tasks,
      executionLog,
      lastUpdated: new Date(),
    };
  }

  /**
   * 更新项目知识库文档
   */
  async updateKnowledge(docPath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, docPath);
    const dir = path.dirname(fullPath);

    try {
      // 确保目录存在
      await mkdir(dir, { recursive: true });

      // 写入文件
      await writeFile(fullPath, content, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to update knowledge: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 读取项目知识库文档
   */
  async readKnowledge(docPath: string): Promise<string> {
    const fullPath = path.join(this.workspacePath, docPath);

    try {
      return await readFile(fullPath, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to read knowledge: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 清空所有状态
   */
  async clearState(): Promise<void> {
    await this.saveTasks([]);
    const logPath = path.join(this.stateDir, "execution-log.json");
    await writeFile(logPath, "[]", "utf-8");
  }

  /**
   * 获取状态目录路径
   */
  getStateDir(): string {
    return this.stateDir;
  }
}
