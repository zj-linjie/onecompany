#!/usr/bin/env node

/**
 * Canvas Integration Quick Demo
 * 快速演示 Canvas 配置加载功能
 */

import { TaskOrchestrator } from "./packages/core/dist/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspacePath = path.join(__dirname, "workspaces", "canvas-skill-manager");

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║      Canvas Integration - Configuration Loading Demo          ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

console.log("📍 工作空间:", workspacePath);
console.log("📄 Canvas 配置文件:", path.join(workspacePath, ".onecompany/canvas-config.json"));
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
    console.log("🎨 正在加载 Canvas 配置...\n");
    const canvasInfo = await orchestrator.initializeFromCanvas(workspacePath);

    console.log("─────────────────────────────────────────────────────────────\n");

    if (canvasInfo.agents > 0) {
      console.log("✅ Canvas 配置加载成功！\n");

      console.log("📊 配置详情：\n");
      console.log(`   Agents (${canvasInfo.agents} 个):`);
      canvasInfo.agentRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role}`);
      });
      console.log("");

      console.log(`   Skills (${canvasInfo.skills} 个):`);
      canvasInfo.skillIds.forEach((skillId, index) => {
        console.log(`   ${index + 1}. ${skillId}`);
      });
      console.log("");

      // 显示统计信息
      const stats = orchestrator.getStats();
      console.log("📈 系统状态：\n");
      console.log(`   ├─ 已注册 Agents: ${stats.agents.totalAgents} 个`);
      console.log(`   ├─ Agent 类型分布:`);
      Object.entries(stats.agents.agentsByRole).forEach(([role, count]) => {
        console.log(`   │  └─ ${role}: ${count}`);
      });
      console.log(`   └─ 任务队列: ${stats.tasks.total} 个任务`);
      console.log("");

      console.log("─────────────────────────────────────────────────────────────\n");
      console.log("🎯 智能任务分配策略：\n");
      console.log("   当用户提交需求时，系统会：");
      console.log("   1. 自动分解需求为多个子任务");
      console.log("   2. 根据任务类型匹配所需技能");
      console.log("   3. 从 Canvas 配置中选择最合适的 Agent");
      console.log("   4. 计算 Agent 技能与任务需求的匹配度");
      console.log("   5. 将任务分配给匹配度最高的 Agent");
      console.log("");

      console.log("📋 任务类型 → Agent 映射示例：\n");
      console.log("   Frontend 任务 → frontend-dev");
      console.log("   Backend 任务  → backend-dev");
      console.log("   Testing 任务  → tester");
      console.log("");

      console.log("─────────────────────────────────────────────────────────────\n");
      console.log("✨ 集成特性：\n");
      console.log("   ✓ 自动读取 Canvas 配置文件");
      console.log("   ✓ 动态注册配置的 Agents");
      console.log("   ✓ 基于技能匹配度的智能分配");
      console.log("   ✓ 支持配置热更新");
      console.log("   ✓ 完整的日志记录");
      console.log("");

      console.log("🚀 使用方式：\n");
      console.log("   1. 在 Canvas 应用中配置 Skills 和 Agents");
      console.log("   2. 点击\"保存配置\"按钮");
      console.log("   3. 运行 'npm run onecompany' 选择 Agent 模式");
      console.log("   4. 系统自动加载配置并智能分配任务");
      console.log("");

      console.log("📝 配置文件位置：");
      console.log(`   ${workspacePath}/.onecompany/canvas-config.json`);
      console.log("");

    } else {
      console.log("⚠️  未找到 Canvas 配置\n");
      console.log("请先在 Canvas 应用中创建配置：");
      console.log("   1. cd packages/canvas-app");
      console.log("   2. npm run dev");
      console.log("   3. 配置 Skills 和 Agents");
      console.log("   4. 保存配置");
      console.log("");
    }

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                    演示完成！                                   ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

  } catch (error) {
    console.error("\n❌ 演示出错:", error.message);
    if (error.stack) {
      console.error("\n堆栈跟踪:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
