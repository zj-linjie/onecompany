#!/usr/bin/env node

import path from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { listWorkspaceNames } from "@onecompany/core";
import { runIterateFlow } from "@onecompany/flow-iterate";
import { runNewProjectFlow } from "@onecompany/flow-new-project";
import { runTakeoverFlow } from "@onecompany/flow-takeover";
import { getRoleSkillBundles } from "@onecompany/skills-catalog";
import { TaskOrchestrator } from "@onecompany/core";
import { homedir } from "node:os";

function detectRoot(): string {
  const envRoot = process.env.ONECOMPANY_ROOT ?? process.env.INIT_CWD;
  if (envRoot) {
    return path.resolve(envRoot);
  }

  let current = path.resolve(process.cwd());
  while (true) {
    const packageJsonPath = path.join(current, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const parsed = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
          name?: string;
          workspaces?: unknown;
        };
        if (parsed.name === "onecompany" && Array.isArray(parsed.workspaces)) {
          return current;
        }
      } catch {
        // ignore parse errors and continue climbing
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return path.resolve(process.cwd());
}

const ROOT = detectRoot();
const WORKSPACE_ROOT = path.join(ROOT, "workspaces");
const rl = createInterface({ input, output });

function printHeader(): void {
  console.log("\n=== OneCompany CLI (v0.2.0 - Multi-Agent) ===");
  console.log(`Root: ${ROOT}`);
  console.log("模式：Multi-Agent 协作框架\n");
}

async function prompt(text: string, defaultValue = ""): Promise<string> {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${text}${suffix}: `)).trim();
  return answer || defaultValue;
}

async function chooseMainAction(): Promise<"new" | "takeover" | "iterate" | "agent" | "config" | "exit"> {
  console.log("请选择操作：");
  console.log("1. 新建项目");
  console.log("2. 接管旧项目（本地目录）");
  console.log("3. 继续迭代（传统模式）");
  console.log("4. Agent 协作模式 🤖 (NEW!)");
  console.log("5. Canvas 配置管理 🎨");
  console.log("6. 退出");

  const value = await prompt("输入编号", "4");
  if (value === "1") return "new";
  if (value === "2") return "takeover";
  if (value === "3") return "iterate";
  if (value === "4") return "agent";
  if (value === "5") return "config";
  return "exit";
}

async function runNewFlow(): Promise<void> {
  const projectName = await prompt("项目名", "my-onecompany-project");
  const projectDescription = await prompt("项目简介", "一人公司混合型产品");
  const creator = await prompt("负责人", "founder");

  const result = await runNewProjectFlow({
    workspaceRoot: WORKSPACE_ROOT,
    projectName,
    projectDescription,
    productMode: "mixed",
    creator
  });

  console.log("\n新项目已创建：");
  console.log(`- Workspace: ${result.workspacePath}`);
  console.log("- 创建文件：");
  for (const file of result.createdFiles) {
    console.log(`  - ${file}`);
  }

  console.log("\n角色技能包预览：");
  for (const bundle of getRoleSkillBundles()) {
    console.log(`- ${bundle.role}: ${bundle.skills.join(", ")}`);
  }
}

async function runTakeoverLocalFlow(): Promise<void> {
  const sourcePath = await prompt("旧项目本地路径");
  const suggestedName = path.basename(sourcePath || "takeover-project");
  const projectName = await prompt("接管后的项目名", suggestedName);
  const owner = await prompt("接管负责人", "founder");

  const result = await runTakeoverFlow({
    workspaceRoot: WORKSPACE_ROOT,
    sourcePath,
    projectName,
    owner
  });

  console.log("\n接管分析完成：");
  console.log(`- Workspace: ${result.workspacePath}`);
  console.log(`- 扫描文件数: ${result.scan.fileCount}`);
  console.log(`- 语言: ${result.scan.languages.join(", ") || "未识别"}`);
  console.log(`- 框架: ${result.scan.frameworks.join(", ") || "未识别"}`);
  console.log(`- 风险数: ${result.scan.risks.length}`);
  console.log("- 生成文件：");
  for (const file of result.createdFiles) {
    console.log(`  - ${file}`);
  }
}

async function pickTaskFromBoard(workspacePath: string): Promise<string | undefined> {
  const boardPath = path.join(workspacePath, "docs", "03-task-board.md");

  try {
    await access(boardPath);
  } catch {
    return undefined;
  }

  const content = await readFile(boardPath, "utf8");
  const matches = [...content.matchAll(/^- \[ \] (.+)$/gm)];
  return matches[0]?.[1]?.trim();
}

async function runIterate(): Promise<void> {
  const names = await listWorkspaceNames(WORKSPACE_ROOT);
  if (names.length === 0) {
    console.log("\n当前没有可迭代项目，请先创建或接管项目。\n");
    return;
  }

  console.log("\n可用项目：");
  names.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  const chosen = await prompt("输入项目编号", "1");
  const idx = Number.parseInt(chosen, 10) - 1;
  const workspaceName = names[idx] ?? names[0] ?? "default-workspace";
  const workspacePath = path.join(WORKSPACE_ROOT, workspaceName);

  const suggestedTask = (await pickTaskFromBoard(workspacePath)) ?? "实现下一项核心功能";
  const taskTitle = await prompt("本次任务", suggestedTask);
  const actor = await prompt("执行角色", "fullstack-developer");

  const result = await runIterateFlow({
    workspacePath,
    taskTitle,
    actor
  });

  console.log("\n迭代任务已登记：");
  console.log(`- 任务类型: ${result.taskType}`);
  console.log(`- 推荐技能: ${result.skills.join(", ")}`);
  console.log(`- 开发日志: ${result.devLogPath}`);
  console.log("- 质量门禁：");
  for (const gate of result.qualityGates) {
    console.log(`  - ${gate}`);
  }
}

async function runAgentMode(): Promise<void> {
  console.log("\n🤖 === Agent 协作模式 ===\n");
  console.log("在这个模式下，AI agents 会自动：");
  console.log("1. 分解你的需求为多个任务");
  console.log("2. 智能分配给不同的专业 agent");
  console.log("3. 并行执行独立任务");
  console.log("4. 自动保存进度和状态\n");

  // 选择工作空间
  const names = await listWorkspaceNames(WORKSPACE_ROOT);
  if (names.length === 0) {
    console.log("当前没有可用项目，请先创建项目。\n");
    return;
  }

  console.log("可用项目：");
  names.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  const chosen = await prompt("选择项目", "1");
  const idx = Number.parseInt(chosen, 10) - 1;
  const workspaceName = names[idx] ?? names[0] ?? "default-workspace";
  const workspacePath = path.join(WORKSPACE_ROOT, workspaceName);

  // 获取用户需求
  console.log("\n请描述你的需求，或提供需求文档路径");
  console.log("1. 直接输入需求描述");
  console.log("2. 从文件读取需求文档");

  const inputMode = await prompt("选择输入方式 (1/2)", "1");

  let userInput = "";

  if (inputMode === "2") {
    const docPath = await prompt("需求文档路径（相对或绝对路径）");
    if (!docPath) {
      console.log("文档路径不能为空");
      return;
    }

    try {
      const fullPath = path.isAbsolute(docPath) ? docPath : path.join(workspacePath, docPath);
      userInput = await readFile(fullPath, "utf-8");
      console.log(`\n✅ 已读取文档: ${fullPath}`);
      console.log(`📄 文档长度: ${userInput.length} 字符\n`);
    } catch (error) {
      console.error(`❌ 读取文档失败: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
  } else {
    console.log("\n请描述你的需求（例如：实现用户登录功能）");
    userInput = await prompt("需求描述");
  }

  if (!userInput) {
    console.log("需求不能为空");
    return;
  }

  // 创建 Orchestrator
  const orchestrator = new TaskOrchestrator({
    maxParallelTasks: 2,
    enableReview: false,
    enablePersistence: true,
  });

  try {
    // 初始化状态管理
    await orchestrator.initialize(workspacePath);

    // 尝试加载 Canvas 配置
    console.log("\n🎨 检查 Canvas 配置...\n");
    const canvasInfo = await orchestrator.initializeFromCanvas(workspacePath);

    if (canvasInfo.agents > 0) {
      console.log("✅ 已加载 Canvas 配置：");
      console.log(`   - ${canvasInfo.agents} 个 Agents: ${canvasInfo.agentRoles.join(", ")}`);
      console.log(`   - ${canvasInfo.skills} 个 Skills: ${canvasInfo.skillIds.join(", ")}`);
      console.log("   任务将根据 Canvas 配置智能分配给对应的 Agent\n");
    } else {
      console.log("ℹ️  未找到 Canvas 配置，使用默认 Agent 配置\n");
    }

    console.log("📋 正在分解任务...\n");

    // 分解任务
    const tasks = await orchestrator.decomposeTask(userInput, {
      workspacePath,
      projectDocs: [],
      previousTasks: [],
    });

    console.log(`\n✅ 成功分解为 ${tasks.length} 个任务：\n`);
    tasks.forEach((task, index) => {
      const depInfo = task.dependencies.length > 0
        ? ` (依赖: ${task.dependencies.length} 个任务)`
        : "";
      console.log(`${index + 1}. [${task.type}] ${task.title}${depInfo}`);
      console.log(`   状态: ${task.status} | 优先级: ${task.priority}`);
    });

    // 询问是否执行
    const shouldExecute = await prompt("\n是否开始执行？(y/n)", "y");

    if (shouldExecute.toLowerCase() === "y") {
      console.log("\n🚀 开始执行任务...\n");

      // 执行所有任务
      const result = await orchestrator.executeAll({
        workspacePath,
        projectDocs: [],
        previousTasks: [],
      });

      console.log("\n✅ 执行完成！\n");
      console.log(`总任务数: ${result.totalTasks}`);
      console.log(`已完成: ${result.completedTasks}`);
      console.log(`失败: ${result.failedTasks}`);

      // 显示任务详情
      console.log("\n任务详情：");
      result.tasks.forEach((task, index) => {
        const statusIcon = task.status === "completed" ? "✅" :
                          task.status === "failed" ? "❌" : "⏳";
        console.log(`${index + 1}. ${statusIcon} ${task.title} (${task.status})`);
        if (task.error) {
          console.log(`   错误: ${task.error}`);
        }
      });

      // 显示状态保存位置
      console.log(`\n💾 状态已保存到: ${workspacePath}/.onecompany/`);
    } else {
      console.log("\n已取消执行。任务已保存，可以稍后继续。");
    }

    // 显示统计信息
    const stats = orchestrator.getStats();
    console.log("\n📊 统计信息：");
    console.log(`- Agent 数量: ${stats.agents.totalAgents}`);
    console.log(`- 任务统计: ${JSON.stringify(stats.tasks)}`);

  } catch (error) {
    console.error("\n❌ 执行出错:", error instanceof Error ? error.message : String(error));
  }
}

async function runCanvasConfigManagement(): Promise<void> {
  console.log("\n🎨 === Canvas 配置管理 ===\n");
  console.log("1. 从 Canvas 保存配置到项目");
  console.log("2. 查看项目配置");
  console.log("3. 返回主菜单");

  const choice = await prompt("\n选择操作", "1");

  if (choice === "1") {
    await saveCanvasConfigToProject();
  } else if (choice === "2") {
    await viewProjectConfig();
  }
}

async function saveCanvasConfigToProject(): Promise<void> {
  console.log("\n📁 保存 Canvas 配置到项目\n");

  // 选择工作空间
  const names = await listWorkspaceNames(WORKSPACE_ROOT);
  if (names.length === 0) {
    console.log("当前没有可用项目。\n");
    return;
  }

  console.log("可用项目：");
  names.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  const chosen = await prompt("选择项目", "1");
  const idx = Number.parseInt(chosen, 10) - 1;
  const workspaceName = names[idx] ?? names[0] ?? "default-workspace";
  const workspacePath = path.join(WORKSPACE_ROOT, workspaceName);

  // 从 localStorage 模拟文件读取配置
  // 在实际环境中，Canvas 的 localStorage 数据存储在浏览器中
  // 这里我们需要从用户提供的路径读取
  console.log("\n📋 Canvas 配置来源：");
  console.log("1. 从下载的文件导入");
  console.log("2. 手动输入配置文件路径");

  const sourceChoice = await prompt("选择来源", "1");

  let configContent: string | null = null;

  if (sourceChoice === "1") {
    // 检查常见的下载位置
    const downloadPath = path.join(homedir(), "Downloads", "canvas-config.json");
    if (existsSync(downloadPath)) {
      console.log(`\n✅ 找到配置文件: ${downloadPath}`);
      const useIt = await prompt("使用此文件？(y/n)", "y");
      if (useIt.toLowerCase() === "y") {
        configContent = readFileSync(downloadPath, "utf-8");
      }
    } else {
      console.log(`\n⚠️  未在下载文件夹找到 canvas-config.json`);
      console.log(`请先在 Canvas 应用中点击"保存配置"按钮`);
      return;
    }
  } else {
    const configPath = await prompt("配置文件路径");
    if (!configPath || !existsSync(configPath)) {
      console.log("❌ 文件不存在");
      return;
    }
    configContent = readFileSync(configPath, "utf-8");
  }

  if (!configContent) {
    console.log("❌ 无法读取配置");
    return;
  }

  // 验证配置格式
  try {
    const config = JSON.parse(configContent);
    if (!config.version || !config.nodes || !Array.isArray(config.nodes)) {
      console.log("❌ 配置格式无效");
      return;
    }

    // 创建 .onecompany 目录
    const onecompanyDir = path.join(workspacePath, ".onecompany");
    if (!existsSync(onecompanyDir)) {
      mkdirSync(onecompanyDir, { recursive: true });
      console.log(`\n📁 创建目录: ${onecompanyDir}`);
    }

    // 保存配置
    const targetPath = path.join(onecompanyDir, "canvas-config.json");
    writeFileSync(targetPath, JSON.stringify(config, null, 2), "utf-8");

    console.log(`\n✅ 配置已保存到: ${targetPath}`);
    console.log(`\n📊 配置概览：`);
    console.log(`   - 版本: ${config.version}`);
    console.log(`   - 节点数: ${config.nodes.length}`);

    const agents = config.nodes.filter((n: any) => n.type === "agent" && n.enabled);
    const skills = config.nodes.filter((n: any) => n.type === "skill" && n.enabled);

    console.log(`   - Agents: ${agents.length} 个`);
    agents.forEach((a: any) => {
      console.log(`     • ${a.name} (${a.role})`);
    });

    console.log(`   - Skills: ${skills.length} 个`);
    skills.forEach((s: any) => {
      console.log(`     • ${s.name}`);
    });

    console.log(`\n💡 下一步：`);
    console.log(`   1. 提交到 Git:`);
    console.log(`      cd ${workspacePath}`);
    console.log(`      git add .onecompany/canvas-config.json`);
    console.log(`      git commit -m "Update canvas configuration"`);
    console.log(`\n   2. 运行 Agent 模式测试配置:`);
    console.log(`      npm run onecompany`);
    console.log(`      选择 "4. Agent 协作模式"`);

  } catch (error) {
    console.error("❌ 解析配置失败:", error instanceof Error ? error.message : String(error));
  }
}

async function viewProjectConfig(): Promise<void> {
  console.log("\n📋 查看项目配置\n");

  // 选择工作空间
  const names = await listWorkspaceNames(WORKSPACE_ROOT);
  if (names.length === 0) {
    console.log("当前没有可用项目。\n");
    return;
  }

  console.log("可用项目：");
  names.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  const chosen = await prompt("选择项目", "1");
  const idx = Number.parseInt(chosen, 10) - 1;
  const workspaceName = names[idx] ?? names[0] ?? "default-workspace";
  const workspacePath = path.join(WORKSPACE_ROOT, workspaceName);

  const configPath = path.join(workspacePath, ".onecompany", "canvas-config.json");

  if (!existsSync(configPath)) {
    console.log(`\n⚠️  项目尚未配置 Canvas`);
    console.log(`配置文件不存在: ${configPath}`);
    console.log(`\n请先在 Canvas 应用中配置并保存。`);
    return;
  }

  try {
    const configContent = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    console.log(`\n✅ 配置文件: ${configPath}`);
    console.log(`\n📊 配置详情：`);
    console.log(`   版本: ${config.version}`);
    console.log(`   项目: ${config.project?.name || "未命名"}`);
    console.log(`   节点总数: ${config.nodes.length}`);

    const agents = config.nodes.filter((n: any) => n.type === "agent");
    const skills = config.nodes.filter((n: any) => n.type === "skill");
    const enabledAgents = agents.filter((n: any) => n.enabled);
    const enabledSkills = skills.filter((n: any) => n.enabled);

    console.log(`\n👥 Agents (${agents.length} 个，${enabledAgents.length} 个启用):`);
    agents.forEach((a: any) => {
      const status = a.enabled ? "✓" : "✗";
      console.log(`   ${status} ${a.name} (${a.role})`);
      console.log(`      专长: ${a.specialization}`);
      console.log(`      技能: ${a.skills.join(", ")}`);
    });

    console.log(`\n🔧 Skills (${skills.length} 个，${enabledSkills.length} 个启用):`);
    skills.forEach((s: any) => {
      const status = s.enabled ? "✓" : "✗";
      console.log(`   ${status} ${s.name} (${s.skillId})`);
      console.log(`      ${s.description}`);
    });

    console.log(`\n🔗 连接: ${config.connections?.length || 0} 个`);

  } catch (error) {
    console.error("❌ 读取配置失败:", error instanceof Error ? error.message : String(error));
  }
}

async function main(): Promise<void> {
  printHeader();
  try {
    const action = await chooseMainAction();

    if (action === "new") {
      await runNewFlow();
      return;
    }

    if (action === "takeover") {
      await runTakeoverLocalFlow();
      return;
    }

    if (action === "iterate") {
      await runIterate();
      return;
    }

    if (action === "agent") {
      await runAgentMode();
      return;
    }

    if (action === "config") {
      await runCanvasConfigManagement();
      return;
    }

    console.log("已退出。");
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n执行失败: ${message}`);
  process.exitCode = 1;
});
