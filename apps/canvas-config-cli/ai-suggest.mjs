#!/usr/bin/env node

/**
 * AI 智能配置建议工具
 * 使用真实的 skill-factory 数据
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  loadSkillsFromFactory,
  getSkillFactoryPath,
} from "@onecompany/core";

const rl = createInterface({ input, output });

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

// Agents 定义（真实可用的）
const AGENTS = {
  "product-manager": {
    name: "产品经理",
    skills: ["brainstorming", "writing-plans"],
    keywords: ["产品", "需求", "规划", "prd", "product"],
  },
  "architect": {
    name: "架构师",
    skills: ["architecture-design", "system-design"],
    keywords: ["架构", "设计", "architecture", "系统设计"],
  },
  "frontend-dev": {
    name: "前端开发工程师",
    skills: ["canvas-design", "artifacts-builder"],
    keywords: ["前端", "react", "vue", "界面", "ui", "frontend"],
  },
  "backend-dev": {
    name: "后端开发工程师",
    skills: ["mcp-builder"],
    keywords: ["后端", "api", "数据库", "服务", "backend", "server"],
  },
  "fullstack-dev": {
    name: "全栈开发工程师",
    skills: ["canvas-design", "mcp-builder"],
    keywords: ["全栈", "fullstack"],
  },
  "devops": {
    name: "DevOps 工程师",
    skills: ["using-git-worktrees"],
    keywords: ["devops", "部署", "运维", "docker", "ci", "cd"],
  },
  "tester": {
    name: "测试工程师",
    skills: ["test-driven-development", "systematic-debugging"],
    keywords: ["测试", "qa", "质量", "test", "debug"],
  },
  "spec-reviewer": {
    name: "规格审查员",
    skills: ["verification-before-completion"],
    keywords: ["审查", "review", "验证"],
  },
  "code-reviewer": {
    name: "代码审查员",
    skills: ["requesting-code-review"],
    keywords: ["代码审查", "code review"],
  },
};

// AI 分析需求并推荐配置
async function analyzeRequirements(requirements) {
  const lowerReq = requirements.toLowerCase();
  const recommendedSkills = [];
  const recommendedAgents = [];

  // 加载真实的 Skills
  const skillsData = await loadRealSkills();

  // 分析需要的 Skills（基于描述和名称匹配）
  for (const skill of skillsData.skills) {
    const skillText = `${skill.name} ${skill.description}`.toLowerCase();

    // 简单的关键词匹配
    const keywords = [
      ...skill.name.toLowerCase().split(/\s+/),
      ...skill.description.toLowerCase().split(/\s+/).slice(0, 10),
    ];

    const matches = keywords.some((keyword) => {
      if (keyword.length < 3) return false; // 忽略太短的词
      return lowerReq.includes(keyword);
    });

    if (matches) {
      recommendedSkills.push(skill.id);
    }
  }

  // 如果没有匹配到，使用类别匹配
  if (recommendedSkills.length === 0) {
    // 前端关键词
    if (/前端|frontend|react|vue|ui|界面|页面/.test(lowerReq)) {
      const frontendSkills = skillsData.byCategory.frontend || [];
      recommendedSkills.push(...frontendSkills.slice(0, 5).map((s) => s.id));
    }

    // 后端关键词
    if (/后端|backend|api|数据库|服务|server/.test(lowerReq)) {
      const backendSkills = skillsData.byCategory.backend || [];
      recommendedSkills.push(...backendSkills.slice(0, 5).map((s) => s.id));
    }

    // 测试关键词
    if (/测试|test|qa|质量/.test(lowerReq)) {
      const testingSkills = skillsData.byCategory.testing || [];
      recommendedSkills.push(...testingSkills.slice(0, 3).map((s) => s.id));
    }

    // DevOps 关键词
    if (/部署|deploy|docker|ci|cd|devops/.test(lowerReq)) {
      const devopsSkills = skillsData.byCategory.devops || [];
      recommendedSkills.push(...devopsSkills.slice(0, 3).map((s) => s.id));
    }
  }

  // 去重
  const uniqueSkills = [...new Set(recommendedSkills)];

  // 分析需要的 Agents
  for (const [agentRole, agent] of Object.entries(AGENTS)) {
    const matches = agent.keywords.some((keyword) =>
      lowerReq.includes(keyword)
    );
    if (matches) {
      recommendedAgents.push(agentRole);
    }
  }

  // 智能补充：如果有前端和后端，推荐 DevOps
  const hasFrontend = uniqueSkills.some((id) => {
    const skill = skillsData.skills.find((s) => s.id === id);
    return skill && skill.category === "frontend";
  });

  const hasBackend = uniqueSkills.some((id) => {
    const skill = skillsData.skills.find((s) => s.id === id);
    return skill && skill.category === "backend";
  });

  if (hasFrontend && hasBackend) {
    if (!recommendedAgents.includes("devops")) {
      recommendedAgents.push("devops");
    }
  }

  // 如果有开发，推荐测试
  if (recommendedAgents.some((a) => a.includes("dev"))) {
    if (!recommendedAgents.includes("tester")) {
      recommendedAgents.push("tester");
    }
  }

  return {
    recommendedSkills: uniqueSkills.slice(0, 10), // 限制最多 10 个
    recommendedAgents,
    skillsData,
  };
}

// 生成配置
async function generateConfig(requirements) {
  const analysis = await analyzeRequirements(requirements);

  const config = {
    version: "1.0.0",
    project: {
      id: "project-1",
      type: "project",
      name: path.basename(cwd),
      path: cwd,
      activeSkills: analysis.recommendedSkills,
      activeAgents: analysis.recommendedAgents,
      position: { x: 400, y: 300 },
    },
    nodes: [],
    connections: [],
  };

  // 添加推荐的 Skills
  for (const skillId of analysis.recommendedSkills) {
    const skill = analysis.skillsData.skills.find((s) => s.id === skillId);
    if (skill) {
      config.nodes.push({
        id: `skill-${Date.now()}-${Math.random()}`,
        type: "skill",
        skillId: skill.id,
        name: skill.name,
        description: skill.description,
        enabled: true,
        category: skill.category,
        source: skill.source,
        position: { x: 100, y: 100 + config.nodes.length * 80 },
        connections: [],
      });
    }
  }

  // 添加推荐的 Agents
  for (const agentRole of analysis.recommendedAgents) {
    const agent = AGENTS[agentRole];
    if (agent) {
      config.nodes.push({
        id: `agent-${Date.now()}-${Math.random()}`,
        type: "agent",
        role: agentRole,
        name: agent.name,
        specialization: agent.name,
        skills: agent.skills,
        enabled: true,
        position: { x: 600, y: 100 + config.nodes.length * 80 },
        connections: [],
      });
    }
  }

  return { config, analysis };
}

// 保存配置
function saveConfig(config) {
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

// 主函数
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  AI 智能配置建议工具                            ║
║              使用真实的 skill-factory 数据                      ║
╚════════════════════════════════════════════════════════════════╝
`);

  console.log("📂 当前项目:", path.basename(cwd));
  console.log("📍 路径:", cwd);
  console.log("");

  // 询问项目需求
  const requirements = await rl.question(
    "请描述你的项目需求（例如：开发一个全栈 Web 应用，包含用户认证和数据可视化）:\n> "
  );

  if (!requirements.trim()) {
    console.log("❌ 需求不能为空");
    rl.close();
    process.exit(1);
  }

  console.log("\n🤖 AI 正在分析需求...\n");

  // 生成配置
  const { config, analysis } = await generateConfig(requirements);

  // 显示推荐结果
  console.log("✅ 分析完成！推荐配置如下:\n");

  console.log(`🔧 推荐的 Skills (${analysis.recommendedSkills.length} 个):`);
  for (const skillId of analysis.recommendedSkills) {
    const skill = analysis.skillsData.skills.find((s) => s.id === skillId);
    if (skill) {
      console.log(`  • ${skill.name} [${skill.category}]`);
      console.log(`    ${skill.description.substring(0, 60)}...`);
    }
  }

  console.log(`\n👥 推荐的 Agents (${analysis.recommendedAgents.length} 个):`);
  for (const agentRole of analysis.recommendedAgents) {
    const agent = AGENTS[agentRole];
    if (agent) {
      console.log(`  • ${agent.name} (${agentRole})`);
      console.log(`    技能: ${agent.skills.join(", ")}`);
    }
  }

  console.log("");

  // 询问是否保存
  const confirm = await rl.question("是否保存此配置？(y/n): ");

  if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
    saveConfig(config);
    console.log(`\n✅ 配置已保存到: ${configPath}`);
    console.log("\n💡 下一步:");
    console.log("  1. 运行 'npm run canvas' 在可视化界面查看配置");
    console.log("  2. 运行 'npm run canvas-config list' 查看配置详情");
    console.log("  3. 运行 'npm run onecompany' 开始使用 Agent 协作模式");
  } else {
    console.log("\n❌ 已取消保存");
  }

  rl.close();
}

main().catch((error) => {
  console.error("❌ 错误:", error.message);
  rl.close();
  process.exit(1);
});
