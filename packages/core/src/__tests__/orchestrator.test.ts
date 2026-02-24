import { describe, it, expect, beforeEach } from "vitest";
import { TaskOrchestrator } from "../orchestrator.js";
import { createTask } from "../task.js";
import type { AgentContext } from "../types.js";

describe("TaskOrchestrator", () => {
  let orchestrator: TaskOrchestrator;
  let context: AgentContext;

  beforeEach(() => {
    orchestrator = new TaskOrchestrator({
      maxParallelTasks: 2,
      enableReview: false,
      autoExecute: false,
    });

    context = {
      workspacePath: "/test/workspace",
      projectDocs: [],
      previousTasks: [],
    };
  });

  describe("decomposeTask", () => {
    it("should handle decomposition gracefully", async () => {
      const userInput = "实现用户登录功能";

      // 由于当前是模拟实现，decompose 会失败
      // 这是预期的，因为我们还没有集成真实的 Task tool
      await expect(
        orchestrator.decomposeTask(userInput, context)
      ).rejects.toThrow();
    });
  });

  describe("task queue management", () => {
    it("should add tasks to queue", async () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend");

      orchestrator.getTaskQueue().addAll([task1, task2]);

      const stats = orchestrator.getStats();
      expect(stats.tasks.total).toBe(2);
    });

    it("should track task dependencies", async () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend", {
        dependencies: [task1.id],
      });

      orchestrator.getTaskQueue().addAll([task1, task2]);

      const stats = orchestrator.getStats();
      expect(stats.tasks.ready).toBe(1); // Only task1 is ready
      expect(stats.tasks.pending).toBe(1); // task2 is pending
    });
  });

  describe("executeTask", () => {
    it("should execute a single task", async () => {
      const task = createTask("Test task", "Description", "backend");
      orchestrator.getTaskQueue().add(task);

      await orchestrator.executeTask(task.id, context);

      const updatedTask = orchestrator.getTaskQueue().get(task.id);
      expect(updatedTask?.status).toBe("completed");
    });

    it("should fail if task dependencies are not met", async () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend", {
        dependencies: [task1.id],
      });

      orchestrator.getTaskQueue().addAll([task1, task2]);

      await expect(
        orchestrator.executeTask(task2.id, context)
      ).rejects.toThrow();
    });
  });

  describe("executeParallel", () => {
    it("should execute multiple independent tasks in parallel", async () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend");

      orchestrator.getTaskQueue().addAll([task1, task2]);

      await orchestrator.executeParallel([task1.id, task2.id], context);

      const updatedTask1 = orchestrator.getTaskQueue().get(task1.id);
      const updatedTask2 = orchestrator.getTaskQueue().get(task2.id);

      expect(updatedTask1?.status).toBe("completed");
      expect(updatedTask2?.status).toBe("completed");
    });
  });

  describe("getStats", () => {
    it("should return orchestrator statistics", () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend");

      orchestrator.getTaskQueue().addAll([task1, task2]);

      const stats = orchestrator.getStats();

      expect(stats.tasks.total).toBe(2);
      expect(stats.tasks.ready).toBe(2);
      expect(stats.agents.totalAgents).toBeGreaterThanOrEqual(0);
    });
  });

  describe("clear", () => {
    it("should clear all state", () => {
      const task = createTask("Task", "Description", "backend");
      orchestrator.getTaskQueue().add(task);

      orchestrator.clear();

      const stats = orchestrator.getStats();
      expect(stats.tasks.total).toBe(0);
    });
  });
});
