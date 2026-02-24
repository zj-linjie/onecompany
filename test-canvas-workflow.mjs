#!/usr/bin/env node

/**
 * 测试脚本：模拟 OneCompany Agent 协作模式
 * 用于演示如何处理 Canvas Skill Manager 需求
 */

import { TaskOrchestrator } from "@onecompany/core";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  console.log("\n🤖 === OneCompany Agent 协作模式测试 ===\n");

  // 读取需求文档
  const requirementsPath = path.join(
    process.cwd(),
    "examples/canvas-skill-manager-requirements.md"
  );

  console.log("📄 读取需求文档...");
  const userInput = await readFile(requirementsPath, "utf-8");
  console.log(`✅ 已读取文档: ${requirementsPath}`);
  console.log(`📊 文档长度: ${userInput.length} 字符\n`);

  // 创建 Orchestrator
  console.log("⚙️  初始化 Orchestrator...");
  const orchestrator = new TaskOrchestrator({
    maxParallelTasks: 3,
    enableReview: false,
    enablePersistence: true,
  });

  // 模拟工作空间路径
  const workspacePath = path.join(process.cwd(), "workspaces/canvas-skill-manager");

  try {
    // 初始化
    await orchestrator.initialize(workspacePath);
    console.log("✅ Orchestrator 初始化完成\n");

    // 分解任务
    console.log("📋 正在分解任务...\n");
    console.log("=" .repeat(60));

    const context = {
      workspacePath,
      projectDocs: [],
      previousTasks: [],
    };

    const tasks = await orchestrator.decomposeTask(userInput, context);

    console.log("=" .repeat(60));
    console.log(`\n✅ 成功分解为 ${tasks.length} 个任务\n`);

    // 显示任务列表
    console.log("📝 任务列表：\n");
    tasks.forEach((task, index) => {
      const statusIcon = task.status === "ready" ? "🟢" : "⏸️";
      const depInfo =
        task.dependencies.length > 0
          ? ` (依赖 ${task.dependencies.length} 个任务)`
          : " (可立即执行)";

      console.log(`${index + 1}. ${statusIcon} [${task.type}] ${task.title}`);
      console.log(`   状态: ${task.status} | 优先级: ${task.priority}${depInfo}`);
      console.log(`   描述: ${task.description.substring(0, 100)}...`);
      console.log();
    });

    // 分析任务依赖关系
    console.log("🔗 依赖关系分析：\n");
    const readyTasks = tasks.filter((t) => t.status === "ready");
    const pendingTasks = tasks.filter((t) => t.status === "pending");

    console.log(`✅ 可立即执行: ${readyTasks.length} 个任务`);
    readyTasks.forEach((task) => {
      console.log(`   - ${task.title}`);
    });

    console.log(`\n⏸️  等待依赖: ${pendingTasks.length} 个任务`);
    pendingTasks.forEach((task) => {
      const deps = task.dependencies
        .map((depId) => {
          const depTask = tasks.find((t) => t.id === depId);
          return depTask ? depTask.title : depId;
        })
        .join(", ");
      console.log(`   - ${task.title}`);
      console.log(`     等待: ${deps}`);
    });

    // 显示执行计划
    console.log("\n\n🚀 执行计划：\n");

    // 按优先级和依赖关系排序
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.dependencies.length !== b.dependencies.length) {
        return a.dependencies.length - b.dependencies.length;
      }
      return b.priority - a.priority;
    });

    let phase = 1;
    let currentDeps = 0;

    sortedTasks.forEach((task, index) => {
      if (task.dependencies.length > currentDeps) {
        currentDeps = task.dependencies.length;
        phase++;
        console.log(`\n--- Phase ${phase} ---`);
      }

      const parallelIcon = task.status === "ready" ? "⚡" : "⏳";
      console.log(`${parallelIcon} ${task.title}`);
    });

    // 显示统计信息
    console.log("\n\n📊 统计信息：\n");
    const stats = orchestrator.getStats();
    console.log(`- 总任务数: ${tasks.length}`);
    console.log(`- 可并行任务: ${readyTasks.length}`);
    console.log(`- Agent 数量: ${stats.agents.totalAgents}`);

    // 按类型统计
    const tasksByType = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {});

    console.log("\n任务类型分布:");
    Object.entries(tasksByType).forEach(([type, count]) => {
      const icon =
        type === "architecture"
          ? "🏗️"
          : type === "frontend"
          ? "🎨"
          : type === "backend"
          ? "⚙️"
          : type === "testing"
          ? "🧪"
          : "📦";
      console.log(`  ${icon} ${type}: ${count} 个`);
    });

    // 询问是否执行
    console.log("\n\n" + "=".repeat(60));
    console.log("💡 提示：这是一个演示，实际执行需要在 CLI 中确认");
    console.log("=".repeat(60));

    console.log("\n如果执行，系统将：");
    console.log("1. ⚡ 并行执行 Phase 1 的所有任务");
    console.log("2. 🔄 完成后自动解锁 Phase 2 任务");
    console.log("3. 📝 实时记录执行日志");
    console.log("4. 💾 保存状态到 .onecompany/");
    console.log("5. ✅ 生成最终报告\n");

    // 保存任务到文件（演示持久化）
    console.log("💾 保存任务状态...");
    const stateManager = orchestrator.stateManager;
    if (stateManager) {
      await stateManager.saveTasks(tasks);
      console.log(`✅ 任务已保存到: ${workspacePath}/.onecompany/tasks.json\n`);
    }

    console.log("🎉 演示完成！\n");
  } catch (error) {
    console.error("\n❌ 执行出错:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error("\n堆栈信息:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
