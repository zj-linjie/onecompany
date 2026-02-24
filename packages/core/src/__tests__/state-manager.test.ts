import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StateManager } from "../state-manager.js";
import { createTask } from "../task.js";
import type { ExecutionEvent } from "../types.js";
import { rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

describe("StateManager", () => {
  let stateManager: StateManager;
  let testWorkspace: string;

  beforeEach(async () => {
    // 创建临时测试目录
    testWorkspace = path.join(tmpdir(), `onecompany-test-${Date.now()}`);
    stateManager = new StateManager(testWorkspace);
    await stateManager.initialize();
  });

  afterEach(async () => {
    // 清理测试目录
    try {
      await rm(testWorkspace, { recursive: true, force: true });
    } catch {
      // 忽略清理错误
    }
  });

  describe("initialize", () => {
    it("should create state directory", async () => {
      const stateDir = stateManager.getStateDir();
      expect(stateDir).toContain(".onecompany");
    });
  });

  describe("saveTasks and loadTasks", () => {
    it("should save and load tasks", async () => {
      const task1 = createTask("Task 1", "Description 1", "backend");
      const task2 = createTask("Task 2", "Description 2", "frontend");

      await stateManager.saveTasks([task1, task2]);

      const loadedTasks = await stateManager.loadTasks();

      expect(loadedTasks).toHaveLength(2);
      expect(loadedTasks[0]?.title).toBe("Task 1");
      expect(loadedTasks[1]?.title).toBe("Task 2");
    });

    it("should return empty array when no tasks file exists", async () => {
      const loadedTasks = await stateManager.loadTasks();
      expect(loadedTasks).toEqual([]);
    });

    it("should preserve task dates", async () => {
      const task = createTask("Task", "Description", "backend");
      task.startedAt = new Date();
      task.completedAt = new Date();

      await stateManager.saveTasks([task]);

      const loadedTasks = await stateManager.loadTasks();
      const loadedTask = loadedTasks[0];

      expect(loadedTask?.createdAt).toBeInstanceOf(Date);
      expect(loadedTask?.startedAt).toBeInstanceOf(Date);
      expect(loadedTask?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe("logExecution and loadExecutionLog", () => {
    it("should log and load execution events", async () => {
      const event1: ExecutionEvent = {
        timestamp: new Date(),
        type: "task_created",
        taskId: "task-1",
        message: "Task created",
      };

      const event2: ExecutionEvent = {
        timestamp: new Date(),
        type: "task_started",
        taskId: "task-1",
        message: "Task started",
      };

      await stateManager.logExecution(event1);
      await stateManager.logExecution(event2);

      const log = await stateManager.loadExecutionLog();

      expect(log).toHaveLength(2);
      expect(log[0]?.type).toBe("task_created");
      expect(log[1]?.type).toBe("task_started");
    });

    it("should return empty array when no log file exists", async () => {
      const log = await stateManager.loadExecutionLog();
      expect(log).toEqual([]);
    });

    it("should preserve event timestamps", async () => {
      const event: ExecutionEvent = {
        timestamp: new Date(),
        type: "system_event",
        message: "Test event",
      };

      await stateManager.logExecution(event);

      const log = await stateManager.loadExecutionLog();
      expect(log[0]?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("saveState and loadState", () => {
    it("should save and load complete project state", async () => {
      const task = createTask("Task", "Description", "backend");
      const event: ExecutionEvent = {
        timestamp: new Date(),
        type: "task_created",
        taskId: task.id,
        message: "Task created",
      };

      await stateManager.saveState([task], [event]);

      const state = await stateManager.loadState();

      expect(state.tasks).toHaveLength(1);
      expect(state.executionLog).toHaveLength(1);
      expect(state.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe("updateKnowledge and readKnowledge", () => {
    it("should update and read knowledge documents", async () => {
      const docPath = "docs/test.md";
      const content = "# Test Document\n\nThis is a test.";

      await stateManager.updateKnowledge(docPath, content);

      const readContent = await stateManager.readKnowledge(docPath);

      expect(readContent).toBe(content);
    });

    it("should create directories as needed", async () => {
      const docPath = "docs/nested/deep/test.md";
      const content = "Test content";

      await stateManager.updateKnowledge(docPath, content);

      const readContent = await stateManager.readKnowledge(docPath);

      expect(readContent).toBe(content);
    });
  });

  describe("clearState", () => {
    it("should clear all state", async () => {
      const task = createTask("Task", "Description", "backend");
      const event: ExecutionEvent = {
        timestamp: new Date(),
        type: "task_created",
        taskId: task.id,
        message: "Task created",
      };

      await stateManager.saveState([task], [event]);

      await stateManager.clearState();

      const tasks = await stateManager.loadTasks();
      const log = await stateManager.loadExecutionLog();

      expect(tasks).toEqual([]);
      expect(log).toEqual([]);
    });
  });
});
