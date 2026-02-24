import { describe, it, expect, beforeEach } from "vitest";
import { TaskQueue } from "../task-queue.js";
import { createTask } from "../task.js";

describe("TaskQueue", () => {
  let queue: TaskQueue;

  beforeEach(() => {
    queue = new TaskQueue();
  });

  describe("add and get", () => {
    it("should add and retrieve a task", () => {
      const task = createTask("Test task", "Description", "general");
      queue.add(task);

      const retrieved = queue.get(task.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Test task");
    });

    it("should add multiple tasks", () => {
      const task1 = createTask("Task 1", "Desc 1", "frontend");
      const task2 = createTask("Task 2", "Desc 2", "backend");

      queue.addAll([task1, task2]);

      expect(queue.size()).toBe(2);
      expect(queue.get(task1.id)).toBeDefined();
      expect(queue.get(task2.id)).toBeDefined();
    });
  });

  describe("getReadyTasks", () => {
    it("should return tasks with ready status and no dependencies", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general");

      queue.addAll([task1, task2]);

      const readyTasks = queue.getReadyTasks();
      expect(readyTasks).toHaveLength(2);
    });

    it("should not return tasks with pending status", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general", {
        dependencies: [task1.id],
      });

      queue.addAll([task1, task2]);

      const readyTasks = queue.getReadyTasks();
      expect(readyTasks).toHaveLength(1);
      expect(readyTasks[0]?.id).toBe(task1.id);
    });
  });

  describe("dependency management", () => {
    it("should check if dependencies are met", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general", {
        dependencies: [task1.id],
      });

      queue.addAll([task1, task2]);

      expect(queue.areDependenciesMet(task1.id)).toBe(true);
      expect(queue.areDependenciesMet(task2.id)).toBe(false);

      queue.updateStatus(task1.id, "completed");
      expect(queue.areDependenciesMet(task2.id)).toBe(true);
    });

    it("should update dependent tasks when a task completes", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general", {
        dependencies: [task1.id],
      });

      queue.addAll([task1, task2]);

      expect(task2.status).toBe("pending");

      queue.updateStatus(task1.id, "completed");

      const updatedTask2 = queue.get(task2.id);
      expect(updatedTask2?.status).toBe("ready");
    });

    it("should handle multiple dependencies", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general");
      const task3 = createTask("Task 3", "Desc", "general", {
        dependencies: [task1.id, task2.id],
      });

      queue.addAll([task1, task2, task3]);

      expect(queue.areDependenciesMet(task3.id)).toBe(false);

      queue.updateStatus(task1.id, "completed");
      expect(queue.areDependenciesMet(task3.id)).toBe(false);

      queue.updateStatus(task2.id, "completed");
      expect(queue.areDependenciesMet(task3.id)).toBe(true);

      const updatedTask3 = queue.get(task3.id);
      expect(updatedTask3?.status).toBe("ready");
    });
  });

  describe("status updates", () => {
    it("should update task status", () => {
      const task = createTask("Task", "Desc", "general");
      queue.add(task);

      queue.updateStatus(task.id, "running");
      expect(queue.get(task.id)?.status).toBe("running");

      queue.updateStatus(task.id, "completed");
      expect(queue.get(task.id)?.status).toBe("completed");
    });

    it("should set startedAt when status changes to running", () => {
      const task = createTask("Task", "Desc", "general");
      queue.add(task);

      expect(task.startedAt).toBeUndefined();

      queue.updateStatus(task.id, "running");
      const updated = queue.get(task.id);
      expect(updated?.startedAt).toBeDefined();
    });

    it("should set completedAt when status changes to completed", () => {
      const task = createTask("Task", "Desc", "general");
      queue.add(task);

      queue.updateStatus(task.id, "completed");
      const updated = queue.get(task.id);
      expect(updated?.completedAt).toBeDefined();
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general", {
        dependencies: [task1.id],
      });
      const task3 = createTask("Task 3", "Desc", "general");

      queue.addAll([task1, task2, task3]);
      queue.updateStatus(task1.id, "running");

      const stats = queue.getStats();
      expect(stats.total).toBe(3);
      expect(stats.ready).toBe(1); // task3
      expect(stats.pending).toBe(1); // task2
      expect(stats.running).toBe(1); // task1
      expect(stats.completed).toBe(0);
    });
  });

  describe("JSON serialization", () => {
    it("should export to JSON", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general");

      queue.addAll([task1, task2]);

      const json = queue.toJSON();
      expect(json).toHaveLength(2);
      expect(json[0]?.title).toBe("Task 1");
    });

    it("should import from JSON", () => {
      const task1 = createTask("Task 1", "Desc", "general");
      const task2 = createTask("Task 2", "Desc", "general");

      const data = [task1, task2];
      const newQueue = TaskQueue.fromJSON(data);

      expect(newQueue.size()).toBe(2);
      expect(newQueue.get(task1.id)).toBeDefined();
    });
  });
});
