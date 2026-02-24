/**
 * 任务队列管理
 */

import type { Task, TaskStatus } from "./types.js";

export class TaskQueue {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map();
  }

  /**
   * 添加任务到队列
   */
  add(task: Task): void {
    this.tasks.set(task.id, task);
  }

  /**
   * 批量添加任务
   */
  addAll(tasks: Task[]): void {
    for (const task of tasks) {
      this.add(task);
    }
  }

  /**
   * 获取任务
   */
  get(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 获取可执行任务（状态为 ready 且依赖已满足）
   */
  getReadyTasks(): Task[] {
    return this.getAll().filter(task =>
      task.status === "ready" && this.areDependenciesMet(task.id)
    );
  }

  /**
   * 获取指定状态的任务
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAll().filter(task => task.status === status);
  }

  /**
   * 更新任务状态
   */
  updateStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.status = status;

    // 更新时间戳
    if (status === "running" && !task.startedAt) {
      task.startedAt = new Date();
    } else if (status === "completed" || status === "failed") {
      task.completedAt = new Date();
    }

    // 如果任务完成，检查并更新依赖此任务的其他任务
    if (status === "completed") {
      this.updateDependentTasks(taskId);
    }
  }

  /**
   * 检查任务的依赖是否都已满足
   */
  areDependenciesMet(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    // 没有依赖，直接返回 true
    if (task.dependencies.length === 0) {
      return true;
    }

    // 检查所有依赖任务是否都已完成
    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask?.status === "completed";
    });
  }

  /**
   * 更新依赖指定任务的其他任务状态
   */
  private updateDependentTasks(completedTaskId: string): void {
    for (const task of this.tasks.values()) {
      if (task.dependencies.includes(completedTaskId) && task.status === "pending") {
        // 检查该任务的所有依赖是否都已满足
        if (this.areDependenciesMet(task.id)) {
          task.status = "ready";
        }
      }
    }
  }

  /**
   * 移除任务
   */
  remove(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.tasks.size;
  }

  /**
   * 获取任务统计信息
   */
  getStats(): {
    total: number;
    pending: number;
    ready: number;
    running: number;
    reviewing: number;
    completed: number;
    failed: number;
  } {
    const tasks = this.getAll();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      ready: tasks.filter(t => t.status === "ready").length,
      running: tasks.filter(t => t.status === "running").length,
      reviewing: tasks.filter(t => t.status === "reviewing").length,
      completed: tasks.filter(t => t.status === "completed").length,
      failed: tasks.filter(t => t.status === "failed").length,
    };
  }

  /**
   * 导出为 JSON
   */
  toJSON(): Task[] {
    return this.getAll();
  }

  /**
   * 从 JSON 导入
   */
  static fromJSON(data: Task[]): TaskQueue {
    const queue = new TaskQueue();
    queue.addAll(data);
    return queue;
  }
}
