#!/usr/bin/env node

/**
 * Canvas 配置 CLI 工具
 * 快速配置 Skills 和 Agents
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];
const value = args[2];

// 获取当前工作目录
const cwd = process.cwd();
const configDir = path.join(cwd, ".onecompany");
const configPath = path.join(configDir, "canvas-config.json");

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

// 预定义的 Skills
const SKILLS = {
  "react-dev": {
    name: "React 开发",
    description: "现代 React 开发，Hooks、TypeScript、性能优化",
  },
  "api-development": {
    name: "API 开发",
    description: "RESTful API 设计与实现，包括接口规范、版本控制",
  },
  "database-design": {
    name: "数据库设计",
    description: "SQL 和 NoSQL 数据库架构设计，性能优化",
  },
  "ui-design": {
    name: "UI/UX 设计",
    description: "用户界面和体验设计，交互原型，可用性测试",
  },
  "unit-testing": {
    name: "单元测试",
    description: "Jest、Vitest 等测试框架，TDD 实践",
  },
  "authentication": {
    name: "身份认证",
    description: "JWT、OAuth 等认证方案，安全加密实现",
  },
  "state-management": {
    name: "状态管理",
    description: "Redux、Zustand 等状态管理方案和最佳实践",
  },
  "docker": {
    name: "Docker",
    description: "容器化部署，Docker Compose 编排",
  },
  "ci-cd": {
    name: "CI/CD",
    description: "持续集成和部署，GitHub Actions、Jenkins",
  },
};

// 预定义的 Agents
const AGENTS = {
  "frontend-dev": {
    name: "前端开发工程师",
    specialization: "React 和 UI/UX 专家",
    skills: ["react-dev", "ui-design", "state-management"],
  },
  "backend-dev": {
    name: "后端开发工程师",
    specialization: "API 和数据库专家",
    skills: ["api-development", "database-design", "authentication"],
  },
  "fullstack-dev": {
    name: "全栈开发工程师",
    specialization: "端到端全栈开发",
    skills: ["api-development", "react-dev", "database-design"],
  },
  devops: {
    name: "DevOps 工程师",
    specialization: "CI/CD 和基础设施",
    skills: ["docker", "ci-cd"],
  },
  tester: {
    name: "测试工程师",
    specialization: "质量保证专家",
    skills: ["unit-testing", "integration-testing", "e2e-testing"],
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
function cmdAddSkill(skillId) {
  if (!skillId || !SKILLS[skillId]) {
    console.error(`❌ 未知的 Skill: ${skillId}`);
    console.log("\n可用的 Skills:");
    Object.keys(SKILLS).forEach((id) => {
      console.log(`  - ${id}: ${SKILLS[id].name}`);
    });
    process.exit(1);
  }

  const config = loadConfig();
  const skill = SKILLS[skillId];

  // 检查是否已存在
  const exists = config.nodes.find(
    (n) => n.type === "skill" && n.skillId === skillId
  );
  if (exists) {
    console.log(`⚠️  Skill "${skill.name}" 已存在`);
    return;
  }

  // 添加 Skill
  const newSkill = {
    id: `skill-${Date.now()}`,
    type: "skill",
    skillId,
    name: skill.name,
    description: skill.description,
    enabled: true,
    position: { x: 100, y: 100 + config.nodes.length * 50 },
    connections: [],
  };

  config.nodes.push(newSkill);
  saveConfig(config);

  console.log(`✅ 已添加 Skill: ${skill.name}`);
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

  // 检查是否已存在
  const exists = config.nodes.find(
    (n) => n.type === "agent" && n.role === agentRole
  );
  if (exists) {
    console.log(`⚠️  Agent "${agent.name}" 已存在`);
    return;
  }

  // 添加 Agent
  const newAgent = {
    id: `agent-${Date.now()}`,
    type: "agent",
    role: agentRole,
    name: agent.name,
    skills: agent.skills,
    enabled: true,
    position: { x: 700, y: 100 + config.nodes.length * 50 },
    specialization: agent.specialization,
  };

  config.nodes.push(newAgent);
  saveConfig(config);

  console.log(`✅ 已添加 Agent: ${agent.name}`);
}

// 命令：enable/disable - 启用/禁用节点
function cmdToggle(nodeId, enable) {
  const config = loadConfig();

  // 查找节点
  let node = config.nodes.find((n) => n.id === nodeId);

  // 如果没找到，尝试通过 skillId 或 role 查找
  if (!node) {
    node = config.nodes.find(
      (n) =>
        (n.type === "skill" && n.skillId === nodeId) ||
        (n.type === "agent" && n.role === nodeId)
    );
  }

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

  const index = config.nodes.findIndex(
    (n) =>
      n.id === nodeId ||
      (n.type === "skill" && n.skillId === nodeId) ||
      (n.type === "agent" && n.role === nodeId)
  );

  if (index === -1) {
    console.error(`❌ 未找到节点: ${nodeId}`);
    process.exit(1);
  }

  const node = config.nodes[index];
  config.nodes.splice(index, 1);
  saveConfig(config);

  console.log(`✅ 已删除: ${node.name}`);
}

// 命令：init - 初始化配置
function cmdInit(template) {
  const config = loadConfig();

  if (template === "fullstack") {
    // 全栈模板
    cmdAddSkill("react-dev");
    cmdAddSkill("api-development");
    cmdAddSkill("database-design");
    cmdAddSkill("authentication");
    cmdAddAgent("frontend-dev");
    cmdAddAgent("backend-dev");
    cmdAddAgent("devops");
    console.log("\n✅ 已初始化全栈项目配置");
  } else if (template === "frontend") {
    // 前端模板
    cmdAddSkill("react-dev");
    cmdAddSkill("ui-design");
    cmdAddSkill("state-management");
    cmdAddAgent("frontend-dev");
    console.log("\n✅ 已初始化前端项目配置");
  } else if (template === "backend") {
    // 后端模板
    cmdAddSkill("api-development");
    cmdAddSkill("database-design");
    cmdAddSkill("authentication");
    cmdAddAgent("backend-dev");
    cmdAddAgent("devops");
    console.log("\n✅ 已初始化后端项目配置");
  } else {
    console.error("❌ 未知的模板类型");
    console.log("\n可用的模板:");
    console.log("  - fullstack: 全栈项目");
    console.log("  - frontend: 前端项目");
    console.log("  - backend: 后端项目");
    process.exit(1);
  }
}

// 显示帮助
function showHelp() {
  console.log(`
Canvas 配置 CLI 工具

用法:
  canvas-config <command> [options]

命令:
  list                          列出当前配置
  add-skill <skill-id>          添加 Skill
  add-agent <agent-role>        添加 Agent
  enable <node-id>              启用节点
  disable <node-id>             禁用节点
  remove <node-id>              删除节点
  init <template>               从模板初始化配置

示例:
  canvas-config list
  canvas-config add-skill react-dev
  canvas-config add-agent frontend-dev
  canvas-config enable frontend-dev
  canvas-config disable react-dev
  canvas-config remove frontend-dev
  canvas-config init fullstack

可用的 Skills:
${Object.keys(SKILLS)
  .map((id) => `  - ${id}: ${SKILLS[id].name}`)
  .join("\n")}

可用的 Agents:
${Object.keys(AGENTS)
  .map((role) => `  - ${role}: ${AGENTS[role].name}`)
  .join("\n")}

可用的模板:
  - fullstack: 全栈项目（React + API + 数据库）
  - frontend: 前端项目（React + UI）
  - backend: 后端项目（API + 数据库）
`);
}

// 主函数
function main() {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    showHelp();
    return;
  }

  switch (command) {
    case "list":
      cmdList();
      break;
    case "add-skill":
      cmdAddSkill(subcommand);
      break;
    case "add-agent":
      cmdAddAgent(subcommand);
      break;
    case "enable":
      cmdToggle(subcommand, true);
      break;
    case "disable":
      cmdToggle(subcommand, false);
      break;
    case "remove":
      cmdRemove(subcommand);
      break;
    case "init":
      cmdInit(subcommand);
      break;
    default:
      console.error(`❌ 未知命令: ${command}`);
      console.log("\n运行 'canvas-config help' 查看帮助");
      process.exit(1);
  }
}

main();
