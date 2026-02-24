#!/usr/bin/env node

/**
 * Canvas 配置 CLI 工具
 * 使用真实的 skill-factory 数据
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  loadSkillsFromFactory,
  getSkillFactoryPath,
} from "@onecompany/core";

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const value = args[2];

// 获取当前工作目录
const cwd = process.cwd();
const configDir = path.join(cwd, ".onecompany");
const configPath = path.join(configDir, "canvas-config.json");

// 缓存加载的 Skills
let cachedSkills = null;

// 加载真实的 Skills
async function loadRealSkills() {
  if (cachedSkills) {
    return cachedSkills;
  }

  const factoryPath = await getSkillFactoryPath();
  const result = await loadSkillsFromFactory(factoryPath);
  cachedSkills = result;
  return result;
}

// 确保配置目录存在
function ensureConfigDir() {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

// 加载配置
function loadConfig() {
  if (!existsSync(configPath)) {
    return {
      version: "1.0.0",
      project: {
        id: "project-1",
        type: "project",
        name: path.basename(cwd),
        path: cwd,
        activeSkills: [],
        activeAgents: [],
        position: { x: 400, y: 300 },
      },
      nodes: [],
      connections: [],
    };
  }

  const content = readFileSync(configPath, "utf-8");
  return JSON.parse(content);
}

// 保存配置
function saveConfig(config) {
  ensureConfigDir();
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

// 预定义的 Agents（这些是真实可用的）
const AGENTS = {
  "product-manager": {
    name: "产品经理",
    specialization: "需求分析和任务分解",
    skills: ["brainstorming", "writing-plans"],
  },
  "architect": {
    name: "架构师",
    specialization: "系统架构设计",
    skills: ["architecture-design", "system-design"],
  },
  "frontend-dev": {
    name: "前端开发工程师",
    specialization: "前端开发专家",
    skills: ["canvas-design", "artifacts-builder"],
  },
  "backend-dev": {
    name: "后端开发工程师",
    specialization: "后端开发专家",
    skills: ["mcp-builder"],
  },
  "fullstack-dev": {
    name: "全栈开发工程师",
    specialization: "全栈开发",
    skills: ["canvas-design", "mcp-builder"],
  },
  "devops": {
    name: "DevOps 工程师",
    specialization: "CI/CD 和基础设施",
    skills: ["using-git-worktrees"],
  },
  "tester": {
    name: "测试工程师",
    specialization: "质量保证",
    skills: ["test-driven-development", "systematic-debugging"],
  },
  "spec-reviewer": {
    name: "规格审查员",
    specialization: "需求审查",
    skills: ["verification-before-completion"],
  },
  "code-reviewer": {
    name: "代码审查员",
    specialization: "代码质量审查",
    skills: ["requesting-code-review"],
  },
};

// 命令：list - 列出配置
function cmdList() {
  const config = loadConfig();

  console.log("\n📊 Canvas 配置\n");
  console.log(`项目: ${config.project.name}`);
  console.log(`路径: ${config.project.path}`);
  console.log(`节点数: ${config.nodes.length}\n`);

  const skills = config.nodes.filter((n) => n.type === "skill");
  const agents = config.nodes.filter((n) => n.type === "agent");

  console.log(`🔧 Skills (${skills.length}):`);
  skills.forEach((s) => {
    const status = s.enabled ? "✓" : "✗";
    console.log(`  ${status} ${s.name} (${s.skillId})`);
  });

  console.log(`\n👥 Agents (${agents.length}):`);
  agents.forEach((a) => {
    const status = a.enabled ? "✓" : "✗";
    console.log(`  ${status} ${a.name} (${a.role})`);
    console.log(`     技能: ${a.skills.join(", ")}`);
  });

  console.log("");
}

// 命令：add-skill - 添加 Skill
async function cmdAddSkill(skillId) {
  if (!skillId) {
    console.error("❌ 请提供 Skill ID");
    console.log("用法: npm run canvas-config add-skill <skill-id>");
    console.log("\n💡 使用 'npm run skills search <关键词>' 搜索可用的 Skills");
    process.exit(1);
  }

  // 加载真实的 Skills
  const skillsData = await loadRealSkills();
  const skill = skillsData.skills.find((s) => s.id === skillId);

  if (!skill) {
    console.error(`❌ 未找到 Skill: ${skillId}`);
    console.log("\n💡 使用 'npm run skills list' 查看所有可用的 Skills");
    console.log("💡 使用 'npm run skills search <关键词>' 搜索 Skills");
    process.exit(1);
  }

  const config = loadConfig();

  const exists = config.nodes.find(
    (n) => n.type === "skill" && n.skillId === skillId
  );
  if (exists) {
    console.log(`⚠️  Skill "${skill.name}" 已存在`);
    return;
  }

  const newSkill = {
    id: `skill-${Date.now()}`,
    type: "skill",
    skillId: skill.id,
    name: skill.name,
    description: skill.description,
    enabled: true,
    category: skill.category,
    source: skill.source,
    position: { x: 100, y: 100 + config.nodes.length * 50 },
    connections: [],
  };

  config.nodes.push(newSkill);
  saveConfig(config);

  console.log(`✅ 已添加 Skill: ${skill.name}`);
  console.log(`   类别: ${skill.category}`);
  console.log(`   来源: ${skill.source}`);
}

// 命令：add-agent - 添加 Agent
function cmdAddAgent(agentRole) {
  if (!agentRole || !AGENTS[agentRole]) {
    console.error(`❌ 未知的 Agent: ${agentRole}`);
    console.log("\n可用的 Agents:");
    Object.keys(AGENTS).forEach((role) => {
      console.log(`  - ${role}: ${AGENTS[role].name}`);
    });
    process.exit(1);
  }

  const config = loadConfig();
  const agent = AGENTS[agentRole];

  const exists = config.nodes.find(
    (n) => n.type === "agent" && n.role === agentRole
  );
  if (exists) {
    console.log(`⚠️  Agent "${agent.name}" 已存在`);
    return;
  }

  const newAgent = {
    id: `agent-${Date.now()}`,
    type: "agent",
    role: agentRole,
    name: agent.name,
    specialization: agent.specialization,
    skills: agent.skills,
    enabled: true,
    position: { x: 600, y: 100 + config.nodes.length * 50 },
    connections: [],
  };

  config.nodes.push(newAgent);
  saveConfig(config);

  console.log(`✅ 已添加 Agent: ${agent.name}`);
  console.log(`   角色: ${agentRole}`);
  console.log(`   技能: ${agent.skills.join(", ")}`);
}

// 命令：enable/disable - 启用/禁用节点
function cmdToggle(nodeId, enable) {
  const config = loadConfig();
  const node = config.nodes.find((n) => n.id === nodeId);

  if (!node) {
    console.error(`❌ 未找到节点: ${nodeId}`);
    process.exit(1);
  }

  node.enabled = enable;
  saveConfig(config);

  const status = enable ? "启用" : "禁用";
  console.log(`✅ 已${status}: ${node.name}`);
}

// 命令：remove - 删除节点
function cmdRemove(nodeId) {
  const config = loadConfig();
  const index = config.nodes.findIndex((n) => n.id === nodeId);

  if (index === -1) {
    console.error(`❌ 未找到节点: ${nodeId}`);
    process.exit(1);
  }

  const node = config.nodes[index];
  config.nodes.splice(index, 1);
  saveConfig(config);

  console.log(`✅ 已删除: ${node.name}`);
}

// 命令：init - 从模板初始化
async function cmdInit(template) {
  const templates = {
    fullstack: {
      name: "全栈应用",
      skills: [
        "canvas-design",
        "mcp-builder",
        "test-driven-development",
        "using-git-worktrees",
      ],
      agents: ["frontend-dev", "backend-dev", "devops", "tester"],
    },
    frontend: {
      name: "前端应用",
      skills: ["canvas-design", "artifacts-builder", "test-driven-development"],
      agents: ["frontend-dev", "tester"],
    },
    backend: {
      name: "后端应用",
      skills: ["mcp-builder", "test-driven-development", "using-git-worktrees"],
      agents: ["backend-dev", "tester", "devops"],
    },
  };

  if (!template || !templates[template]) {
    console.error(`❌ 未知模板: ${template}`);
    console.log("\n可用的模板:");
    Object.keys(templates).forEach((t) => {
      console.log(`  - ${t}: ${templates[t].name}`);
    });
    process.exit(1);
  }

  const config = loadConfig();
  const tmpl = templates[template];

  console.log(`\n🚀 初始化 "${tmpl.name}" 模板...\n`);

  // 加载真实的 Skills
  const skillsData = await loadRealSkills();

  // 添加 Skills
  for (const skillId of tmpl.skills) {
    const skill = skillsData.skills.find((s) => s.id === skillId);
    if (skill) {
      const exists = config.nodes.find(
        (n) => n.type === "skill" && n.skillId === skillId
      );
      if (!exists) {
        config.nodes.push({
          id: `skill-${Date.now()}-${Math.random()}`,
          type: "skill",
          skillId: skill.id,
          name: skill.name,
          description: skill.description,
          enabled: true,
          category: skill.category,
          source: skill.source,
          position: { x: 100, y: 100 + config.nodes.length * 50 },
          connections: [],
        });
        console.log(`  ✓ 添加 Skill: ${skill.name}`);
      }
    }
  }

  // 添加 Agents
  for (const agentRole of tmpl.agents) {
    const agent = AGENTS[agentRole];
    if (agent) {
      const exists = config.nodes.find(
        (n) => n.type === "agent" && n.role === agentRole
      );
      if (!exists) {
        config.nodes.push({
          id: `agent-${Date.now()}-${Math.random()}`,
          type: "agent",
          role: agentRole,
          name: agent.name,
          specialization: agent.specialization,
          skills: agent.skills,
          enabled: true,
          position: { x: 600, y: 100 + config.nodes.length * 50 },
          connections: [],
        });
        console.log(`  ✓ 添加 Agent: ${agent.name}`);
      }
    }
  }

  saveConfig(config);
  console.log(`\n✅ 模板初始化完成`);
}

// 命令：help - 显示帮助
function cmdHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Canvas 配置 CLI 工具                          ║
║              使用真实的 skill-factory 数据                      ║
╚════════════════════════════════════════════════════════════════╝

命令:
  list                    列出当前配置
  add-skill <skill-id>    添加 Skill
  add-agent <agent-role>  添加 Agent
  enable <node-id>        启用节点
  disable <node-id>       禁用节点
  remove <node-id>        删除节点
  init <template>         从模板初始化
  help                    显示此帮助

可用的 Agents:
${Object.keys(AGENTS)
  .map((role) => `  - ${role}: ${AGENTS[role].name}`)
  .join("\n")}

可用的模板:
  - fullstack: 全栈应用
  - frontend: 前端应用
  - backend: 后端应用

示例:
  npm run canvas-config list
  npm run canvas-config add-skill canvas-design
  npm run canvas-config add-agent frontend-dev
  npm run canvas-config init fullstack

💡 使用 'npm run skills list' 查看所有可用的 Skills
💡 使用 'npm run skills search <关键词>' 搜索 Skills
`);
}

// 主函数
async function main() {
  if (!command || command === "help") {
    cmdHelp();
    return;
  }

  if (command === "list") {
    cmdList();
  } else if (command === "add-skill") {
    await cmdAddSkill(subcommand);
  } else if (command === "add-agent") {
    cmdAddAgent(subcommand);
  } else if (command === "enable") {
    cmdToggle(subcommand, true);
  } else if (command === "disable") {
    cmdToggle(subcommand, false);
  } else if (command === "remove") {
    cmdRemove(subcommand);
  } else if (command === "init") {
    await cmdInit(subcommand);
  } else {
    console.error(`❌ 未知命令: ${command}`);
    cmdHelp();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 错误:", error.message);
  process.exit(1);
});
