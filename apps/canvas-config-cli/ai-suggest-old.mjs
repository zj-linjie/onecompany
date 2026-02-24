#!/usr/bin/env node

/**
 * AI 智能配置建议工具
 * 根据项目需求自动生成 Canvas 配置
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });

// 获取当前工作目录
const cwd = process.cwd();
const configDir = path.join(cwd, ".onecompany");
const configPath = path.join(configDir, "canvas-config.json");

// Skills 和 Agents 定义
const SKILLS = {
  "react-dev": { name: "React 开发", category: "frontend", keywords: ["react", "前端", "ui", "界面"] },
  "vue-dev": { name: "Vue 开发", category: "frontend", keywords: ["vue", "前端"] },
  "api-development": { name: "API 开发", category: "backend", keywords: ["api", "接口", "后端", "服务"] },
  "database-design": { name: "数据库设计", category: "backend", keywords: ["数据库", "db", "存储", "mysql", "postgres"] },
  "ui-design": { name: "UI/UX 设计", category: "design", keywords: ["设计", "ui", "ux", "界面", "用户体验"] },
  "unit-testing": { name: "单元测试", category: "testing", keywords: ["测试", "test", "质量"] },
  "authentication": { name: "身份认证", category: "security", keywords: ["认证", "登录", "auth", "jwt", "oauth"] },
  "state-management": { name: "状态管理", category: "frontend", keywords: ["状态", "redux", "zustand"] },
  "docker": { name: "Docker", category: "devops", keywords: ["docker", "容器", "部署"] },
  "ci-cd": { name: "CI/CD", category: "devops", keywords: ["ci", "cd", "持续集成", "部署"] },
  "graphql": { name: "GraphQL", category: "backend", keywords: ["graphql", "api"] },
  "responsive-layout": { name: "响应式布局", category: "frontend", keywords: ["响应式", "移动端", "适配"] },
};

const AGENTS = {
  "frontend-dev": {
    name: "前端开发工程师",
    skills: ["react-dev", "ui-design", "state-management"],
    keywords: ["前端", "react", "vue", "界面"]
  },
  "backend-dev": {
    name: "后端开发工程师",
    skills: ["api-development", "database-design", "authentication"],
    keywords: ["后端", "api", "数据库", "服务"]
  },
  "fullstack-dev": {
    name: "全栈开发工程师",
    skills: ["api-development", "react-dev", "database-design"],
    keywords: ["全栈", "fullstack"]
  },
  "devops": {
    name: "DevOps 工程师",
    skills: ["docker", "ci-cd"],
    keywords: ["devops", "部署", "运维", "docker"]
  },
  "tester": {
    name: "测试工程师",
    skills: ["unit-testing"],
    keywords: ["测试", "qa", "质量"]
  },
  "designer": {
    name: "UI/UX 设计师",
    skills: ["ui-design"],
    keywords: ["设计", "ui", "ux"]
  },
};

// AI 分析需求并推荐配置
function analyzeRequirements(requirements) {
  const lowerReq = requirements.toLowerCase();
  const recommendedSkills = [];
  const recommendedAgents = [];

  // 分析需要的 Skills
  for (const [skillId, skill] of Object.entries(SKILLS)) {
    const matches = skill.keywords.some(keyword => lowerReq.includes(keyword));
    if (matches) {
      recommendedSkills.push(skillId);
    }
  }

  // 分析需要的 Agents
  for (const [agentRole, agent] of Object.entries(AGENTS)) {
    const matches = agent.keywords.some(keyword => lowerReq.includes(keyword));
    if (matches) {
      recommendedAgents.push(agentRole);
    }
  }

  // 智能推荐：如果有前端和后端，推荐 DevOps
  if (recommendedSkills.some(s => SKILLS[s].category === "frontend") &&
      recommendedSkills.some(s => SKILLS[s].category === "backend")) {
    if (!recommendedAgents.includes("devops")) {
      recommendedAgents.push("devops");
    }
    if (!recommendedSkills.includes("docker")) {
      recommendedSkills.push("docker");
    }
  }

  // 智能推荐：如果有 API 开发，推荐数据库
  if (recommendedSkills.includes("api-development") &&
      !recommendedSkills.includes("database-design")) {
    recommendedSkills.push("database-design");
  }

  // 智能推荐：如果有开发，推荐测试
  if (recommendedSkills.length > 0 && !recommendedAgents.includes("tester")) {
    recommendedAgents.push("tester");
    if (!recommendedSkills.includes("unit-testing")) {
      recommendedSkills.push("unit-testing");
    }
  }

  return { recommendedSkills, recommendedAgents };
}

// 生成配置
function generateConfig(skills, agents) {
  const config = {
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

  // 添加 Skills
  skills.forEach((skillId, index) => {
    const skill = SKILLS[skillId];
    config.nodes.push({
      id: `skill-${index + 1}`,
      type: "skill",
      skillId,
      name: skill.name,
      description: `${skill.name}相关技能`,
      enabled: true,
      position: { x: 100, y: 150 + index * 130 },
      connections: [],
    });
  });

  // 添加 Agents
  agents.forEach((agentRole, index) => {
    const agent = AGENTS[agentRole];
    config.nodes.push({
      id: `agent-${index + 1}`,
      type: "agent",
      role: agentRole,
      name: agent.name,
      skills: agent.skills,
      enabled: true,
      position: { x: 700, y: 150 + index * 130 },
      specialization: `${agent.name}专家`,
    });
  });

  return config;
}

// 主函数
async function main() {
  console.log("\n🤖 === AI 智能配置建议 ===\n");
  console.log("我会根据你的项目需求，自动推荐合适的 Skills 和 Agents。\n");

  // 获取项目需求
  const requirements = await rl.question("请描述你的项目需求（例如：开发一个全栈 Web 应用，包含用户登录、数据管理等功能）:\n> ");

  if (!requirements.trim()) {
    console.log("❌ 需求不能为空");
    rl.close();
    return;
  }

  console.log("\n🔍 正在分析需求...\n");

  // AI 分析
  const { recommendedSkills, recommendedAgents } = analyzeRequirements(requirements);

  // 显示推荐
  console.log("📊 AI 推荐配置：\n");

  console.log(`🔧 推荐的 Skills (${recommendedSkills.length} 个):`);
  recommendedSkills.forEach(skillId => {
    console.log(`  ✓ ${SKILLS[skillId].name} (${skillId})`);
  });

  console.log(`\n👥 推荐的 Agents (${recommendedAgents.length} 个):`);
  recommendedAgents.forEach(agentRole => {
    const agent = AGENTS[agentRole];
    console.log(`  ✓ ${agent.name} (${agentRole})`);
    console.log(`     技能: ${agent.skills.map(s => SKILLS[s]?.name || s).join(", ")}`);
  });

  // 确认
  const confirm = await rl.question("\n是否应用此配置？(y/n) [y]: ");

  if (confirm.toLowerCase() === "n") {
    console.log("❌ 已取消");
    rl.close();
    return;
  }

  // 生成并保存配置
  const config = generateConfig(recommendedSkills, recommendedAgents);

  // 确保目录存在
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

  console.log(`\n✅ 配置已保存到: ${configPath}`);
  console.log("\n💡 下一步：");
  console.log("   1. 查看配置: canvas-config list");
  console.log("   2. 在 Canvas 中查看: cd packages/canvas-app && npm run dev");
  console.log("   3. 运行 Agent 模式: npm run onecompany");
  console.log("      选择 '4. Agent 协作模式'\n");

  rl.close();
}

main().catch(error => {
  console.error("❌ 错误:", error.message);
  process.exit(1);
});
