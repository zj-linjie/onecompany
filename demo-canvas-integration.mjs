#!/usr/bin/env node

/**
 * Canvas Integration Demo
 * 演示 Canvas 配置如何驱动 Agent 协作
 */

import { TaskOrchestrator } from "./packages/core/dist/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacePath = path.join(__dirname, "workspaces", "canvas-skill-manager");

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║         Canvas Integration Demo - OneCompany v0.2.0           ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

console.log("📍 工作空间:", workspacePath);
console.log("📄 Canvas 配置:", path.join(workspacePath, ".onecompany/canvas-config.json"));
console.log("");

async function main() {
  try {
    // 创建 Orchestrator
    console.log("🔧 初始化 TaskOrchestrator...\n");
    const orchestrator = new TaskOrchestrator({
      maxParallelTasks: 2,
      enableReview: false,
      enablePersistence: true,
    });

    // 初始化状态管理
    await orchestrator.initialize(workspacePath);

    // 加载 Canvas 配置
    console.log("🎨 加载 Canvas 配置...\n");
    const canvasInfo = await orchestrator.initializeFromCanvas(workspacePath);

    if (canvasInfo.agents > 0) {
      console.log("✅ Canvas 配置加载成功！\n");
      console.log("📊 配置概览：");
      console.log(`   ├─ Agents: ${canvasInfo.agents} 个`);
      console.log(`   │  └─ ${canvasInfo.agentRoles.join(", ")}`);
      console.log(`   └─ Skills: ${canvasInfo.skills} 个`);
      console.log(`      └─ ${canvasInfo.skillIds.join(", ")}`);
      console.log("");
    } else {
      console.log("⚠️  未找到 Canvas 配置\n");
      return;
    }

    // 模拟用户需求
    const userRequirement = `
实现一个用户管理系统，包括：
1. 用户注册和登录功能（前端表单 + 后端 API）
2. 用户信息的数据库存储
3. 完整的单元测试覆盖
    `.trim();

    console.log("📝 用户需求：");
    console.log("─────────────────────────────────────────────────────────────");
    console.log(userRequirement);
    console.log("─────────────────────────────────────────────────────────────\n");

    // 分解任务
    console.log("🔍 正在分解任务...\n");
    const tasks = await orchestrator.decomposeTask(userRequirement, {
      workspacePath,
      projectDocs: [],
      previousTasks: [],
    });

    console.log(`✅ 成功分解为 ${tasks.length} 个任务：\n`);

    tasks.forEach((task, index) => {
      const depInfo = task.dependencies.length > 0
        ? ` (依赖: ${task.dependencies.join(", ")})`
        : "";

      console.log(`${index + 1}. 📌 ${task.title}`);
      console.log(`   ├─ 类型: ${task.type}`);
      console.log(`   ├─ 状态: ${task.status}`);
      console.log(`   ├─ 优先级: ${task.priority}`);
      if (task.assignedAgent) {
        console.log(`   ├─ 分配给: ${task.assignedAgent}`);
      }
      if (depInfo) {
        console.log(`   └─ 依赖: ${depInfo}`);
      }
      console.log("");
    });

    // 显示任务分配策略
    console.log("🎯 任务分配策略（基于 Canvas 配置）：\n");
    console.log("   Frontend 任务 → frontend-dev (前端开发工程师)");
    console.log("   Backend 任务  → backend-dev (后端开发工程师)");
    console.log("   Testing 任务  → tester (测试工程师)");
    console.log("");

    // 显示执行计划
    console.log("📋 执行计划：\n");
    const readyTasks = tasks.filter(t => t.status === "ready");
    const pendingTasks = tasks.filter(t => t.status === "pending");

    console.log(`   ✓ 可立即执行: ${readyTasks.length} 个任务`);
    readyTasks.forEach(t => {
      console.log(`     - ${t.title}`);
    });
    console.log("");

    console.log(`   ⏳ 等待依赖: ${pendingTasks.length} 个任务`);
    pendingTasks.forEach(t => {
      console.log(`     - ${t.title} (等待: ${t.dependencies.join(", ")})`);
    });
    console.log("");

    // 显示统计信息
    const stats = orchestrator.getStats();
    console.log("📊 系统统计：\n");
    console.log(`   ├─ 已注册 Agents: ${stats.agents.totalAgents} 个`);
    console.log(`   ├─ 任务队列: ${stats.tasks.total} 个任务`);
    console.log(`   │  ├─ Ready: ${stats.tasks.ready}`);
    console.log(`   │  ├─ Pending: ${stats.tasks.pending}`);
    console.log(`   │  ├─ Running: ${stats.tasks.running}`);
    console.log(`   │  ├─ Completed: ${stats.tasks.completed}`);
    console.log(`   │  └─ Failed: ${stats.tasks.failed}`);
    console.log(`   └─ 运行中任务: ${stats.scheduler.runningTasks} 个`);
    console.log("");

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                    Canvas 集成演示完成！                        ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    console.log("💡 关键特性：");
    console.log("   ✓ Canvas 配置自动加载");
    console.log("   ✓ 根据配置的 Skills 智能选择 Agent");
    console.log("   ✓ 任务自动分解和依赖分析");
    console.log("   ✓ 状态持久化到 .onecompany/ 目录");
    console.log("");

    console.log("🚀 下一步：");
    console.log("   1. 在 Canvas 应用中调整配置");
    console.log("   2. 运行 'npm run onecompany' 选择 Agent 模式");
    console.log("   3. 系统将根据最新的 Canvas 配置执行任务");
    console.log("");

  } catch (error) {
    console.error("\n❌ 演示出错:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
