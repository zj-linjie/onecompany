import { describe, it, expect, beforeEach } from "vitest";
import { SubagentExecutor, createAgentExecutor } from "../subagent-executor.js";
import { createTask } from "../task.js";
import type { AgentContext } from "../types.js";
import path from "node:path";

describe("SubagentExecutor", () => {
  let executor: SubagentExecutor;
  let context: AgentContext;

  beforeEach(() => {
    // 不指定 promptsDir，使用默认路径
    executor = new SubagentExecutor(
      "test-agent",
      "backend-dev",
      ["api-design", "testing"]
    );

    context = {
      workspacePath: "/test/workspace",
      projectDocs: ["docs/architecture.md", "docs/api.md"],
      previousTasks: [],
    };
  });

  describe("createAgentExecutor", () => {
    it("should create executor for each role", () => {
      const pmAgent = createAgentExecutor("product-manager");
      expect(pmAgent.role).toBe("product-manager");
      expect(pmAgent.skills.length).toBeGreaterThan(0);

      const devAgent = createAgentExecutor("backend-dev");
      expect(devAgent.role).toBe("backend-dev");
      expect(devAgent.skills).toContain("api-design");
    });
  });

  describe("execute", () => {
    it("should execute a task and return result", async () => {
      const task = createTask(
        "实现登录 API",
        "实现用户登录的后端 API，包括密码验证和 JWT 生成",
        "backend"
      );

      const result = await executor.execute(task, context);

      // 打印结果以便调试
      console.log("Result:", result);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toBeTruthy();
    });

    it("should handle errors gracefully", async () => {
      const invalidExecutor = new SubagentExecutor(
        "test",
        "backend-dev",
        [],
        "/invalid/path"
      );

      const task = createTask("Test task", "Description", "backend");

      const result = await invalidExecutor.execute(task, context);

      expect(result.success).toBe(false);
      expect(result.output).toContain("Error");
    });
  });

  describe("canHandle", () => {
    it("should return true for compatible task types", () => {
      const backendTask = createTask("API task", "Desc", "backend");
      expect(executor.canHandle(backendTask)).toBe(true);
    });

    it("should return false for incompatible task types", () => {
      const frontendTask = createTask("UI task", "Desc", "frontend");
      expect(executor.canHandle(frontendTask)).toBe(false);
    });
  });
});
