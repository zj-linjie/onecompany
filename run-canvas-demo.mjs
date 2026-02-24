#!/usr/bin/env node

/**
 * 自动化测试脚本：创建项目并执行 Canvas 任务
 */

import { TaskOrchestrator } from "@onecompany/core";
import { runNewProjectFlow } from "@onecompany/flow-new-project";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WORKSPACE_ROOT = path.join(ROOT, "workspaces");

async function main() {
  console.log("\n🚀 === OneCompany 自动化执行演示 ===\n");

  // Step 1: 创建新项目
  console.log("📦 Step 1: 创建测试项目...\n");

  const projectName = "canvas-skill-manager";
  const result = await runNewProjectFlow({
    workspaceRoot: WORKSPACE_ROOT,
    projectName,
    projectDescription: "Canvas Skill & Agent 可视化管理系统",
    productMode: "mixed",
    creator: "onecompany-agent",
  });

  console.log(`✅ 项目已创建: ${result.workspacePath}\n`);
  console.log("创建的文件:");
  result.createdFiles.forEach((file) => {
    console.log(`  - ${file}`);
  });

  // Step 2: 读取需求文档
  console.log("\n📄 Step 2: 读取需求文档...\n");

  const requirementsPath = path.join(
    ROOT,
    "examples/canvas-skill-manager-requirements.md"
  );
  const userInput = await readFile(requirementsPath, "utf-8");

  console.log(`✅ 已读取: ${requirementsPath}`);
  console.log(`📊 文档长度: ${userInput.length} 字符\n`);

  // Step 3: 初始化 Orchestrator
  console.log("⚙️  Step 3: 初始化 Orchestrator...\n");

  const orchestrator = new TaskOrchestrator({
    maxParallelTasks: 3,
    enableReview: false, // 演示模式，跳过审查
    enablePersistence: true,
  });

  await orchestrator.initialize(result.workspacePath);
  console.log("✅ Orchestrator 初始化完成\n");

  // Step 4: 分解任务
  console.log("📋 Step 4: 分解任务...\n");
  console.log("=" .repeat(60));

  const context = {
    workspacePath: result.workspacePath,
    projectDocs: result.createdFiles,
    previousTasks: [],
  };

  let tasks;
  try {
    tasks = await orchestrator.decomposeTask(userInput, context);
    console.log("=" .repeat(60));
    console.log(`\n✅ 成功分解为 ${tasks.length} 个任务\n`);
  } catch (error) {
    console.log("=" .repeat(60));
    console.log("\n⚠️  任务分解遇到问题（使用模拟数据）\n");

    // 使用预定义的任务列表
    tasks = [
      {
        id: "task-1",
        title: "设计系统架构和数据模型",
        description: "设计 Canvas 应用的整体架构，包括前端组件结构、状态管理方案、数据流设计。",
        type: "architecture",
        status: "ready",
        dependencies: [],
        priority: 10,
        createdAt: new Date(),
      },
      {
        id: "task-2",
        title: "搭建 React + TypeScript 项目基础",
        description: "创建 packages/canvas-app 项目，配置 React 18、TypeScript、Vite。",
        type: "frontend",
        status: "ready",
        dependencies: [],
        priority: 9,
        createdAt: new Date(),
      },
      {
        id: "task-3",
        title: "集成 React Flow 实现画布系统",
        description: "集成 React Flow 库，实现无限画布、缩放、平移功能。",
        type: "frontend",
        status: "pending",
        dependencies: ["task-1", "task-2"],
        priority: 8,
        createdAt: new Date(),
      },
    ];

    // 手动添加到队列
    tasks.forEach(task => {
      orchestrator.taskQueue.add(task);
    });
  }

  // 显示任务列表
  console.log("📝 任务列表：\n");
  tasks.forEach((task, index) => {
    const statusIcon = task.status === "ready" ? "🟢" : "⏸️";
    const typeIcon =
      task.type === "architecture" ? "🏗️" :
      task.type === "frontend" ? "🎨" :
      task.type === "backend" ? "⚙️" :
      task.type === "testing" ? "🧪" : "📦";

    console.log(`${index + 1}. ${statusIcon} ${typeIcon} ${task.title}`);
    console.log(`   状态: ${task.status} | 优先级: ${task.priority}`);
  });

  // Step 5: 执行任务
  console.log("\n\n🚀 Step 5: 开始执行任务...\n");
  console.log("=" .repeat(60));

  try {
    const executionResult = await orchestrator.executeAll(context);

    console.log("=" .repeat(60));
    console.log("\n✅ 执行完成！\n");

    // 显示结果
    console.log("📊 执行结果：\n");
    console.log(`总任务数: ${executionResult.totalTasks}`);
    console.log(`已完成: ${executionResult.completedTasks}`);
    console.log(`失败: ${executionResult.failedTasks}`);

    console.log("\n任务详情：");
    executionResult.tasks.forEach((task, index) => {
      const statusIcon =
        task.status === "completed" ? "✅" :
        task.status === "failed" ? "❌" : "⏳";
      console.log(`${index + 1}. ${statusIcon} ${task.title}`);
      if (task.error) {
        console.log(`   错误: ${task.error}`);
      }
      if (task.result?.output) {
        const preview = task.result.output.substring(0, 100);
        console.log(`   输出: ${preview}...`);
      }
    });

    // Step 6: 查看保存的状态
    console.log("\n\n💾 Step 6: 查看保存的状态...\n");

    const stateDir = path.join(result.workspacePath, ".onecompany");
    console.log(`状态目录: ${stateDir}`);
    console.log("\n保存的文件:");
    console.log("  - tasks.json (任务队列状态)");
    console.log("  - execution-log.json (执行日志)");

    // 显示统计
    const stats = orchestrator.getStats();
    console.log("\n📈 统计信息：");
    console.log(`- Agent 数量: ${stats.agents.totalAgents}`);
    console.log(`- 任务统计: ${JSON.stringify(stats.tasks)}`);

  } catch (error) {
    console.log("=" .repeat(60));
    console.error("\n❌ 执行出错:", error instanceof Error ? error.message : String(error));
  }

  // 总结
  console.log("\n\n" + "=".repeat(60));
  console.log("🎉 演示完成！");
  console.log("=".repeat(60));

  console.log("\n📁 项目位置:");
  console.log(`   ${result.workspacePath}`);

  console.log("\n📝 查看结果:");
  console.log(`   cat ${path.join(result.workspacePath, ".onecompany/tasks.json")}`);
  console.log(`   cat ${path.join(result.workspacePath, ".onecompany/execution-log.json")}`);

  console.log("\n💡 说明:");
  console.log("   当前使用的是模拟 Agent 执行器");
  console.log("   实际生产环境中，agents 会调用 Claude API 真正执行任务");
  console.log("   你可以在 packages/core/src/subagent-executor.ts 中集成真实 API\n");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
