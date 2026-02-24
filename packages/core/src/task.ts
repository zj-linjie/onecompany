/**
 * Task 工具函数
 */

import type { Task, TaskType } from "./types.js";

export function createTask(
  title: string,
  description: string,
  type: TaskType,
  options: {
    dependencies?: string[];
    priority?: number;
  } = {}
): Task {
  return {
    id: generateTaskId(),
    title,
    description,
    type,
    status: options.dependencies && options.dependencies.length > 0 ? "pending" : "ready",
    dependencies: options.dependencies || [],
    priority: options.priority || 0,
    createdAt: new Date(),
  };
}

function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
